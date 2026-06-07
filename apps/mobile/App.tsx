/* eslint-disable jsx-a11y/alt-text, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ClerkProvider, useAuth, useClerk, useSSO, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  Vibration,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getApiBaseUrl, deleteMobileCustomSideQuest, fetchMobileAccountState, fetchMobileBootstrap, runMobileGroupQuestAction, runMobileQuestAction, saveMobileCustomSideQuest, submitMobileSupportMessage, updateMobileChessUsernames } from "./src/api/sqc";
import { clerkPublishableKey, clerkTokenCache, isClerkMobileAuthConfigured } from "./src/auth/clerk";
import { OFFLINE_MOBILE_BOOTSTRAP } from "./src/data/offlineBootstrap";
import type { MobileAccountResponse, MobileAccountState, MobileBootstrap, MobileChallenge, MobileCustomSideQuest, MobileGroupQuestSummary, MobileSupportMessage } from "./src/types/sqc";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "officialLeaderboards" | "coatOfArms" | "account";

type HelpTopic = "activeSolo" | "solo" | "proof" | "coat" | "multiplayerDetail" | "multiplayer" | "accounts";

const HELP_TOPICS: Record<HelpTopic, { title: string; body: string }> = {
  activeSolo: {
    title: "This active Side Quest card",
    body: "This card shows the Side Quest you are trying now. Play a new public game on your connected Lichess or Chess.com account after picking it, then come back and check proof.",
  },
  solo: {
    title: "Choosing a Solo Side Quest",
    body: "This screen is for picking your next solo challenge. Only one Solo Side Quest can be active at a time, and games count after you pick it.",
  },
  proof: {
    title: "Proof checks",
    body: "SQC checks your latest public games after you picked the Side Quest. If a game does not verify, make sure it is public, finished, on the connected username, and matches the Side Quest rule.",
  },
  coat: {
    title: "Coat of Arms",
    body: "Completing a Side Quest unlocks its Coat of Arms. Your unlocked coats stay in your account and can be opened from the Trophy Cabinet.",
  },
  multiplayerDetail: {
    title: "This Multiplayer Side Quest",
    body: "This page shows the Multiplayer Side Quest window, included Side Quests, players, and leaderboard. Join while it is open, play matching public games during the time window, then refresh proof to update your score.",
  },
  multiplayer: {
    title: "Multiplayer Side Quests",
    body: "Browse shared Multiplayer Side Quests, create your own, or join official Multiplayer Side Quests. Multiplayer progress is scored separately from your Solo Side Quest.",
  },
  accounts: {
    title: "Chess accounts",
    body: "Add your public Lichess or Chess.com username so SQC knows which games to check. SQC only reads public game records.",
  },
};

const MULTIPLAYER_PROVIDER_MODES = [
  { id: "both", label: "Lichess or Chess.com" },
  { id: "lichess", label: "Lichess only" },
  { id: "chesscom", label: "Chess.com only" },
] as const;

const MULTIPLAYER_RULE_OPTIONS = {
  timeControl: ["Any time control", "Bullet", "Blitz", "Rapid", "Classical"],
  rated: ["Any rated state", "Rated only", "Casual only"],
  color: ["Any color", "White only", "Black only"],
} as const;

const CUSTOM_RULE_PIECES = ["king", "queen", "rook", "bishop", "knight", "pawn"] as const;
const CUSTOM_RULE_OWNERS = ["my", "opponent"] as const;
const CUSTOM_RULE_CONDITIONS = ["gone", "still on board", "moved", "not moved", "on square", "move sequence", "opening sequence", "game result"] as const;
const CUSTOM_RULE_TIMINGS = ["by move", "at move", "at game end"] as const;
const CUSTOM_RULE_QUANTIFIERS = ["any one", "at least", "exactly", "all"] as const;
const CUSTOM_RULE_LOGICS = ["all", "any"] as const;
const CUSTOM_RULE_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const CUSTOM_RULE_RESULTS = ["win", "draw", "lose"] as const;

type CustomRulePiece = typeof CUSTOM_RULE_PIECES[number];
type CustomRuleOwner = typeof CUSTOM_RULE_OWNERS[number];
type CustomRuleCondition = typeof CUSTOM_RULE_CONDITIONS[number];
type CustomRuleTiming = typeof CUSTOM_RULE_TIMINGS[number];
type CustomRuleQuantifier = typeof CUSTOM_RULE_QUANTIFIERS[number];
type CustomRuleLogic = typeof CUSTOM_RULE_LOGICS[number];
type CustomRuleResult = typeof CUSTOM_RULE_RESULTS[number];
type CustomRuleRequirement = {
  id: string;
  piece: CustomRulePiece;
  owner: CustomRuleOwner;
  condition: CustomRuleCondition;
  timing: CustomRuleTiming;
  moveNumber: number;
  quantifier: CustomRuleQuantifier;
  count: number;
  identity: string;
  targetSquare: string;
  moveSequence: string;
  openingSequence: string;
  result: CustomRuleResult;
  negated: boolean;
};

type CustomLibraryQuest = {
  id: string;
  name: string;
  summary: string;
  config: string;
  visibility?: "private" | "public";
  lifecycle?: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
  creatorName?: string;
  ownedByYou?: boolean;
  badgeImageUrl?: string | null;
  stats?: MobileCustomSideQuest["stats"];
};

type CommunityBrowseView = "discover" | "mine";
type CommunityBrowseFilter = "all" | "popular" | "new" | "completed";
type CommunityBrowseSort = "popular" | "newest" | "az";
type CustomLibraryFilter = "all" | "published" | "drafts" | "public" | "archived";
type MultiplayerCommunityFilter = "open" | "all" | "joined" | "hosted" | "finished";
type MultiplayerCommunitySort = "closing" | "newest" | "players";

const MULTIPLAYER_DEFAULT_INVITE_COPY = "A Multiplayer Side Quest where everyone tries the same Side Quests with fresh public games.";
const SQC_WEB_BASE_URL = getApiBaseUrl();


const MOBILE_CHESS_PIECES: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};
const MOBILE_CHESS_START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type MobileBoardSquare = { square: string; piece?: string; highlight?: boolean; fileLabel?: string; rankLabel?: string };

function parseMobileFenBoard(fen?: string | null, highlightUci?: string | null, orientation: "white" | "black" = "white"): MobileBoardSquare[] | null {
  const placement = fen?.trim().split(/\s+/)[0];
  if (!placement) return null;
  const ranks = placement.split("/");
  if (ranks.length !== 8) return null;

  const highlights = new Set<string>();
  if (highlightUci && /^[a-h][1-8][a-h][1-8]/i.test(highlightUci)) {
    highlights.add(highlightUci.slice(0, 2).toLowerCase());
    highlights.add(highlightUci.slice(2, 4).toLowerCase());
  }

  const boardBySquare = new Map<string, MobileBoardSquare>();
  for (let rankIndex = 0; rankIndex < ranks.length; rankIndex += 1) {
    let fileIndex = 0;
    for (const token of ranks[rankIndex]) {
      if (/\d/.test(token)) {
        for (let offset = 0; offset < Number(token); offset += 1) {
          const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
          boardBySquare.set(square, { square, highlight: highlights.has(square) });
          fileIndex += 1;
        }
        continue;
      }
      if (!MOBILE_CHESS_PIECES[token]) return null;
      const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
      boardBySquare.set(square, { square, piece: token, highlight: highlights.has(square) });
      fileIndex += 1;
    }
    if (fileIndex !== 8) return null;
  }

  const files = orientation === "black" ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
  const displayRanks = orientation === "black" ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const displayBoard = displayRanks.flatMap((rank, rankDisplayIndex) =>
    files.map((file, fileDisplayIndex) => {
      const square = `${file}${rank}`;
      const item = boardBySquare.get(square);
      if (!item) return null;
      return {
        ...item,
        rankLabel: fileDisplayIndex === 0 ? String(rank) : undefined,
        fileLabel: rankDisplayIndex === 7 ? file : undefined,
      };
    }),
  );

  return displayBoard.every(Boolean) ? displayBoard as MobileBoardSquare[] : null;
}

function isFailedReceipt(receipt?: MobileAccountState["latestReceipt"] | null) {
  return receipt?.status === "failed" || receipt?.headline?.toLowerCase().includes("failed") === true;
}


function isPendingReceipt(receipt?: MobileAccountState["latestReceipt"] | null) {
  return Boolean(receipt && receipt.status !== "passed" && !isFailedReceipt(receipt));
}

function getReceiptFailureText(receipt?: MobileAccountState["latestReceipt"] | null) {
  if (!receipt || !isFailedReceipt(receipt)) return null;
  const diagnosticText = receipt.failureDiagnostic?.explanation?.trim();
  const detailText = receipt.detail?.trim();
  const text = diagnosticText && !isGenericBoardDiagnostic(diagnosticText) ? diagnosticText : detailText || diagnosticText;
  if (!text) return "That game did not match this Side Quest goal. Try again after your next public game.";
  return text.replace(/latest game checked\s*[—-]\s*side quest not completed\.?/i, "That game did not match this Side Quest goal.");
}

function normalizeProofGameReference(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lichessMatch = trimmed.match(/lichess\.org\/(?:game\/)?([A-Za-z0-9]{8,12})/i);
  if (lichessMatch?.[1]) return lichessMatch[1];

  const chessComMatch = trimmed.match(/chess\.com\/game\/(?:live|daily)\/(\d+)/i);
  if (chessComMatch?.[1]) return trimmed;

  return trimmed;
}

function isGenericBoardDiagnostic(text: string) {
  return /final board from the same latest game/i.test(text) || /verified board attached to the completed quest/i.test(text);
}

function getCheckActionMessage(receipt?: MobileAccountState["latestReceipt"] | null) {
  if (!receipt) return "Latest-game check done.";
  if (receipt.status === "passed" || receipt.headline?.toLowerCase().includes("passed")) return "Quest completed.";
  if (isFailedReceipt(receipt)) return "That game did not match this Side Quest goal.";
  return "Latest-game check done.";
}

function getProofCheckDisplay(label: string, receipt?: MobileAccountState["latestReceipt"] | null) {
  if (label === "not yet") return "Not checked yet";
  if (receipt?.status === "passed" || receipt?.headline?.toLowerCase().includes("passed")) return `${label} · completed`;
  if (isFailedReceipt(receipt)) return label === "not yet" ? "Not checked yet · not completed" : `${label} · not completed`;
  return `${label} · no new eligible game found`;
}

function ActiveQuestMiniFailureBoard({ receipt }: { receipt: MobileAccountState["latestReceipt"] }) {
  const diagnostic = receipt?.failureDiagnostic;
  const fen = diagnostic?.fenAtBreak ?? receipt?.finalPositionFen;
  const uci = diagnostic?.uci ?? receipt?.lastMoveUci;
  const orientation = mobileBoardOrientation(diagnostic?.playerColor);
  const board = parseMobileFenBoard(fen, uci, orientation);

  if (!board) {
    return <ActiveQuestUnavailableMiniBoard />;
  }

  return (
    <View style={compactStyles.currentFailureMiniBoard}>
      {board.map((square, index) => (
        <View key={square.square} style={[compactStyles.currentFailureMiniSquare, (Math.floor(index / 8) + index) % 2 === 0 ? compactStyles.failureBoardSquareLight : compactStyles.failureBoardSquareDark, square.highlight ? compactStyles.failureBoardSquareHighlight : null]}>
          {square.highlight ? <View style={compactStyles.currentFailureMiniHighlightRing} /> : null}
          <Text style={[compactStyles.currentFailureMiniPiece, square.piece && square.piece === square.piece.toUpperCase() ? compactStyles.failureBoardPieceWhite : compactStyles.failureBoardPieceBlack]}>{square.piece ? MOBILE_CHESS_PIECES[square.piece] : ""}</Text>
        </View>
      ))}
    </View>
  );
}

function ActiveQuestUnavailableMiniBoard() {
  return (
    <View style={compactStyles.currentFailureMiniBoard}>
      {Array.from({ length: 64 }).map((_, index) => (
        <View key={`unavailable-${index}`} style={[compactStyles.currentFailureMiniSquare, (Math.floor(index / 8) + index) % 2 === 0 ? compactStyles.emptyBoardSquareLight : compactStyles.emptyBoardSquareDark]}>
          {index === 27 ? <MaterialCommunityIcons name="checkerboard" size={13} color="rgba(245,200,106,.5)" /> : null}
        </View>
      ))}
    </View>
  );
}

function ActiveQuestEmptyMiniBoard() {
  const board = parseMobileFenBoard(MOBILE_CHESS_START_FEN);

  return (
    <View style={compactStyles.currentProofIntegratedBoard}>
      {(board ?? []).map((square, index) => (
        <View key={square.square} style={[compactStyles.currentFailureMiniSquare, (Math.floor(index / 8) + index) % 2 === 0 ? compactStyles.failureBoardSquareLight : compactStyles.failureBoardSquareDark]}>
          <Text style={[compactStyles.currentProofMiniPiece, square.piece && square.piece === square.piece.toUpperCase() ? compactStyles.failureBoardPieceWhite : compactStyles.failureBoardPieceBlack]}>{square.piece ? MOBILE_CHESS_PIECES[square.piece] : ""}</Text>
        </View>
      ))}
    </View>
  );
}

function ActiveQuestNoGameSummary({ goal, pickedLabel, latestCheckLabel, statusLabel }: { goal?: string; pickedLabel?: string; latestCheckLabel?: string; statusLabel?: string }) {
  return (
    <View style={compactStyles.currentEmptyBoardPanel}>
      <ActiveQuestEmptyMiniBoard />
      <View style={compactStyles.currentProofTextBlock}>
        {goal ? <Text style={compactStyles.currentQuestMeta}><Text style={compactStyles.currentQuestMetaStrong}>Goal: </Text>{goal}</Text> : null}
        {pickedLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={1}><Text style={compactStyles.currentQuestMetaStrong}>Picked: </Text>{pickedLabel}</Text> : null}
        {latestCheckLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={2}><Text style={compactStyles.currentQuestMetaStrong}>Latest check: </Text>{latestCheckLabel}</Text> : null}
        {statusLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={1}><Text style={compactStyles.currentQuestMetaStrong}>Status: </Text><Text style={statusLabel === "Completed" ? compactStyles.currentQuestMetaGood : compactStyles.currentQuestMetaDanger}>{statusLabel}</Text></Text> : null}
        <Text style={compactStyles.currentEmptyBoardCopy} numberOfLines={4}>Starting position shown until your next public game is available. Play on Lichess or Chess.com, then come back and refresh proof.</Text>
      </View>
    </View>
  );
}


function ActiveQuestMiniProofBoard({ receipt, goal, pickedLabel, latestCheckLabel, statusLabel }: { receipt: MobileAccountState["latestReceipt"]; goal?: string; pickedLabel?: string; latestCheckLabel?: string; statusLabel?: string }) {
  const orientation = mobileBoardOrientation(receipt?.playerColor ?? receipt?.failureDiagnostic?.playerColor);
  const board = parseMobileFenBoard(receipt?.finalPositionFen, receipt?.lastMoveUci ?? undefined, orientation);

  if (!receipt || receipt.status !== "passed" || !board) return null;

  return (
    <View style={compactStyles.currentProofInlinePanel}>
      <View style={compactStyles.currentProofIntegratedBoard}>
        {board.map((square, index) => (
          <View key={square.square} style={[compactStyles.currentFailureMiniSquare, (Math.floor(index / 8) + index) % 2 === 0 ? compactStyles.failureBoardSquareLight : compactStyles.failureBoardSquareDark, square.highlight ? compactStyles.currentProofMiniSquareHighlight : null]}>
            {square.highlight ? <View style={compactStyles.currentProofMiniHighlightDot} /> : null}
            <Text style={[compactStyles.currentProofMiniPiece, square.piece && square.piece === square.piece.toUpperCase() ? compactStyles.failureBoardPieceWhite : compactStyles.failureBoardPieceBlack]}>{square.piece ? MOBILE_CHESS_PIECES[square.piece] : ""}</Text>
          </View>
        ))}
      </View>
      <View style={compactStyles.currentProofTextBlock}>
        {goal ? <Text style={compactStyles.currentQuestMeta}><Text style={compactStyles.currentQuestMetaStrong}>Goal: </Text>{goal}</Text> : null}
        {pickedLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={1}><Text style={compactStyles.currentQuestMetaStrong}>Picked: </Text>{pickedLabel}</Text> : null}
        {latestCheckLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={2}><Text style={compactStyles.currentQuestMetaStrong}>Latest check: </Text>{latestCheckLabel}</Text> : null}
        {statusLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={1}><Text style={compactStyles.currentQuestMetaStrong}>Status: </Text><Text style={statusLabel === "Completed" ? compactStyles.currentQuestMetaGood : compactStyles.currentQuestMetaDanger}>{statusLabel}</Text></Text> : null}
        <Text style={compactStyles.currentFailureCopy} numberOfLines={3}>{receipt.lastMoveSan || receipt.lastMoveUci ? `Final position · ${receipt.lastMoveSan ?? receipt.lastMoveUci}` : "Final verified chess position from the completed Side Quest."}</Text>
      </View>
    </View>
  );
}

function ActiveQuestFailureSummary({ receipt, goal, pickedLabel, latestCheckLabel, statusLabel }: { receipt: MobileAccountState["latestReceipt"]; goal?: string; pickedLabel?: string; latestCheckLabel?: string; statusLabel?: string }) {
  const failureText = getReceiptFailureText(receipt);
  if (!failureText) return null;

  return (
    <View style={compactStyles.currentFailurePanel}>
      <ActiveQuestMiniFailureBoard receipt={receipt} />
      <View style={compactStyles.currentProofTextBlock}>
        {goal ? <Text style={compactStyles.currentQuestMeta}><Text style={compactStyles.currentQuestMetaStrong}>Goal: </Text>{goal}</Text> : null}
        {pickedLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={1}><Text style={compactStyles.currentQuestMetaStrong}>Picked: </Text>{pickedLabel}</Text> : null}
        {latestCheckLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={2}><Text style={compactStyles.currentQuestMetaStrong}>Latest check: </Text>{latestCheckLabel}</Text> : null}
        {statusLabel ? <Text style={compactStyles.currentQuestMeta} numberOfLines={1}><Text style={compactStyles.currentQuestMetaStrong}>Status: </Text><Text style={statusLabel === "Completed" ? compactStyles.currentQuestMetaGood : compactStyles.currentQuestMetaDanger}>{statusLabel}</Text></Text> : null}
        <Text style={compactStyles.currentFailureCopy} numberOfLines={3}>{failureText}</Text>
      </View>
    </View>
  );
}

function FailureDiagnosticBoard({ receipt }: { receipt: MobileAccountState["latestReceipt"] }) {
  const diagnostic = receipt?.failureDiagnostic;
  const fen = diagnostic?.fenAtBreak ?? receipt?.finalPositionFen;
  const uci = diagnostic?.uci ?? receipt?.lastMoveUci;
  const orientation = mobileBoardOrientation(diagnostic?.playerColor);
  const board = parseMobileFenBoard(fen, uci, orientation);

  if (!receipt || !isFailedReceipt(receipt)) return null;

  const moveLabel = diagnostic?.moveNumber ? `Move ${diagnostic.moveNumber}` : diagnostic?.ply ? `Ply ${diagnostic.ply}` : "Breaker position";
  const moveText = diagnostic?.san ?? diagnostic?.uci ?? receipt.lastMoveSan ?? receipt.lastMoveUci ?? null;
  const boardTitle = board && moveText ? `${moveLabel} · ${moveText}` : diagnostic?.label ?? "Side Quest not completed";
  const boardContext = board
    ? `${orientation === "black" ? "Shown from Black’s side" : "Shown from White’s side"} · highlighted squares show the breaker move`
    : "Board position unavailable · reason shown below";

  return (
    <View style={compactStyles.failureBoardPanel}>
      <View style={compactStyles.failureBoardHeader}>
        <Text style={compactStyles.failureBoardKicker}>SQC referee board</Text>
        <Text style={compactStyles.failureBoardMove}>{boardTitle}</Text>
        <Text style={compactStyles.failureBoardSubhead}>{boardContext}</Text>
      </View>
      {board ? (
        <View style={compactStyles.failureBoardFrame}>
          <View style={compactStyles.failureBoardInnerFrame}>
            <View style={compactStyles.failureBoard}>
              {board.map((square, index) => (
                <View key={square.square} style={[compactStyles.failureBoardSquare, (Math.floor(index / 8) + index) % 2 === 0 ? compactStyles.failureBoardSquareLight : compactStyles.failureBoardSquareDark, square.highlight ? compactStyles.failureBoardSquareHighlight : null]}>
                  {square.rankLabel ? <Text style={compactStyles.failureBoardRankLabel}>{square.rankLabel}</Text> : null}
                  {square.fileLabel ? <Text style={compactStyles.failureBoardFileLabel}>{square.fileLabel}</Text> : null}
                  {square.highlight ? <View style={compactStyles.failureBoardHighlightRing} /> : null}
                  <Text style={[compactStyles.failureBoardPiece, square.piece && square.piece === square.piece.toUpperCase() ? compactStyles.failureBoardPieceWhite : compactStyles.failureBoardPieceBlack]}>{square.piece ? MOBILE_CHESS_PIECES[square.piece] : ""}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={compactStyles.failureBoardLegendRow}>
            <View style={compactStyles.failureBoardLegendSwatch} />
            <Text style={compactStyles.failureBoardLegendText}>Breaker move squares</Text>
          </View>
        </View>
      ) : (
        <View style={compactStyles.failureBoardUnavailable}>
          <MaterialCommunityIcons name="checkerboard" size={30} color="rgba(245,200,106,.88)" />
          <View style={compactStyles.failureBoardUnavailableCopyBlock}>
            <Text style={compactStyles.failureBoardUnavailableTitle}>Board position unavailable</Text>
            <Text style={compactStyles.failureBoardUnavailableCopy}>SQC still checked the latest game and kept the reason below. Try refreshing after the provider finishes publishing the full game record.</Text>
          </View>
        </View>
      )}
      <Text style={compactStyles.failureBoardCopy}>{getReceiptFailureText(receipt)}</Text>
    </View>
  );
}


type VictoryProofBoardInput = {
  finalPositionFen?: string | null;
  lastMoveUci?: string | null;
  lastMoveSan?: string | null;
  playerColor?: "white" | "black" | null;
  provider?: string | null;
  gameId?: string | null;
};

function mobileBoardOrientation(playerColor?: "white" | "black" | null): "white" | "black" {
  return playerColor === "black" ? "black" : "white";
}

function VictoryProofBoard({ proof }: { proof: VictoryProofBoardInput | null | undefined }) {
  const orientation = mobileBoardOrientation(proof?.playerColor);
  const board = parseMobileFenBoard(proof?.finalPositionFen, proof?.lastMoveUci ?? undefined, orientation);

  if (!board) return null;

  const moveText = proof?.lastMoveSan ?? proof?.lastMoveUci ?? null;
  const sourceText = [proof?.provider, proof?.gameId].filter(Boolean).join(" · ");

  return (
    <View style={compactStyles.failureBoardPanel}>
      <View style={compactStyles.failureBoardHeader}>
        <Text style={compactStyles.failureBoardKicker}>SQC proof board</Text>
        <Text style={compactStyles.failureBoardMove}>{moveText ? `Final position · ${moveText}` : "Verified final position"}</Text>
        <Text style={compactStyles.failureBoardSubhead}>{sourceText || "This is the verified board attached to the completed quest."}</Text>
      </View>
      <View style={compactStyles.failureBoardFrame}>
        <View style={compactStyles.failureBoardInnerFrame}>
          <View style={compactStyles.failureBoard}>
            {board.map((square, index) => (
              <View key={square.square} style={[compactStyles.failureBoardSquare, (Math.floor(index / 8) + index) % 2 === 0 ? compactStyles.failureBoardSquareLight : compactStyles.failureBoardSquareDark, square.highlight ? compactStyles.failureBoardSquareHighlight : null]}>
                {square.rankLabel ? <Text style={compactStyles.failureBoardRankLabel}>{square.rankLabel}</Text> : null}
                {square.fileLabel ? <Text style={compactStyles.failureBoardFileLabel}>{square.fileLabel}</Text> : null}
                {square.highlight ? <View style={compactStyles.failureBoardHighlightRing} /> : null}
                <Text style={[compactStyles.failureBoardPiece, square.piece && square.piece === square.piece.toUpperCase() ? compactStyles.failureBoardPieceWhite : compactStyles.failureBoardPieceBlack]}>{square.piece ? MOBILE_CHESS_PIECES[square.piece] : ""}</Text>
              </View>
            ))}
          </View>
        </View>
        {proof?.lastMoveUci ? (
          <View style={compactStyles.failureBoardLegendRow}>
            <View style={compactStyles.failureBoardLegendSwatch} />
            <Text style={compactStyles.failureBoardLegendText}>Final move squares</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function getMultiplayerInviteUrl(quest: Pick<MobileGroupQuestSummary, "id" | "inviteMode" | "inviteKey">) {
  const baseUrl = `${SQC_WEB_BASE_URL}/groupquests/${encodeURIComponent(quest.id)}`;
  const key = quest.inviteMode === "private-key" ? quest.inviteKey?.trim() : "";
  return key ? `${baseUrl}?invite=${encodeURIComponent(key)}` : baseUrl;
}

function cleanMultiplayerTitle(title: string) {
  return title
    .replace(/\s+Demo(?=\s+Results\b|$)/gi, "")
    .replace(/([a-z])Room(?=\d|$)/g, "$1 Multiplayer Side Quest ")
    .replace(/\brooms\b/gi, "Multiplayer Side Quests")
    .replace(/\broom\b/gi, "Multiplayer Side Quest")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanMultiplayerInviteCopy(copy?: string | null) {
  const trimmed = copy?.trim();
  if (!trimmed) return MULTIPLAYER_DEFAULT_INVITE_COPY;
  return trimmed.replace(/A shared Multiplayer Side Quest where every player proves the same bad idea with fresh public games\.?/gi, MULTIPLAYER_DEFAULT_INVITE_COPY);
}

function getMultiplayerInviteMessage(quest: Pick<MobileGroupQuestSummary, "id" | "title" | "inviteMode" | "inviteKey" | "inviteCopy">) {
  const intro = cleanMultiplayerInviteCopy(quest.inviteCopy);
  return `Join my Multiplayer Side Quest on Side Quest Chess: ${cleanMultiplayerTitle(quest.title)}\n${intro}\n${getMultiplayerInviteUrl(quest)}`;
}

function titleCaseRuleValue(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function getCustomConditionLabel(index: number) {
  return `Condition ${String.fromCharCode(65 + Math.min(index, 25))}`;
}

function customConditionUsesPiece(condition: CustomRuleCondition) {
  return condition !== "move sequence" && condition !== "opening sequence" && condition !== "game result";
}

function getCustomConditionTypeCopy(condition: CustomRuleCondition) {
  if (condition === "move sequence") return { title: "Move sequence", helper: "A required sequence of algebraic moves, not tied to one piece." };
  if (condition === "opening sequence") return { title: "Opening sequence", helper: "Paste opening notation like 1.e4 e5 2.f4." };
  if (condition === "game result") return { title: "Game result", helper: "Require a win, draw, or loss." };
  return { title: titleCaseRuleValue(condition), helper: "A piece-based condition." };
}

function getCustomPieceMaxCount(piece: CustomRulePiece) {
  if (piece === "pawn") return 8;
  if (piece === "king" || piece === "queen") return 1;
  return 2;
}

function getCustomPieceLabel(piece: CustomRulePiece, count: number) {
  if (count === 1) return piece;
  if (piece === "king") return "king";
  if (piece === "queen") return "queen";
  return piece === "pawn" ? "pawns" : `${piece}s`;
}

function getCustomRuleCountOptions(piece: CustomRulePiece) {
  const max = getCustomPieceMaxCount(piece);
  return Array.from({ length: max }, (_, index) => index + 1);
}

function normalizeCustomRuleCount(piece: CustomRulePiece, count: number) {
  return Math.min(Math.max(1, count), getCustomPieceMaxCount(piece));
}

function getCustomPieceIdentityOptions(piece: CustomRulePiece) {
  if (piece === "pawn") return ["any", ...CUSTOM_RULE_FILES.map((file) => `${file}-pawn`)];
  if (piece === "rook" || piece === "bishop" || piece === "knight") return ["any", "queenside", "kingside"];
  return ["original"];
}

function customPieceNeedsIdentityChoice(piece: CustomRulePiece) {
  return piece !== "king" && piece !== "queen";
}

function normalizeCustomPieceIdentity(piece: CustomRulePiece, identity: string) {
  const options = getCustomPieceIdentityOptions(piece);
  return options.includes(identity) ? identity : options[0];
}

function getCustomPieceIdentityLabel(piece: CustomRulePiece, identity: string) {
  const normalized = normalizeCustomPieceIdentity(piece, identity);
  if (normalized === "original") return piece;
  if (normalized === "any") return piece === "pawn" ? "any pawn" : `any ${piece}`;
  if (normalized.endsWith("-pawn")) return `${normalized.slice(0, 1)}-pawn`;
  return `${normalized} ${piece}`;
}

function getCustomPieceIdentityChoices(piece: CustomRulePiece) {
  if (piece === "pawn") {
    return [
      { id: "any", label: "Any pawn", identity: "any", helper: "One or more pawns; choose count below if needed." },
      { id: "all", label: "All pawns", identity: "any", quantifier: "all" as CustomRuleQuantifier, helper: "Every pawn for that side." },
      ...CUSTOM_RULE_FILES.map((file) => ({ id: `${file}-pawn`, label: `${file}-pawn`, identity: `${file}-pawn`, helper: "A specific starting pawn." })),
    ];
  }
  if (piece === "rook" || piece === "bishop" || piece === "knight") {
    const plural = `${piece}s`;
    return [
      { id: "any", label: `Either ${piece}`, identity: "any", helper: "One of the two is enough." },
      { id: "both", label: `Both ${plural}`, identity: "any", quantifier: "all" as CustomRuleQuantifier, helper: "Both starting pieces must match." },
      { id: "queenside", label: `Queenside ${piece}`, identity: "queenside", helper: "The starting piece on the queen side." },
      { id: "kingside", label: `Kingside ${piece}`, identity: "kingside", helper: "The starting piece on the king side." },
    ];
  }
  return [];
}

function isCustomPieceIdentityChoiceSelected(piece: CustomRulePiece, currentIdentity: string, currentQuantifier: CustomRuleQuantifier, choice: ReturnType<typeof getCustomPieceIdentityChoices>[number]) {
  const normalized = normalizeCustomPieceIdentity(piece, currentIdentity);
  if (choice.id === "all" || choice.id === "both") return normalized === "any" && currentQuantifier === "all";
  if (choice.id === "any") return normalized === "any" && currentQuantifier !== "all";
  return normalized === choice.identity;
}

function normalizeCustomSquare(value: string) {
  const cleaned = value.trim().toLowerCase();
  return /^[a-h][1-8]$/.test(cleaned) ? cleaned : "e4";
}

function normalizeCustomMoveNumber(value: string | number) {
  const numeric = typeof value === "number" ? value : Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(Math.max(1, numeric), 300);
}

function formatCustomMoveNumberInput(value: string) {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 3);
  if (!digits) return "";
  return String(normalizeCustomMoveNumber(digits));
}

function normalizeCustomMoveSequence(value: string) {
  const cleaned = value
    .replace(/[^a-zA-Z0-9+#=xXO\-–—.\s]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 180);
}

function normalizeCustomOpeningSequence(value: string) {
  return value
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\$\d+/g, " ")
    .replace(/(?:1-0|0-1|1\/2-1\/2|\*)/g, " ")
    .replace(/\d+\.{1,3}/g, " ")
    .replace(/[!?]+/g, "")
    .replace(/[^a-zA-Z0-9+#=xXO\-–—.\s]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function getCustomOpeningMoves(value: string) {
  return normalizeCustomOpeningSequence(value)
    .split(/\s+/)
    .map((move) => move.trim())
    .filter(Boolean)
    .slice(0, 40);
}

function getCustomOpeningPreview(value: string) {
  const moves = getCustomOpeningMoves(value);
  if (!moves.length) return "No moves parsed yet.";
  return moves.join(" → ");
}

function getCustomRequirementValidation(input: Omit<CustomRuleRequirement, "id">) {
  if (input.condition === "on square" && !/^[a-h][1-8]$/.test(normalizeCustomSquare(input.targetSquare))) {
    return "Use a real board square like e4, h8, or a1.";
  }
  if (input.condition === "move sequence" && !normalizeCustomMoveSequence(input.moveSequence)) {
    return "Add at least one algebraic move to the move sequence.";
  }
  if (input.condition === "opening sequence" && !getCustomOpeningMoves(input.openingSequence).length) {
    return "Add an opening line from move 1, for example 1.e4 e5 2.f4.";
  }
  return null;
}

function getCustomTimingSummary(timing: CustomRuleTiming, moveNumber: number) {
  if (timing === "by move") return `by move ${moveNumber}`;
  if (timing === "at move") return `at move ${moveNumber}`;
  return "at game end";
}

function buildCustomPieceRuleSummary(input: Omit<CustomRuleRequirement, "id">) {
  const timing = getCustomTimingSummary(input.timing, input.moveNumber);
  if (input.condition === "move sequence") {
    const sequence = normalizeCustomMoveSequence(input.moveSequence) || "e4 e5";
    const positiveRule = `Game must include the move sequence “${sequence}” ${timing}.`;
    return input.negated ? `It must NOT be true that ${positiveRule.slice(0, 1).toLowerCase()}${positiveRule.slice(1)}` : positiveRule;
  }
  if (input.condition === "opening sequence") {
    const sequence = getCustomOpeningMoves(input.openingSequence).join(" ") || "e4 e5 f4";
    const positiveRule = `Opening line from move 1 must match “${sequence}”.`;
    return input.negated ? `It must NOT be true that ${positiveRule.slice(0, 1).toLowerCase()}${positiveRule.slice(1)}` : positiveRule;
  }
  if (input.condition === "game result") {
    const resultRule = input.result === "win" ? "Win a game." : input.result === "draw" ? "Draw a game." : "Finish with a loss.";
    const negatedRule = input.result === "win" ? "Do not win the game." : input.result === "draw" ? "Do not draw the game." : "Do not lose the game.";
    return input.negated ? negatedRule : resultRule;
  }
  const owner = input.owner === "my" ? "your" : "opponent's";
  const count = normalizeCustomRuleCount(input.piece, input.count);
  const identity = getCustomPieceIdentityLabel(input.piece, input.identity);
  const pieceLabel = input.identity && normalizeCustomPieceIdentity(input.piece, input.identity) !== "any"
    ? identity
    : getCustomPieceLabel(input.piece, input.quantifier === "all" ? getCustomPieceMaxCount(input.piece) : count);
  const hasSpecificIdentity = customPieceNeedsIdentityChoice(input.piece) && input.identity && normalizeCustomPieceIdentity(input.piece, input.identity) !== "any";
  const hasSingleUniquePiece = getCustomPieceMaxCount(input.piece) === 1;
  const ownerPossessive = input.owner === "my" ? "your" : "your opponent's";
  const allPieceSubject = input.quantifier === "all" && !hasSpecificIdentity && !hasSingleUniquePiece
    ? getCustomPieceMaxCount(input.piece) === 2
      ? `both of ${ownerPossessive} ${pieceLabel}`
      : `all ${getCustomPieceMaxCount(input.piece)} of ${ownerPossessive} ${pieceLabel}`
    : null;
  const quantifier = input.quantifier === "all"
    ? `all ${getCustomPieceMaxCount(input.piece)}`
    : input.quantifier === "any one"
      ? "any 1"
      : `${input.quantifier} ${count}`;
  const condition = input.condition === "on square" ? `on ${normalizeCustomSquare(input.targetSquare)}` : input.condition;
  const subject = allPieceSubject ?? (hasSpecificIdentity || hasSingleUniquePiece ? `${owner} ${pieceLabel}` : `${owner} ${quantifier} ${pieceLabel}`);
  const positiveRule = `${titleCaseRuleValue(subject)} must be ${condition} ${timing}.`;
  return input.negated ? `It must NOT be true that ${positiveRule.slice(0, 1).toLowerCase()}${positiveRule.slice(1)}` : positiveRule;
}

function cleanCustomRuleSummaryText(value: string) {
  return value
    .replace(/game\s+result\s+must\s+be\s+win\.?/gi, "Win a game.")
    .replace(/game\s+result\s+must\s+be\s+draw\.?/gi, "Draw a game.")
    .replace(/game\s+result\s+must\s+be\s+lose\.?/gi, "Finish with a loss.")
    .replace(/\b(your|opponent's) any 1 (king|queen)\b/gi, (_match, owner: string, piece: string) => `${owner} ${piece}`)
    .replace(/\b(your|opponent's) any 1 ((?:queenside|kingside) (?:rook|bishop|knight)|[a-h]-pawn)\b/gi, (_match, owner: string, piece: string) => `${owner} ${piece}`)
    .replace(/\.\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCustomRuleBlock(input: Omit<CustomRuleRequirement, "id">) {
  if (input.condition === "move sequence") {
    return {
      type: "moveSequence",
      sequence: normalizeCustomMoveSequence(input.moveSequence),
      timing: input.timing === "by move" ? { byMove: input.moveNumber } : input.timing === "at move" ? { atMove: input.moveNumber } : { atGameEnd: true },
      negate: input.negated,
    };
  }
  if (input.condition === "opening sequence") {
    return {
      type: "openingSequence",
      raw: input.openingSequence,
      moves: getCustomOpeningMoves(input.openingSequence),
      anchor: "gameStart",
      negate: input.negated,
    };
  }
  if (input.condition === "game result") {
    return {
      type: "gameResult",
      result: input.result,
      negate: input.negated,
    };
  }
  return {
    type: "pieceState",
    piece: input.piece,
    owner: input.owner,
    selector: {
      quantifier: input.quantifier,
      count: input.quantifier === "all" ? getCustomPieceMaxCount(input.piece) : normalizeCustomRuleCount(input.piece, input.count),
      maxAvailable: getCustomPieceMaxCount(input.piece),
      identity: normalizeCustomPieceIdentity(input.piece, input.identity),
    },
    condition: input.condition,
    targetSquare: input.condition === "on square" ? normalizeCustomSquare(input.targetSquare) : null,
    timing: input.timing === "by move" ? { byMove: input.moveNumber } : input.timing === "at move" ? { atMove: input.moveNumber } : { atGameEnd: true },
    negate: input.negated,
  };
}

function buildCustomRuleSetSummary(input: { logic: CustomRuleLogic; requirements: Array<Omit<CustomRuleRequirement, "id">> }) {
  const summaries = input.requirements.map(buildCustomPieceRuleSummary);
  if (summaries.length <= 1) return summaries[0] ?? "No requirement yet.";
  const joiner = input.logic === "all" ? " AND " : " OR ";
  return summaries.join(joiner);
}

function buildCustomPieceRuleConfig(input: { logic: CustomRuleLogic; requirements: Array<Omit<CustomRuleRequirement, "id">> }) {
  return JSON.stringify({
    version: 2,
    logic: input.logic,
    blocks: input.requirements.map(buildCustomRuleBlock),
  });
}

function getDefaultCustomRequirement(id: string): CustomRuleRequirement {
  return {
    id,
    piece: "queen",
    owner: "my",
    condition: "game result",
    timing: "by move",
    moveNumber: 15,
    quantifier: "any one",
    count: 1,
    identity: "original",
    targetSquare: "e4",
    moveSequence: "e4 e5 Nf3",
    openingSequence: "1.e4 e5 2.f4",
    result: "win",
    negated: false,
  };
}

function getCustomTimingFromConfig(timing: unknown): { timing: CustomRuleTiming; moveNumber: number } {
  if (timing && typeof timing === "object") {
    const timingRecord = timing as Record<string, unknown>;
    if (typeof timingRecord.atMove === "number") return { timing: "at move", moveNumber: normalizeCustomMoveNumber(timingRecord.atMove) };
    if (typeof timingRecord.byMove === "number") return { timing: "by move", moveNumber: normalizeCustomMoveNumber(timingRecord.byMove) };
  }
  return { timing: "at game end", moveNumber: 15 };
}

function parseCustomRuleRequirements(config: string): { logic: CustomRuleLogic; requirements: CustomRuleRequirement[] } | null {
  try {
    const parsed = JSON.parse(config) as { logic?: unknown; blocks?: unknown };
    const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
    const requirements = blocks.map((block, index): CustomRuleRequirement | null => {
      if (!block || typeof block !== "object") return null;
      const record = block as Record<string, unknown>;
      const base = getDefaultCustomRequirement(`saved-condition-${index + 1}`);
      const { timing, moveNumber } = getCustomTimingFromConfig(record.timing);
      if (record.type === "moveSequence") {
        return { ...base, condition: "move sequence", timing, moveNumber, moveSequence: typeof record.sequence === "string" ? record.sequence : base.moveSequence, negated: record.negate === true };
      }
      if (record.type === "openingSequence") {
        const moves = Array.isArray(record.moves) ? record.moves.filter((move): move is string => typeof move === "string").join(" ") : "";
        return { ...base, condition: "opening sequence", openingSequence: typeof record.raw === "string" ? record.raw : moves || base.openingSequence, negated: record.negate === true };
      }
      if (record.type === "gameResult") {
        const result = CUSTOM_RULE_RESULTS.includes(record.result as CustomRuleResult) ? record.result as CustomRuleResult : base.result;
        return { ...base, condition: "game result", result, negated: record.negate === true };
      }
      if (record.type !== "pieceState") return null;
      const selector = record.selector && typeof record.selector === "object" ? record.selector as Record<string, unknown> : {};
      const piece = CUSTOM_RULE_PIECES.includes(record.piece as CustomRulePiece) ? record.piece as CustomRulePiece : base.piece;
      const owner = CUSTOM_RULE_OWNERS.includes(record.owner as CustomRuleOwner) ? record.owner as CustomRuleOwner : base.owner;
      const condition = CUSTOM_RULE_CONDITIONS.includes(record.condition as CustomRuleCondition) ? record.condition as CustomRuleCondition : base.condition;
      const quantifier = CUSTOM_RULE_QUANTIFIERS.includes(selector.quantifier as CustomRuleQuantifier) ? selector.quantifier as CustomRuleQuantifier : base.quantifier;
      return {
        ...base,
        piece,
        owner,
        condition,
        timing,
        moveNumber,
        quantifier,
        count: typeof selector.count === "number" ? normalizeCustomRuleCount(piece, selector.count) : base.count,
        identity: typeof selector.identity === "string" ? normalizeCustomPieceIdentity(piece, selector.identity) : base.identity,
        targetSquare: typeof record.targetSquare === "string" ? normalizeCustomSquare(record.targetSquare) : base.targetSquare,
        negated: record.negate === true,
      };
    }).filter((requirement): requirement is CustomRuleRequirement => Boolean(requirement));
    return { logic: CUSTOM_RULE_LOGICS.includes(parsed.logic as CustomRuleLogic) ? parsed.logic as CustomRuleLogic : "all", requirements };
  } catch {
    return null;
  }
}

function getCustomRuleDetailLines(config: string, fallbackSummary: string) {
  const parsed = parseCustomRuleRequirements(config);
  if (parsed?.requirements.length) {
    return {
      logicLabel: parsed.logic === "all" ? "Complete every condition" : "Complete any one condition",
      lines: parsed.requirements.map((requirement) => cleanCustomRuleSummaryText(buildCustomPieceRuleSummary(requirement))),
    };
  }

  return {
    logicLabel: "Rule summary",
    lines: [cleanCustomRuleSummaryText(fallbackSummary)],
  };
}

function getInviteModeOptionCopy(mode: "public" | "private-key") {
  return mode === "public"
    ? { title: "Public", helper: "Visible in Browse" }
    : { title: "Invite code", helper: "Only players with the invite code or link can join" };
}

function getMultiplayerRuleOptionCopy(ruleId: string, option: string) {
  if (ruleId === "timeControl") {
    if (option === "Any time control") return { title: "Any", helper: "Bullet, blitz, rapid, or classical" };
    return { title: option, helper: `${option} games only` };
  }
  if (ruleId === "rated") {
    if (option === "Any rated state") return { title: "Any", helper: "Rated or casual games count" };
    if (option === "Rated only") return { title: "Rated", helper: "Only rated games count" };
    return { title: "Casual", helper: "Only casual games count" };
  }
  if (option === "Any color") return { title: "Any", helper: "White or Black games count" };
  if (option === "White only") return { title: "White", helper: "Only games as White count" };
  return { title: "Black", helper: "Only games as Black count" };
}

type BrowseQuest = MobileChallenge & {
  browseKind: "live" | "coming-soon";
  releaseDate?: string;
};

type MobileShellState = {
  bootstrap: MobileBootstrap | null;
  account: MobileAccountResponse | null;
  selectedChallengeId: string | null;
  pendingSideQuestDetailId: string | null;
  pendingCompletedDetailId: string | null;
  activeTab: AppTab;
  loading: boolean;
  refreshing: boolean;
  catalogMode: "live" | "offline";
  catalogNotice: string | null;
};

type CompletionCelebrationMode = "solo" | "multiplayer";

type CompletionCelebrationFamily = "triumphant" | "absurd" | "surgical" | "dark" | "mythic";


const DEFAULT_BADGE_IDENTITY: MobileChallenge["badgeIdentity"] = {
  name: "Coat of Arms",
  motif: "Side Quest Chess",
  rarity: "Verified",
  unlockCopy: "Side Quest completed.",
  imageUrl: null,
  colors: { primary: "#f5c86a", secondary: "#8b5a2b", glow: "#f5c86a" },
  heraldry: {
    shield: "SQC",
    charge: "Verified proof",
    crest: "Side Quest Chess",
    motto: "Proof accepted",
    meaning: "This coat marks a completed Side Quest.",
    weirdness: "The paperwork survived the refresh.",
  },
};

function getSafeBadgeIdentity(challenge?: MobileChallenge | null): MobileChallenge["badgeIdentity"] {
  return challenge?.badgeIdentity ?? DEFAULT_BADGE_IDENTITY;
}

function getSafeBadgeColors(challenge?: MobileChallenge | null): MobileChallenge["badgeIdentity"]["colors"] {
  return getSafeBadgeIdentity(challenge).colors ?? DEFAULT_BADGE_IDENTITY.colors;
}

type CompletionCelebrationUnlock = {
  challengeId: string;
  challengeTitle: string;
  badgeName: string;
  proofHref: string | null;
  reward: number;
  completedAt: string | null;
  family: CompletionCelebrationFamily;
  accentColor: string;
  flavorLine: string;
  mode: CompletionCelebrationMode;
  multiplayerPointsAwarded?: string | null;
  extraCompletedCount?: number;
};

type AccountUpdatedCallback = () => void | MobileAccountResponse | null | Promise<void | MobileAccountResponse | null>;

type MobileAuthBridge = {
  configured: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  getSessionToken: () => Promise<string | null>;
  startGoogleSignIn?: () => Promise<void>;
  signOut?: () => Promise<void>;
  signedInLabel: string | null;
};

const MOBILE_ACCOUNT_FALLBACK: MobileAccountResponse = {
  apiVersion: 1,
  authenticated: false,
  signInUrl: "",
  message: "Browse Side Quests now. Sign in when you want to save progress, proof, and Coat of Arms unlocks.",
};

WebBrowser.maybeCompleteAuthSession();

const CHALLENGE_COAT_IMAGE_ASSETS: Record<string, ImageSourcePropType> = {
  "finish-any-game": require("./assets/badges/v6/proof-loop-test-badge.png"),
  "knights-before-coffee": require("./assets/badges/v6/knights-before-coffee-badge.png"),
  "bishop-field-trip": require("./assets/badges/v6/bishop-field-trip-badge.png"),
  "early-king-walk": require("./assets/badges/v6/early-king-walk-badge.png"),
  "pawn-only-picnic": require("./assets/badges/v7/coming-soon-clean/pawn-only-picnic-badge.png"),
  "back-rank-goblin": require("./assets/badges/v7/coming-soon-clean/back-rank-goblin-badge.png"),
  "late-castle-lifestyle": require("./assets/badges/v7/coming-soon-clean/late-castle-lifestyle-badge.png"),
  "rook-lift-internship": require("./assets/badges/v7/coming-soon-clean/rook-lift-internship-badge.png"),
  "queen-side-quest": require("./assets/badges/v7/coming-soon-clean/queen-side-quest-badge.png"),
  "queen-never-heard-of-her": require("./assets/badges/v4/queen-never-heard-of-her.png"),
  "no-castle-club": require("./assets/badges/v4/no-castle-club-badge.png"),
  "the-blunder-gambit": require("./assets/badges/v4/the-blunder-gambit-badge.png"),
  "knightmare-mode": require("./assets/badges/v4/knightmare-mode-badge.png"),
};

const CHALLENGE_COAT_GLOW_ASSETS: Record<string, ImageSourcePropType> = {
  "finish-any-game": require("./assets/badges/glow/finish-any-game-glow.png"),
  "knights-before-coffee": require("./assets/badges/glow/knights-before-coffee-glow.png"),
  "bishop-field-trip": require("./assets/badges/glow/bishop-field-trip-glow.png"),
  "early-king-walk": require("./assets/badges/glow/early-king-walk-glow.png"),
  "pawn-only-picnic": require("./assets/badges/glow/pawn-only-picnic-glow.png"),
  "queen-never-heard-of-her": require("./assets/badges/glow/queen-never-heard-of-her-glow.png"),
  "no-castle-club": require("./assets/badges/glow/no-castle-club-glow.png"),
  "the-blunder-gambit": require("./assets/badges/glow/the-blunder-gambit-glow.png"),
  "knightmare-mode": require("./assets/badges/glow/knightmare-mode-glow.png"),
};

const DIFFICULTY_RANK: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Brutal: 4,
  Absurd: 5,
};

const MOBILE_COMING_SOON_QUESTS: BrowseQuest[] = [
  {
    id: "late-castle-lifestyle",
    title: "Late Castle Lifestyle",
    objective: "Castle after move 15, then win like the delay was strategic.",
    instruction: "Scheduled quest: wait far too long to castle, finally do it, then claim the king was fashionably late.",
    openingHint: "Safety arrived after the afterparty started.",
    reward: 180,
    category: "Restriction",
    difficulty: "Medium",
    completionRate: "Scheduled",
    flavor: "Not refusing safety. Just ghosting it for fifteen moves.",
    badge: "Fashionably Fortified",
    proofCallout: "Castled after move 15 · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Late Castle",
      motif: "♔",
      rarity: "Scheduled badge",
      unlockCopy: "Delay castling until it feels socially awkward, then win.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/late-castle-lifestyle-badge.png"),
      colors: { primary: "#a78bfa", secondary: "#f5c86a", glow: "rgba(167,139,250,.4)" },
      heraldry: {
        shield: "Purple dusk field with a crown arriving at a tower under a tiny moon.",
        charge: "Delayed castle gate",
        crest: "Pocket clock",
        motto: "Eventually Secure",
        meaning: "The clock marks the delayed castle; the tower proves the king finally accepted help.",
        weirdness: "Royal time management with tactical consequences.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-06-04",
  },
  {
    id: "rook-lift-internship",
    title: "Rook Lift Internship",
    objective: "Lift a rook before move 18 and make the internship pay off.",
    instruction: "Scheduled quest: send a rook up the board early, pretend it has a badge, and win.",
    openingHint: "The rook asked for field experience.",
    reward: 220,
    category: "Style Quest",
    difficulty: "Medium",
    completionRate: "Scheduled",
    flavor: "A career-development program for castles with ambition.",
    badge: "Junior Tower Energy",
    proofCallout: "Early rook lift · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Rook Intern",
      motif: "♜",
      rarity: "Scheduled badge",
      unlockCopy: "Lift a rook early and convert the suspicious career move into a win.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/rook-lift-internship-badge.png"),
      colors: { primary: "#e87922", secondary: "#f5c86a", glow: "rgba(232,121,34,.38)" },
      heraldry: {
        shield: "Orange-gold field with a rook climbing a ladder over three files.",
        charge: "Rook on ladder",
        crest: "Intern badge",
        motto: "Promoted Too Soon",
        meaning: "The climbing rook marks the early lift; the badge means it was definitely not qualified.",
        weirdness: "Corporate mobility for a medieval tower.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-06-11",
  },
  {
    id: "queen-side-quest",
    title: "Queen Side Quest",
    objective: "Win while your queen never leaves the first rank.",
    instruction: "Scheduled quest: keep the queen in headquarters for the whole public-game win.",
    openingHint: "The queen is managing from headquarters and refusing media questions.",
    reward: 900,
    category: "Streamer Hard",
    difficulty: "Brutal",
    completionRate: "Scheduled · streamer-hard",
    flavor: "Maximum power, minimum commute, maximum chat disbelief.",
    badge: "Remote Royalty",
    proofCallout: "Queen stayed on first rank · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Desk Queen",
      motif: "♛",
      rarity: "Scheduled brutal relic",
      unlockCopy: "Win while the queen refuses to leave the executive floor.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/queen-side-quest-badge.png"),
      colors: { primary: "#ff5f9f", secondary: "#a78bfa", glow: "rgba(255,95,159,.44)" },
      heraldry: {
        shield: "Deep pink field with a queen behind a gold desk and unopened battle map.",
        charge: "Stationary queen",
        crest: "Office crown",
        motto: "Lead From Home",
        meaning: "The desk queen marks royal restraint; the unopened map shows all ambition stayed local.",
        weirdness: "Remote work policy for the most powerful piece.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-06-18",
  },
];

const SQC_COAT_OF_ARMS_ASSET = require("./assets/sqc-coat-of-arms.png") as ImageSourcePropType;
const SQC_CUSTOM_SIDE_QUEST_CREST_ASSET = require("./assets/badges/custom-side-quest-crest.png") as ImageSourcePropType;
const SQC_BLACK_SEAL_ASSET = require("./assets/stamps/sqc-black-seal.png") as ImageSourcePropType;
const SQC_MULTIPLAYER_SEAL_ASSET = require("./assets/stamps/sqc-multiplayer-seal.png") as ImageSourcePropType;
const getMultiplayerSealSource = (quest?: { official?: boolean | null; id?: string | null } | null) => (quest?.official || quest?.id?.startsWith("official-") ? SQC_BLACK_SEAL_ASSET : SQC_MULTIPLAYER_SEAL_ASSET);
const SQC_GOLD_SEAL_ASSET = require("./assets/stamps/sqc-gold-seal.png") as ImageSourcePropType;
const SQC_SILVER_SEAL_ASSET = require("./assets/stamps/sqc-silver-seal.png") as ImageSourcePropType;
const SQC_BRONZE_SEAL_ASSET = require("./assets/stamps/sqc-bronze-seal.png") as ImageSourcePropType;
const SQC_COMPLETED_RED_SEAL_ASSET = require("./assets/stamps/quest-complete-red-wax-sqc-v3.png") as ImageSourcePropType;

const CHALLENGE_COAT_IMAGE_PATHS: Record<string, string> = {
  "finish-any-game": "/badges/v6/proof-loop-test-badge.png",
  "knights-before-coffee": "/badges/v6/knights-before-coffee-badge.png",
  "bishop-field-trip": "/badges/v6/bishop-field-trip-badge.png",
  "early-king-walk": "/badges/v6/early-king-walk-badge.png",
  "pawn-only-picnic": "/badges/v7/coming-soon-clean/pawn-only-picnic-badge.png",
  "queen-never-heard-of-her": "/badges/v4/queen-never-heard-of-her.png",
  "no-castle-club": "/badges/v4/no-castle-club-badge.png",
  "the-blunder-gambit": "/badges/v4/the-blunder-gambit-badge.png",
  "knightmare-mode": "/badges/v4/knightmare-mode-badge.png",
};

const RECOMMENDED_START_CHALLENGE_IDS = ["knights-before-coffee", "no-castle-club", "queen-never-heard-of-her"];
const LIVE_STREAMER_HARD_QUEST_IDS = ["queen-never-heard-of-her", "knightmare-mode", "rookless-rampage"];

const mobileOAuthRedirectUrl = AuthSession.makeRedirectUri({
  native: "sidequestchess://sso-callback",
  scheme: "sidequestchess",
  path: "sso-callback",
});

const TABS: Array<
  | { id: AppTab; label: string; iconKind: "image"; imagePath: string }
  | { id: AppTab; label: string; iconKind: "vector"; iconName: keyof typeof MaterialCommunityIcons.glyphMap }
> = [
  { id: "home", label: "Today", iconKind: "image", imagePath: "/brand/sqc-alt-logo-topbar-20260507-v2.png" },
  { id: "sideQuests", label: "Side Quests", iconKind: "image", imagePath: "/sqc-logo-v11.png" },
  { id: "multiplayerSideQuests", label: "Multiplayer", iconKind: "vector", iconName: "account-group" },
  { id: "coatOfArms", label: "Coat of Arms", iconKind: "image", imagePath: "/badges/v6/proof-loop-test-badge.png" },
  { id: "account", label: "Account", iconKind: "vector", iconName: "account-circle" },
];

export default function App() {
  return (
    <SafeAreaProvider>
      {isClerkMobileAuthConfigured() ? (
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={clerkTokenCache}>
          <ClerkMobileShell />
        </ClerkProvider>
      ) : (
        <MobileShell authBridge={signedOutAuthBridge} />
      )}
    </SafeAreaProvider>
  );
}

function ClerkMobileShell() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const signedInLabel = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || null;

  const startGoogleSignIn = useCallback(async () => {
    try {
      const result = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: mobileOAuthRedirectUrl,
      });

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        return;
      }

      const signInStatus = result.signIn?.status ?? "unknown";
      const signUpStatus = result.signUp?.status ?? "unknown";
      const authResultType = result.authSessionResult?.type ?? "unknown";
      Alert.alert(
        "Sign-in did not finish",
        `Google returned to SQC, but Clerk did not create a mobile session yet. Details: auth=${authResultType}, signIn=${signInStatus}, signUp=${signUpStatus}.`,
      );
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unknown mobile sign-in error.";
      Alert.alert("Sign-in error", message);
    }
  }, [startSSOFlow]);

  const authBridge = useMemo<MobileAuthBridge>(
    () => ({
      configured: true,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      getSessionToken: async () => getToken(),
      startGoogleSignIn,
      signOut,
      signedInLabel,
    }),
    [getToken, isLoaded, isSignedIn, signOut, signedInLabel, startGoogleSignIn],
  );

  return <MobileShell authBridge={authBridge} />;
}

const signedOutAuthBridge: MobileAuthBridge = {
  configured: false,
  isLoaded: true,
  isSignedIn: false,
  getSessionToken: async () => null,
  signedInLabel: null,
};

function MobileShell({ authBridge }: { authBridge: MobileAuthBridge }) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollState, setScrollState] = useState({ y: 0, viewportHeight: 0, contentHeight: 0 });
  const [pendingMultiplayerCreateOpen, setPendingMultiplayerCreateOpen] = useState(false);
  const [pendingMultiplayerCreateQuestId, setPendingMultiplayerCreateQuestId] = useState<string | null>(null);
  const [shell, setShell] = useState<MobileShellState>({
    bootstrap: null,
    account: null,
    selectedChallengeId: null,
    pendingSideQuestDetailId: null,
    pendingCompletedDetailId: null,
    activeTab: "home",
    loading: true,
    refreshing: false,
    catalogMode: "live",
    catalogNotice: null,
  });

  const selectedChallenge = useMemo(() => {
    if (!shell.bootstrap) return null;
    return shell.bootstrap.challenges.find((challenge) => challenge.id === shell.selectedChallengeId) ?? shell.bootstrap.challenges[0] ?? null;
  }, [shell.bootstrap, shell.selectedChallengeId]);

  const loadBootstrap = useCallback(async ({ refresh = false } = {}) => {
    setShell((current) => ({ ...current, loading: !refresh, refreshing: refresh }));

    try {
      const nextBootstrap = await fetchMobileBootstrap();
      setShell((current) => ({
        ...current,
        bootstrap: nextBootstrap,
        account: current.account ?? MOBILE_ACCOUNT_FALLBACK,
        selectedChallengeId: current.selectedChallengeId ?? nextBootstrap.challenges[0]?.id ?? null,
        loading: false,
        refreshing: false,
        catalogMode: "live",
        catalogNotice: null,
      }));
    } catch (caught) {
      const offlineReason = caught instanceof Error ? caught.message : "Network request failed.";
      setShell((current) => ({
        ...current,
        bootstrap: current.bootstrap ?? OFFLINE_MOBILE_BOOTSTRAP,
        account: current.account ?? MOBILE_ACCOUNT_FALLBACK,
        selectedChallengeId: current.selectedChallengeId ?? OFFLINE_MOBILE_BOOTSTRAP.challenges[0]?.id ?? null,
        loading: false,
        refreshing: false,
        catalogMode: "offline",
        catalogNotice: offlineReason,
      }));
    }
  }, []);

  const loadAccount = useCallback(async () => {
    if (!authBridge.isLoaded) {
      const fallback = shell.account ?? MOBILE_ACCOUNT_FALLBACK;
      setShell((current) => ({ ...current, account: current.account ?? MOBILE_ACCOUNT_FALLBACK }));
      return fallback;
    }

    try {
      const sessionToken = authBridge.isSignedIn ? await authBridge.getSessionToken() : null;
      const nextAccount = await fetchMobileAccountState(sessionToken);
      setShell((current) => ({ ...current, account: nextAccount }));
      return nextAccount;
    } catch {
      const fallback = shell.account ?? MOBILE_ACCOUNT_FALLBACK;
      setShell((current) => ({ ...current, account: current.account ?? MOBILE_ACCOUNT_FALLBACK }));
      return fallback;
    }
  }, [authBridge, shell.account]);

  const refreshBoardAndAccount = useCallback(async () => {
    await Promise.all([loadBootstrap({ refresh: true }), loadAccount()]);
  }, [loadAccount, loadBootstrap]);

  const refreshCurrentScreen = useCallback(async () => {
    const accountForRefresh = shell.bootstrap ? getDevTrackerPreviewAccount(shell.account, shell.bootstrap) : shell.account;
    const activeQuestId = isAuthenticatedAccount(accountForRefresh) && accountForRefresh.activeQuest && !accountForRefresh.activeQuest.completed
      ? accountForRefresh.activeQuest.id
      : null;

    setShell((current) => ({ ...current, refreshing: true }));
    try {
      if (shell.activeTab === "home" && activeQuestId && authBridge.isSignedIn) {
        const sessionToken = await authBridge.getSessionToken();
        await runMobileQuestAction({ sessionToken, action: "check", challengeId: activeQuestId });
        await loadAccount();
        return;
      }

      await refreshBoardAndAccount();
    } finally {
      setShell((current) => ({ ...current, refreshing: false }));
    }
  }, [authBridge, loadAccount, refreshBoardAndAccount, shell.account, shell.activeTab, shell.bootstrap]);

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => void loadBootstrap(), 0);
    return () => clearTimeout(bootstrapTimer);
  }, [loadBootstrap]);

  useEffect(() => {
    const accountTimer = setTimeout(() => void loadAccount(), 0);
    return () => clearTimeout(accountTimer);
  }, [loadAccount]);

  useEffect(() => {
    if (!authBridge.isLoaded || !authBridge.isSignedIn || isAuthenticatedAccount(shell.account)) {
      return;
    }

    const retryTimers = [400, 1100, 2500, 4500].map((delay) => setTimeout(() => void loadAccount(), delay));
    return () => retryTimers.forEach(clearTimeout);
  }, [authBridge.isLoaded, authBridge.isSignedIn, loadAccount, shell.account]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (shell.activeTab !== "home") {
        selectTab("home");
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [shell.activeTab]);

  function selectChallenge(challengeId: string, nextTab: AppTab = "sideQuests") {
    setShell((current) => ({ ...current, selectedChallengeId: challengeId, activeTab: nextTab }));
  }

  function openChallengeDetail(challengeId: string) {
    setShell((current) => ({ ...current, selectedChallengeId: challengeId, pendingSideQuestDetailId: challengeId, pendingCompletedDetailId: null, activeTab: "sideQuests" }));
  }

  function openCompletedQuestDetail(challengeId: string) {
    setShell((current) => ({ ...current, selectedChallengeId: challengeId, pendingSideQuestDetailId: null, pendingCompletedDetailId: challengeId, activeTab: "sideQuests" }));
  }

  function clearPendingQuestOpen() {
    setShell((current) => ({ ...current, pendingSideQuestDetailId: null, pendingCompletedDetailId: null }));
  }

  function selectTab(activeTab: AppTab) {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setShell((current) => ({ ...current, activeTab }));
    setScrollState((current) => ({ ...current, y: 0 }));
    requestAnimationFrame(() => scrollViewRef.current?.scrollTo({ y: 0, animated: false }));
  }

  function openMultiplayerCreate(questId?: string) {
    setPendingMultiplayerCreateQuestId(questId ?? null);
    setPendingMultiplayerCreateOpen(true);
    selectTab("multiplayerSideQuests");
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setScrollState({ y: contentOffset.y, viewportHeight: layoutMeasurement.height, contentHeight: contentSize.height });
  }

  function handleViewportLayout(event: LayoutChangeEvent) {
    const viewportHeight = event.nativeEvent.layout.height;
    setScrollState((current) => ({ ...current, viewportHeight }));
  }

  function handleContentSizeChange(_width: number, contentHeight: number) {
    setScrollState((current) => ({ ...current, contentHeight }));
  }

  const displayAccount = useMemo(() => (shell.bootstrap ? getDevTrackerPreviewAccount(shell.account, shell.bootstrap) : shell.account), [shell.account, shell.bootstrap]);
  const canScrollUp = scrollState.y > 18;
  const canScrollDown = scrollState.contentHeight > 0 && scrollState.viewportHeight > 0 && scrollState.y + scrollState.viewportHeight < scrollState.contentHeight - 18;
  const activeBackdropChallenge = useMemo(() => {
    if (!shell.bootstrap || !isAuthenticatedAccount(displayAccount) || !displayAccount.activeQuest?.id) return null;
    return shell.bootstrap.challenges.find((challenge) => challenge.id === displayAccount.activeQuest?.id) ?? null;
  }, [displayAccount, shell.bootstrap]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent={false} />
      <GradientBackdrop challenge={activeBackdropChallenge} />
      <View pointerEvents="none" style={styles.appWatermarkFrame}>
        <Image source={{ uri: absoluteAssetUrl("/sqc-logo-v11.png") }} style={styles.appWatermarkImage} resizeMode="contain" />
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 34, 54) }]}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={shell.refreshing} onRefresh={() => void refreshCurrentScreen()} />}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onLayout={handleViewportLayout}
        onContentSizeChange={handleContentSizeChange}
      >
        {shell.loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#f5c86a" />
            <Text style={styles.muted}>Loading the live quest board...</Text>
          </View>
        ) : null}

        {shell.catalogMode === "offline" && !shell.bootstrap && !__DEV__ ? (
          <View style={styles.catalogStateBanner} accessibilityLabel="Offline catalog notice">
            <Text style={styles.catalogStateTitle}>Side Quest board unavailable</Text>
            <Text style={styles.catalogStateCopy}>SQC could not refresh the Side Quest board. Pull to try again.</Text>
          </View>
        ) : null}

        {shell.bootstrap && selectedChallenge ? (
          <>
            <ActiveScreen
              activeTab={shell.activeTab}
              bootstrap={shell.bootstrap}
              catalogMode={shell.catalogMode}
              selectedChallenge={selectedChallenge}
              account={displayAccount}
              authBridge={authBridge}
              onSelectChallenge={selectChallenge}
              pendingSideQuestDetailId={shell.pendingSideQuestDetailId}
              pendingCompletedDetailId={shell.pendingCompletedDetailId}
              onOpenChallengeDetail={openChallengeDetail}
              onOpenCompletedQuestDetail={openCompletedQuestDetail}
              onConsumePendingQuestOpen={clearPendingQuestOpen}
              onSelectTab={selectTab}
              onOpenMultiplayerCreate={openMultiplayerCreate}
              pendingMultiplayerCreateOpen={pendingMultiplayerCreateOpen}
              pendingMultiplayerCreateQuestId={pendingMultiplayerCreateQuestId}
              onConsumePendingMultiplayerCreate={() => {
                setPendingMultiplayerCreateOpen(false);
                setPendingMultiplayerCreateQuestId(null);
              }}
              onAccountUpdated={loadAccount}
            />
          </>
        ) : null}
      </ScrollView>
      {["sideQuests", "multiplayerSideQuests", "officialLeaderboards", "account"].includes(shell.activeTab) ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Close current screen" style={styles.floatingScreenCloseButton} onPress={() => selectTab("home")}>
          <MaterialCommunityIcons name="close" size={22} color={colors.paper} />
        </Pressable>
      ) : null}
      {shell.activeTab === "home" ? null : <ScrollHintOverlay canScrollUp={canScrollUp} canScrollDown={canScrollDown} bottomInset={insets.bottom} />}
    </SafeAreaView>
  );

}


function TopTrackerNav({ activeTab, account: _account, onSelectTab }: { activeTab: AppTab; account: MobileAccountResponse | null; onSelectTab: (tab: AppTab) => void }) {
  return (
    <View style={compactStyles.topNavPanel} accessibilityLabel="SQC tracker sections">
      <View style={compactStyles.topNavRail}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
            accessibilityLabel={`Open ${tab.label}`}
            testID={`mobile-top-nav-${tab.id}`}
            style={[compactStyles.topNavChip, activeTab === tab.id && compactStyles.topNavChipActive]}
            onPress={() => onSelectTab(tab.id)}
          >
            <Text style={[compactStyles.topNavChipText, activeTab === tab.id && compactStyles.topNavChipTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ScrollHintOverlay({ canScrollUp, canScrollDown, bottomInset }: { canScrollUp: boolean; canScrollDown: boolean; bottomInset: number }) {
  if (!canScrollUp && !canScrollDown) return null;

  const bottomHintOffset = Math.max(56, bottomInset + 48);

  return (
    <View pointerEvents="none" style={styles.scrollHintLayer}>
      <View style={[styles.scrollHintPill, { bottom: bottomHintOffset }]}>
        {canScrollUp ? <MaterialCommunityIcons name="chevron-up" size={18} color="rgba(255,247,232,.72)" /> : null}
        {canScrollDown ? <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,247,232,.72)" /> : null}
      </View>
    </View>
  );
}

function ScrollHintedScrollView({ children, onScroll, onLayout, onContentSizeChange, scrollEventThrottle, ...props }: ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const [hintState, setHintState] = useState({ y: 0, viewportHeight: 0, contentHeight: 0 });
  const canScrollUp = hintState.y > 18;
  const canScrollDown = hintState.contentHeight > 0 && hintState.viewportHeight > 0 && hintState.y + hintState.viewportHeight < hintState.contentHeight - 18;

  function handleHintScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setHintState({ y: contentOffset.y, viewportHeight: layoutMeasurement.height, contentHeight: contentSize.height });
    onScroll?.(event);
  }

  function handleHintLayout(event: LayoutChangeEvent) {
    const viewportHeight = event.nativeEvent.layout.height;
    setHintState((current) => ({ ...current, viewportHeight }));
    onLayout?.(event);
  }

  function handleHintContentSizeChange(width: number, contentHeight: number) {
    setHintState((current) => ({ ...current, contentHeight }));
    onContentSizeChange?.(width, contentHeight);
  }

  return (
    <View style={styles.scrollHintFrame}>
      <ScrollView
        {...props}
        scrollEventThrottle={scrollEventThrottle ?? 32}
        onScroll={handleHintScroll}
        onLayout={handleHintLayout}
        onContentSizeChange={handleHintContentSizeChange}
      >
        {children}
      </ScrollView>
      <ScrollHintOverlay canScrollUp={canScrollUp} canScrollDown={canScrollDown} bottomInset={insets.bottom} />
    </View>
  );
}

function TodayDashboard({
  bootstrap,
  account,
  authBridge,
  onSelectTab,
  onOpenMultiplayerCreate,
  onSelectChallenge,
  onAccountUpdated,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectTab: (tab: AppTab) => void;
  onOpenMultiplayerCreate: () => void;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onAccountUpdated: AccountUpdatedCallback;
}) {
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const latestReceipt = signedIn?.latestReceipt;
  const activeOfficialChallenge = signedIn?.activeQuest?.id ? bootstrap.challenges.find((challenge) => challenge.id === signedIn.activeQuest?.id) ?? null : null;
  const activeCustomQuest = signedIn?.activeQuest?.id ? signedIn.customSideQuests?.find((quest) => quest.id === signedIn.activeQuest?.id) ?? null : null;
  const activeChallenge = activeOfficialChallenge ?? (signedIn?.activeQuest ? buildCustomActiveChallenge(signedIn.activeQuest, activeCustomQuest) : null);
  const activeCoatSource = activeChallenge
    ? getChallengeCoatImageSource(activeChallenge)
    : { uri: absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") };
  const activeQuestReceipt = latestReceipt?.challengeId === signedIn?.activeQuest?.id ? latestReceipt : null;
  const latestCheckText = activeQuestReceipt?.headline ? normalizeCheckHeadline(activeQuestReceipt.headline) : null;
  const latestCheckPassed = Boolean(latestCheckText?.toLowerCase().includes("passed"));
  const latestCheckFailed = isFailedReceipt(activeQuestReceipt);
  const canViewCurrentProof = Boolean(signedIn?.activeQuest?.completed || latestCheckPassed);
  const activeStatus = signedIn?.activeQuest?.completed || latestCheckPassed ? "Completed" : signedIn?.activeQuest ? "In progress" : "No active Side Quest";
  const activeQuestGoal = activeChallenge?.objective ?? activeChallenge?.proofCallout ?? "Choose one Side Quest to attempt in your next real chess game.";
  const activeQuestLatestCheck = formatLatestCheckTime(activeQuestReceipt?.checkedAt ?? signedIn?.activeQuest?.verifiedAt);
  const activeQuestPickedLabel = formatQuestPickedDate(signedIn?.activeQuest?.startedAt);
  const activeQuestProofNeeded = activeChallenge?.proofCallout ?? activeChallenge?.instruction ?? "Play a new public game on Lichess or Chess.com that matches this Side Quest.";
  const officialPublic = (signedIn?.officialPublicGroupQuests ?? []).filter((quest) => quest.official || quest.id.startsWith("official-"));
  const activeMultiplayer = signedIn?.activeGroupQuests ?? [];
  const hasChessAccount = Boolean(signedIn?.chessAccounts.hasAny);
  const [actionState, setActionState] = useState<{ busy: boolean; message: string | null; error: string | null }>({ busy: false, message: null, error: null });
  const [groupQuestActionState, setGroupQuestActionState] = useState<{ busy: boolean; questId: string | null; message: string | null; error: string | null }>({
    busy: false,
    questId: null,
    message: null,
    error: null,
  });
  const [currentDetailOpen, setCurrentDetailOpen] = useState(false);
  const [joinedMultiplayerId, setJoinedMultiplayerId] = useState<string | null>(null);
  const joinedMultiplayerQuest = joinedMultiplayerId ? activeMultiplayer.find((quest) => quest.id === joinedMultiplayerId) ?? null : null;
  const [officialMultiplayerId, setOfficialMultiplayerId] = useState<string | null>(null);
  const officialMultiplayerQuest = officialMultiplayerId ? officialPublic.find((quest) => quest.id === officialMultiplayerId) ?? null : null;
  const [showAllActiveMultiplayer, setShowAllActiveMultiplayer] = useState(false);
  const [showAllTrophyCabinet, setShowAllTrophyCabinet] = useState(false);
  const [homeMenuOpen, setHomeMenuOpen] = useState(false);
  const visibleActiveMultiplayer = showAllActiveMultiplayer ? activeMultiplayer : activeMultiplayer.slice(0, 5);
  const [completedProofId, setCompletedProofId] = useState<string | null>(null);
  const [celebrationUnlock, setCelebrationUnlock] = useState<CompletionCelebrationUnlock | null>(null);
  const celebratedCompletionIds = useRef<Set<string>>(new Set());
  const previousCompletedIdsRef = useRef<Set<string> | null>(null);
  const signedInCompletedChallengeKey = signedIn?.progress.completedChallengeIds.join("|") ?? "";
  const completedProofRecord = completedProofId ? signedIn?.completedQuests.find((quest) => quest.id === completedProofId) ?? null : null;
  const completedProofOfficialChallenge = completedProofId ? bootstrap.challenges.find((challenge) => challenge.id === completedProofId) ?? null : null;
  const completedProofCustomQuest = completedProofId ? signedIn?.customSideQuests?.find((quest) => quest.id === completedProofId) ?? null : null;
  const completedProofChallenge = completedProofOfficialChallenge ?? (completedProofRecord ? buildCustomProofChallenge(completedProofRecord, completedProofCustomQuest) : null);
  const latestCompletedQuest = signedIn?.completedQuests[0] ?? null;
  const latestCompletedChallenge = latestCompletedQuest ? bootstrap.challenges.find((challenge) => challenge.id === latestCompletedQuest.id) ?? null : null;
  const unlockedCoatCount = (signedIn?.completedQuests.length ?? 0) + (signedIn?.multiplayerTrophies?.length ?? 0);
  const trophyCabinetItems = [
    ...(signedIn?.multiplayerTrophies ?? []).map((trophy) => ({ kind: "multiplayer" as const, trophy })),
    ...(signedIn?.completedQuests ?? []).map((quest) => ({ kind: "solo" as const, quest })),
  ];
  const visibleTrophyCabinetItems = showAllTrophyCabinet ? trophyCabinetItems : trophyCabinetItems.slice(0, 5);

  function handleSignIn() {
    if (authBridge.startGoogleSignIn) return void authBridge.startGoogleSignIn();
    showNativeOnlyNotice("Sign-in is unavailable right now.");
  }

  function openHomeMenuTab(tab: AppTab) {
    setHomeMenuOpen(false);
    onSelectTab(tab);
  }

  function openCurrentProof() {
    const completedId = signedIn?.activeQuest?.id;
    if (completedId && signedIn.completedQuests.some((quest) => quest.id === completedId)) {
      setCurrentDetailOpen(false);
      setCompletedProofId(completedId);
      return;
    }
    showNativeOnlyNotice("This result is saved. Open it from the completed Side Quest card once account sync finishes.");
  }

  const showNewCompletionCelebration = useCallback((
    previousCompletedIds: Set<string>,
    nextAccount: MobileAccountResponse | null,
    mode: CompletionCelebrationMode,
    multiplayerPointsAwarded: string | null = null,
  ) => {
    if (!isAuthenticatedAccount(nextAccount)) return;

    const newlyCompleted = nextAccount.completedQuests.filter((quest) => !previousCompletedIds.has(quest.id) && !celebratedCompletionIds.current.has(quest.id));
    if (!newlyCompleted.length) return;

    newlyCompleted.forEach((quest) => celebratedCompletionIds.current.add(quest.id));
    const quest = newlyCompleted[0];
    const challenge = bootstrap.challenges.find((candidate) => candidate.id === quest.id) ?? null;
    setCelebrationUnlock({
      challengeId: quest.id,
      challengeTitle: quest.title,
      badgeName: quest.badgeName,
      proofHref: quest.proofHref,
      reward: quest.reward,
      completedAt: quest.completedAt,
      family: getCelebrationFamily(challenge),
      accentColor: getSafeBadgeColors(challenge).primary,
      flavorLine: getCelebrationFlavorLine(challenge),
      mode,
      multiplayerPointsAwarded,
      extraCompletedCount: Math.max(0, newlyCompleted.length - 1),
    });
  }, [bootstrap.challenges]);

  useEffect(() => {
    if (!signedIn) {
      previousCompletedIdsRef.current = null;
      return;
    }

    const currentCompletedIds = getCompletedQuestIdSet(signedIn);
    const previousCompletedIds = previousCompletedIdsRef.current;
    previousCompletedIdsRef.current = currentCompletedIds;

    if (!previousCompletedIds) return;
    showNewCompletionCelebration(previousCompletedIds, signedIn, "solo");
  }, [signedIn, signedInCompletedChallengeKey, showNewCompletionCelebration]);

  async function runActiveCheck() {
    if (!signedIn?.activeQuest?.id || signedIn.activeQuest.completed) return;
    const previousCompletedIds = getCompletedQuestIdSet(signedIn);
    if (!authBridge.isSignedIn) {
      onAccountUpdated();
      setActionState({ busy: false, message: "Updated account state.", error: null });
      return;
    }

    setActionState({ busy: true, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileQuestAction({ sessionToken, action: "check", challengeId: signedIn.activeQuest.id });
      const nextAccount = await Promise.resolve(onAccountUpdated());
      const coercedAccount = coerceAccountResponse(nextAccount);
      const refreshedReceipt = isAuthenticatedAccount(coercedAccount) ? coercedAccount.latestReceipt : null;
      setActionState({ busy: false, message: getCheckActionMessage(refreshedReceipt) || result.message, error: null });
      showNewCompletionCelebration(previousCompletedIds, coercedAccount, "solo");
    } catch (caught) {
      setActionState({ busy: false, message: null, error: caught instanceof Error ? caught.message : "Could not check this Side Quest." });
    }
  }

  async function runGroupQuestAction(groupQuestId: string, action: "join" | "leave" | "refresh" | "update" | "remove-participant", payload?: Record<string, unknown>) {
    if (!authBridge.isSignedIn) {
      showNativeOnlyNotice("Sign in to manage Multiplayer Side Quests in the app.");
      return;
    }

    setGroupQuestActionState({ busy: true, questId: groupQuestId, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const previousCompletedIds = signedIn ? getCompletedQuestIdSet(signedIn) : new Set<string>();
      const result = await runMobileGroupQuestAction({ sessionToken, groupQuestId, action, payload });
      const refreshedAccount = await Promise.resolve(onAccountUpdated());
      if (action === "refresh") {
        showNewCompletionCelebration(previousCompletedIds, coerceAccountResponse(refreshedAccount), "multiplayer", null);
      }
      if (action === "join" || action === "leave" || action === "update" || action === "remove-participant") {
        await waitMs(450);
        await Promise.resolve(onAccountUpdated());
      }
      setGroupQuestActionState({ busy: false, questId: groupQuestId, message: result.message, error: null });

      if (action === "join") {
        setOfficialMultiplayerId(groupQuestId);
        setJoinedMultiplayerId(null);
      }

      if (action === "leave") {
        setJoinedMultiplayerId((current) => current === groupQuestId ? null : current);
        setOfficialMultiplayerId((current) => current === groupQuestId ? null : current);
      }
    } catch (caught) {
      setGroupQuestActionState({
        busy: false,
        questId: groupQuestId,
        message: null,
        error: caught instanceof Error ? caught.message : "Could not update this Multiplayer Side Quest.",
      });
    }
  }

  if (!signedIn) {
    return (
      <View style={compactStyles.freshShell}>
        <View style={[compactStyles.freshHeader, compactStyles.freshHeaderCentered]}>
          <Text style={[compactStyles.freshTitle, compactStyles.centerText]}>Side Quest Chess</Text>
        </View>
        <View style={compactStyles.freshGuestCoatWrap}>
          <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.freshGuestCoat} resizeMode="contain" />
        </View>
        <View style={compactStyles.freshPanelCentered}>
          <Text style={[compactStyles.freshSectionTitle, compactStyles.centerText]}>Sign in to continue.</Text>
          <Text style={[compactStyles.freshBody, compactStyles.centerText]}>Chess, but with stupidly hard side quests — solo or multiplayer. Sign in to pick a solo quest or join a Multiplayer Side Quest, play a real Lichess or Chess.com game, then come back for automatic proof.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Sign in" style={[compactStyles.primaryAction, compactStyles.primaryActionCentered]} onPress={handleSignIn}>
            <Text style={compactStyles.primaryActionText}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={compactStyles.freshShell}>
      <View style={compactStyles.freshHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel={homeMenuOpen ? "Close main menu" : "Open main menu"} style={[compactStyles.homeMenuButton, homeMenuOpen && compactStyles.homeMenuButtonActive]} onPress={() => setHomeMenuOpen((current) => !current)}>
          <MaterialCommunityIcons name="menu" size={22} color={colors.paper} />
        </Pressable>
        <View style={compactStyles.identityBlock}>
          <AccountIdentityLine
            name={signedIn.profile.displayName}
            lichessUsername={signedIn.chessAccounts.lichessUsername}
            chessComUsername={signedIn.chessAccounts.chessComUsername}
          />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open account settings" style={compactStyles.accountDot} onPress={() => onSelectTab("account")}>
          {signedIn.profile.imageUrl ? (
            <Image source={{ uri: signedIn.profile.imageUrl }} style={compactStyles.accountAvatarImage} resizeMode="cover" />
          ) : (
            <Text style={compactStyles.accountDotText}>{signedIn.profile.displayName.slice(0, 1).toUpperCase()}</Text>
          )}
        </Pressable>
      </View>

      <Modal visible={homeMenuOpen} transparent animationType="fade" onRequestClose={() => setHomeMenuOpen(false)}>
        <View style={compactStyles.homeMenuOverlay}>
          <Pressable style={compactStyles.homeMenuBackdrop} accessibilityRole="button" accessibilityLabel="Close main menu" onPress={() => setHomeMenuOpen(false)} />
          <View style={compactStyles.homeMenuPanel} accessibilityLabel="Main menu">
            <View style={compactStyles.homeMenuItems}>
              <Pressable accessibilityRole="button" accessibilityLabel="Open Solo Side Quests" style={compactStyles.homeMenuItem} onPress={() => openHomeMenuTab("sideQuests")}>
                <MaterialCommunityIcons name="flag-checkered" size={17} color={colors.gold} />
                <Text style={compactStyles.homeMenuItemText}>Solo Side Quests</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Open Multiplayer Side Quests" style={compactStyles.homeMenuItem} onPress={() => openHomeMenuTab("multiplayerSideQuests")}>
                <MaterialCommunityIcons name="account-group" size={17} color={colors.gold} />
                <Text style={compactStyles.homeMenuItemText}>Multiplayer</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Open Trophy Cabinet" style={compactStyles.homeMenuItem} onPress={() => openHomeMenuTab("coatOfArms")}>
                <MaterialCommunityIcons name="shield-star" size={17} color={colors.gold} />
                <Text style={compactStyles.homeMenuItemText}>Trophy Cabinet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {!hasChessAccount ? (
        <Pressable accessibilityRole="button" style={compactStyles.blockerPanel} onPress={() => onSelectTab("account")}>
          <Text style={compactStyles.blockerTitle}>Connect a chess username</Text>
          <Text style={compactStyles.blockerCopy}>SQC needs Lichess or Chess.com before it can check real games.</Text>
        </Pressable>
      ) : null}

      <View style={compactStyles.activeSoloSection}>
        <View style={compactStyles.activeSoloRefreshRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Refresh active Solo Side Quest" style={[compactStyles.headerIconButton, actionState.busy && compactStyles.disabledAction]} disabled={actionState.busy} onPress={() => void runActiveCheck()}>
            <MaterialCommunityIcons name={actionState.busy ? "sync" : "refresh"} size={17} color={colors.gold} />
          </Pressable>
        </View>
        {signedIn.activeQuest ? (
          <View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open Current Active Side Quest details" style={compactStyles.activeSoloSummary} onPress={() => setCurrentDetailOpen(true)}>
            <View style={compactStyles.currentQuestHero}>
              <View style={compactStyles.coatHeroMarker}>
                {activeChallenge ? <Image source={getChallengeCoatGlowSource(activeChallenge.id)} style={[compactStyles.coatHeroGlowImage, { tintColor: getSafeBadgeColors(activeChallenge).glow }]} resizeMode="contain" /> : null}
                <Image source={activeCoatSource} style={compactStyles.coatHeroImage} resizeMode="contain" />
                {signedIn.activeQuest.completed || latestCheckPassed ? <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.coatHeroSeal} resizeMode="contain" /> : null}
              </View>
              <View style={compactStyles.activeSoloPill}>
                <Text style={compactStyles.activeSoloPillText}>Active Solo Side Quest</Text>
              </View>
              <Text style={compactStyles.currentQuestHeroTitle} numberOfLines={2}>{signedIn.activeQuest.title}</Text>
            </View>
            {actionState.message && !latestCheckFailed ? <Text style={compactStyles.inlineSuccess}>{actionState.message}</Text> : null}
            {actionState.error ? <Text style={compactStyles.inlineError}>{actionState.error}</Text> : null}
          </Pressable>
          {canViewCurrentProof && activeQuestReceipt ? <ActiveQuestMiniProofBoard receipt={activeQuestReceipt} goal={activeQuestGoal} pickedLabel={activeQuestPickedLabel} latestCheckLabel={activeQuestLatestCheck} statusLabel="Completed" /> : null}
          {!canViewCurrentProof && latestCheckFailed && activeQuestReceipt ? <ActiveQuestFailureSummary receipt={activeQuestReceipt} goal={activeQuestGoal} pickedLabel={activeQuestPickedLabel} latestCheckLabel={activeQuestLatestCheck} statusLabel="Not Completed" /> : null}
          {!canViewCurrentProof && (!activeQuestReceipt || isPendingReceipt(activeQuestReceipt)) ? <ActiveQuestNoGameSummary goal={activeQuestGoal} pickedLabel={activeQuestPickedLabel} latestCheckLabel={activeQuestLatestCheck} statusLabel="Not Completed" /> : null}
          <View style={compactStyles.activeSoloActions}>
            <Pressable accessibilityRole="button" accessibilityLabel={canViewCurrentProof ? "Pick your next Solo Side Quest" : "Explore More Solo Side Quests"} style={compactStyles.soloSecondaryAction} onPress={() => onSelectTab("sideQuests")}>
              <Text style={compactStyles.soloSecondaryActionText}>{canViewCurrentProof ? "Pick your next Solo Side Quest" : "Explore More Solo Side Quests"}</Text>
            </Pressable>
          </View>
          </View>
        ) : (
          <View style={compactStyles.emptyQuestPanel}>
            <View style={compactStyles.emptyQuestHeroRow}>
              <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.emptyQuestCoat} resizeMode="contain" />
              <View style={compactStyles.currentQuestText}>
                <Text style={compactStyles.currentQuestTitle}>Choose a Solo Side Quest</Text>
                <Text style={compactStyles.currentQuestMeta}>Choose a Side Quest, play on Lichess or Chess.com, then come back for automatic proof.</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Explore Solo Side Quests" style={compactStyles.primaryAction} onPress={() => onSelectTab("sideQuests")}>
              <Text style={compactStyles.primaryActionText}>Explore Solo Side Quests</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={compactStyles.pullRefreshHint}>
        <MaterialCommunityIcons name="arrow-down" size={13} color="rgba(199,189,169,.72)" />
        <Text style={compactStyles.pullRefreshHintText}>Pull down to refresh</Text>
      </View>

      <CurrentSideQuestDetailModal
        visible={currentDetailOpen}
        signedIn={signedIn}
        challenge={activeChallenge}
        activeCoatSource={activeCoatSource}
        activeQuestGoal={activeQuestGoal}
        pickedLabel={activeQuestPickedLabel}
        proofNeeded={activeQuestProofNeeded}
        latestCheckLabel={activeQuestLatestCheck}
        latestCheckPassed={latestCheckPassed}
        latestReceipt={activeQuestReceipt ?? null}
        canViewCurrentProof={canViewCurrentProof}
        actionState={actionState}
        onClose={() => setCurrentDetailOpen(false)}
        onRunCheck={runActiveCheck}
        onViewProof={openCurrentProof}
        onSwitchQuest={() => {
          setCurrentDetailOpen(false);
          onSelectTab("sideQuests");
        }}
      />

      <View style={compactStyles.activeMultiplayerSection}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open active Multiplayer Side Quest details" style={compactStyles.activeMultiplayerSummary} onPress={() => activeMultiplayer[0] ? setJoinedMultiplayerId(activeMultiplayer[0].id) : onSelectTab("multiplayerSideQuests")}>
          <View style={compactStyles.multiplayerHeroMarker}>
            <Image source={SQC_BLACK_SEAL_ASSET} style={compactStyles.multiplayerHeroSeal} resizeMode="contain" />
          </View>
          <View style={compactStyles.activeSoloPill}>
            <Text style={compactStyles.activeSoloPillText}>Active Multiplayer Side Quests</Text>
          </View>
          <Text style={compactStyles.currentQuestHeroTitle} numberOfLines={2}>{activeMultiplayer.length ? `${activeMultiplayer.length} active Multiplayer Side Quest${activeMultiplayer.length === 1 ? "" : "s"}` : "No active Multiplayer Side Quests"}</Text>
        </Pressable>

        <View style={compactStyles.activeMultiplayerList}>
          {visibleActiveMultiplayer.length ? visibleActiveMultiplayer.map((quest) => (
            <AppRow key={quest.id} title={cleanMultiplayerTitle(quest.title)} meta={getJoinedMultiplayerListMeta(quest)} status={quest.isOwner ? "Host" : "Joined"} sourceBadge={quest.isOwner ? "Your room" : "Joined"} imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => setJoinedMultiplayerId(quest.id)} />
          )) : (
            <AppRow title="No active Multiplayer Side Quests" meta="Join or host shared challenges with friends." status="Explore" imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => onSelectTab("multiplayerSideQuests")} />
          )}
          {activeMultiplayer.length > 5 ? (
            <AppRow title={showAllActiveMultiplayer ? "Show fewer Multiplayer Side Quests" : "Show all active Multiplayer Side Quests"} meta={showAllActiveMultiplayer ? "Collapse this list back to the top five." : `${activeMultiplayer.length - 5} more active Multiplayer Side Quest${activeMultiplayer.length - 5 === 1 ? "" : "s"}.`} status={showAllActiveMultiplayer ? "Collapse" : "Expand"} imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => setShowAllActiveMultiplayer((current) => !current)} />
          ) : null}
        </View>

        <View style={compactStyles.activeSoloActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Explore More Multiplayer Side Quests" style={compactStyles.soloSecondaryAction} onPress={() => onSelectTab("multiplayerSideQuests")}>
            <Text style={compactStyles.soloSecondaryActionText}>Explore More Multiplayer Side Quests</Text>
          </Pressable>
        </View>
      </View>


      <JoinedMultiplayerQuestModal
        key={joinedMultiplayerQuest?.id ?? "joined"}
        visible={Boolean(joinedMultiplayerQuest)}
        quest={joinedMultiplayerQuest}
        challenges={bootstrap.challenges}
        customQuests={signedIn?.customSideQuests ?? []}
        mode="joined"
        busy={groupQuestActionState.busy && groupQuestActionState.questId === joinedMultiplayerQuest?.id}
        message={groupQuestActionState.questId === joinedMultiplayerQuest?.id ? groupQuestActionState.message : null}
        error={groupQuestActionState.questId === joinedMultiplayerQuest?.id ? groupQuestActionState.error : null}
        onClose={() => setJoinedMultiplayerId(null)}
        onRefresh={() => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "refresh") : undefined}
        onLeave={() => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "leave") : undefined}
        onJoin={undefined}
        onUpdate={(payload) => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "update", payload) : undefined}
        onRemoveParticipant={(participantUserId) => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "remove-participant", { participantUserId }) : undefined}
      />

      <JoinedMultiplayerQuestModal
        key={officialMultiplayerQuest?.id ?? "official"}
        visible={Boolean(officialMultiplayerQuest)}
        quest={officialMultiplayerQuest ?? null}
        challenges={bootstrap.challenges}
        mode={officialMultiplayerQuest?.joinState === "Joined" ? "joined" : "public"}
        busy={groupQuestActionState.busy && groupQuestActionState.questId === officialMultiplayerQuest?.id}
        message={groupQuestActionState.questId === officialMultiplayerQuest?.id ? groupQuestActionState.message : null}
        error={groupQuestActionState.questId === officialMultiplayerQuest?.id ? groupQuestActionState.error : null}
        onClose={() => setOfficialMultiplayerId(null)}
        onRefresh={() => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "refresh") : undefined}
        onLeave={() => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "leave") : undefined}
        onJoin={() => officialMultiplayerQuest && officialMultiplayerQuest.status !== "Finished" ? void runGroupQuestAction(officialMultiplayerQuest.id, "join") : undefined}
        onUpdate={(payload) => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "update", payload) : undefined}
        onRemoveParticipant={(participantUserId) => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "remove-participant", { participantUserId }) : undefined}
      />


      <View style={compactStyles.trophyCabinetSection}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open Trophy Cabinet" style={compactStyles.activeMultiplayerSummary} onPress={() => onSelectTab("coatOfArms")}>
          <View style={compactStyles.trophyHeroMarker}>
            <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.trophyHeroCoat} resizeMode="contain" />
          </View>
          <View style={compactStyles.activeSoloPill}>
            <Text style={compactStyles.activeSoloPillText}>Trophy Cabinet</Text>
          </View>
        </Pressable>

        <View style={compactStyles.activeMultiplayerList}>
          {visibleTrophyCabinetItems.length ? visibleTrophyCabinetItems.map((item) => {
            if (item.kind === "multiplayer") {
              return (
                <AppRow
                  key={`multiplayer-${item.trophy.id}`}
                  title={item.trophy.title}
                  meta={`Multiplayer placement · ${item.trophy.rankLabel}`}
                  status={undefined}
                  statusImageSource={getMultiplayerTrophySealSource(item.trophy.placement)}
                  imageSource={SQC_MULTIPLAYER_SEAL_ASSET}
                  variant="seal"
                  onPress={() => onSelectTab("coatOfArms")}
                />
              );
            }
            const completedChallenge = bootstrap.challenges.find((challenge) => challenge.id === item.quest.id) ?? null;
            return (
              <AppRow
                key={`solo-${item.quest.id}`}
                title={cleanMultiplayerTitle(item.quest.title)}
                meta={`Unlocked ${item.quest.badgeName}`}
                status={undefined}
                statusImageSource={SQC_COMPLETED_RED_SEAL_ASSET}
                imageSource={completedChallenge ? getChallengeCoatImageSource(completedChallenge) : getRowImageSource(item.quest.badgeImageUrl)}
                glowSource={completedChallenge ? getChallengeCoatGlowSource(completedChallenge.id) : null}
                glowColor={getSafeBadgeColors(completedChallenge).glow}
                onPress={() => setCompletedProofId(item.quest.id)}
              />
            );
          }) : (
            <AppRow title="No Coat of Arms yet" meta="Complete a Side Quest to unlock your first trophy." status="Explore" imageSource={SQC_COAT_OF_ARMS_ASSET} onPress={() => onSelectTab("sideQuests")} />
          )}
          {trophyCabinetItems.length > 5 ? (
            <AppRow title={showAllTrophyCabinet ? "Show fewer Trophy Cabinet items" : "Show all Trophy Cabinet items"} meta={showAllTrophyCabinet ? "Collapse this list back to the top five." : `${trophyCabinetItems.length - 5} more unlocked item${trophyCabinetItems.length - 5 === 1 ? "" : "s"}.`} status={showAllTrophyCabinet ? "Collapse" : "Expand"} imageSource={SQC_COAT_OF_ARMS_ASSET} onPress={() => setShowAllTrophyCabinet((current) => !current)} />
          ) : null}
        </View>

        <View style={compactStyles.activeSoloActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open Trophy Cabinet" style={compactStyles.soloSecondaryAction} onPress={() => onSelectTab("coatOfArms")}>
            <Text style={compactStyles.soloSecondaryActionText}>Open Trophy Cabinet</Text>
          </Pressable>
        </View>
      </View>

      <View style={compactStyles.pullRefreshHint}>
        <MaterialCommunityIcons name="arrow-down" size={13} color="rgba(199,189,169,.72)" />
        <Text style={compactStyles.pullRefreshHintText}>Pull down to refresh</Text>
      </View>

      <Modal visible={Boolean(completedProofRecord && completedProofChallenge)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setCompletedProofId(null)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <GradientBackdrop challenge={completedProofChallenge} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close completed Side Quest proof" style={compactStyles.detailCloseButton} onPress={() => setCompletedProofId(null)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            {completedProofRecord && completedProofChallenge ? (
              <CompletedQuestProofCard
                challenge={completedProofChallenge}
                completedQuest={completedProofRecord}
                authBridge={authBridge}
                onAccountUpdated={onAccountUpdated}
              />
            ) : null}
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>

      <CompletionCelebrationOverlay
        unlock={celebrationUnlock}
        challenge={celebrationUnlock ? bootstrap.challenges.find((challenge) => challenge.id === celebrationUnlock.challengeId) ?? null : null}
        onClose={() => setCelebrationUnlock(null)}
      />

    </View>
  );
}

function JoinedMultiplayerQuestModal({
  visible,
  quest,
  challenges = [],
  customQuests = [],
  mode = "joined",
  busy = false,
  message = null,
  error = null,
  onClose,
  onRefresh,
  onLeave,
  onJoin,
  onUpdate,
  onRemoveParticipant,
  onReport,
  onViewHost,
}: {
  visible: boolean;
  quest: MobileGroupQuestSummary | null;
  challenges?: MobileChallenge[];
  customQuests?: MobileCustomSideQuest[];
  mode?: "joined" | "public";
  busy?: boolean;
  message?: string | null;
  error?: string | null;
  onClose: () => void;
  onRefresh?: () => void;
  onLeave?: () => void;
  onJoin?: () => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onRemoveParticipant?: (participantUserId: string) => void;
  onReport?: (quest: MobileGroupQuestSummary) => void;
  onViewHost?: (quest: MobileGroupQuestSummary) => void;
}) {
  const [proofMode, setProofMode] = useState(false);
  const [selectedRuleQuestTitle, setSelectedRuleQuestTitle] = useState<string | null>(null);
  const [adminName, setAdminName] = useState(quest?.title ?? "");
  const [adminInviteCopy, setAdminInviteCopy] = useState(cleanMultiplayerInviteCopy(quest?.inviteCopy));
  const [adminInviteMode, setAdminInviteMode] = useState<"public" | "private-key">(quest?.inviteMode === "private-key" ? "private-key" : "public");
  const [adminProviderMode, setAdminProviderMode] = useState<"both" | "lichess" | "chesscom">(quest?.providerMode ?? "both");
  const [adminStartAt, setAdminStartAt] = useState(() => dateFromGroupQuestValue(quest?.startAt));
  const [adminEndAt, setAdminEndAt] = useState(() => dateFromGroupQuestValue(quest?.endAt, setGroupQuestDuration(dateFromGroupQuestValue(quest?.startAt), 7)));
  const [adminRules, setAdminRules] = useState<Record<string, string>>(quest?.rules ?? { timeControl: "Any time control", rated: "Any rated state", color: "Any color" });
  const [adminQuestIds, setAdminQuestIds] = useState<string[]>(quest?.questIds ?? []);


  if (!quest) return null;

  const activeQuest = quest;

  function closeModal() {
    setProofMode(false);
    setSelectedRuleQuestTitle(null);
    onClose();
  }

  const metaParts = quest.copy.split(" · ");
  const joinClosed = quest.status === "Finished" || quest.timeLeftLabel === "Final" || metaParts.includes("Final");
  const players = quest.playersLabel ?? metaParts[0] ?? "Players pending";
  const timeLeft = quest.timeLeftLabel ?? metaParts[1] ?? "Window open";
  const position = quest.positionLabel ?? metaParts[2] ?? (mode === "joined" ? "Rank pending" : "Join to place");
  const verified = quest.verifiedLabel ?? "0 / 4";
  const verifiedCompact = `${verified.replace(" / ", "/")} verified`;
  const questInputs = (quest.questIds?.length ? quest.questIds.map((questId, index) => ({ questId, title: quest.questTitles?.[index] ?? questId })) : (quest.questTitles ?? []).map((title) => ({ title })));
  const completedQuestTitles = new Set((quest.completedQuestTitles ?? []).map((title) => title.toLowerCase()));
  const ruleRows = [
    { label: "Starts", value: formatGroupQuestDate(quest.startAt) },
    { label: "Ends", value: formatGroupQuestDate(quest.endAt) },
    ...(quest.ruleRows ?? [
      { label: "Games allowed", value: "Lichess or Chess.com" },
      { label: "Variant", value: "Standard chess only" },
      { label: "Proof", value: "Fresh public games inside this window" },
      { label: "Winner", value: "First to complete all included Side Quests wins; otherwise best completion progress at the deadline wins." },
    ]),
  ];
  const leaderboardRows = quest.leaderboardRows ?? [
    { rank: "#1", name: "SAM", provider: "lichess · and72nor", points: "0/4", verified: "0/4 verified", note: "Joined this Multiplayer Side Quest" },
    { rank: position, name: "Andreas", provider: "lichess · and72nor", points: verified.replace(" / ", "/"), verified: verifiedCompact, note: "You" },
  ];
  const questRows = questInputs.map((entry) => getMultiplayerQuestBrowseRow(entry, challenges, quest.customQuestSummaries));
  const adminQuestChoices = getMultiplayerQuestChoices(challenges, customQuests, quest.customQuestSummaries);
  const selectedRuleQuest = selectedRuleQuestTitle ? questRows.find((row) => row.title === selectedRuleQuestTitle) ?? null : null;

  function toggleAdminQuestId(questId: string) {
    setAdminQuestIds((current) => current.includes(questId) ? (current.length > 1 ? current.filter((id) => id !== questId) : current) : [...current, questId].slice(0, 8));
  }

  function saveAdminSettings() {
    onUpdate?.({
      name: adminName,
      inviteCopy: adminInviteCopy,
      inviteMode: adminInviteMode,
      questIds: adminQuestIds.length ? adminQuestIds : (quest?.questIds ?? []),
      providerMode: adminProviderMode,
      startAt: adminStartAt.toISOString(),
      endAt: adminEndAt.toISOString(),
      rules: adminRules,
    });
  }

  async function copyInviteKey() {
    const key = quest?.inviteKey?.trim();
    if (!key) {
      Alert.alert("Invite code not ready", "Refresh this Multiplayer Side Quest and try again.");
      return;
    }
    await Clipboard.setStringAsync(key);
    Alert.alert("Invite code copied", key);
  }

  async function copyInviteLink() {
    await Clipboard.setStringAsync(getMultiplayerInviteUrl(activeQuest));
    Alert.alert("Invite link copied", "Paste it into Telegram, WhatsApp, Discord, SMS, or anywhere else your players already are.");
  }

  async function shareInviteLink() {
    try {
      await Share.share({
        title: `Side Quest Chess: ${activeQuest.title}`,
        message: getMultiplayerInviteMessage(activeQuest),
        url: getMultiplayerInviteUrl(activeQuest),
      });
    } catch {
      Alert.alert("Could not open sharing", "Copy the invite link instead and send it from your chat app.");
    }
  }

  function removeParticipant(row: (typeof leaderboardRows)[number]) {
    if (!row.userId || !row.removable) return;
    Alert.alert("Remove player", `Remove ${row.name} from this Multiplayer Side Quest.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onRemoveParticipant?.(row.userId as string) },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={closeModal}>
      <SafeAreaView style={compactStyles.detailScreen}>
        <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
        <View style={compactStyles.detailTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close joined Multiplayer Side Quest" style={compactStyles.detailCloseButton} onPress={closeModal}>
            <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
          </Pressable>
        </View>
        <ScrollHintedScrollView
          contentContainerStyle={compactStyles.detailContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={busy} tintColor={colors.gold} onRefresh={() => {
            if (mode === "joined") {
              onRefresh?.();
              return;
            }
            setProofMode(true);
          }} />}
        >
          <View style={compactStyles.multiplayerDetailHero}>
            <Image source={getMultiplayerSealSource(quest)} style={compactStyles.multiplayerDetailSeal} resizeMode="contain" />
            <Text style={compactStyles.multiplayerDetailKicker}>{quest.official || quest.id.startsWith("official-") ? "SQC Official Multiplayer Side Quest" : quest.isOwner ? "Hosted by you" : "Community Multiplayer Side Quest"}</Text>
            <Text style={compactStyles.detailTitle}>{cleanMultiplayerTitle(quest.title)}</Text>
            <Text style={compactStyles.detailGoal}>{cleanMultiplayerInviteCopy(quest.inviteCopy)}</Text>
            <Text style={compactStyles.detailLatestCheck}>{quest.status.toUpperCase()}</Text>
          </View>

          <View style={compactStyles.multiplayerScoreGrid}>
            <View style={compactStyles.multiplayerScoreTile}>
              <Text style={compactStyles.multiplayerScoreLabel}>Players</Text>
              <Text style={compactStyles.multiplayerScoreValue}>{players}</Text>
            </View>
            <View style={compactStyles.multiplayerScoreTile}>
              <Text style={compactStyles.multiplayerScoreLabel}>Time left</Text>
              <Text style={compactStyles.multiplayerScoreValue}>{timeLeft}</Text>
            </View>
            <View style={compactStyles.multiplayerScoreTile}>
              <Text style={compactStyles.multiplayerScoreLabel}>Your place</Text>
              <Text style={compactStyles.multiplayerScoreValue}>{position}</Text>
            </View>
          </View>

          <View style={compactStyles.multiplayerNativeCard}>
            <Text style={compactStyles.multiplayerCardEyebrow}>{quest.isOwner ? "Invite players" : "Share"}</Text>
            <Text style={compactStyles.multiplayerCardTitle}>{quest.isOwner ? "Send this Multiplayer Side Quest from any chat app." : "Send this Multiplayer Side Quest to another player."}</Text>
            <View style={compactStyles.multiplayerFooterActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Share Multiplayer Side Quest invite" style={compactStyles.detailPrimaryButton} onPress={() => void shareInviteLink()}>
                <Text style={compactStyles.detailPrimaryButtonText}>{quest.isOwner ? "Share invite" : "Share Side Quest"}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Copy Multiplayer Side Quest invite link" style={compactStyles.detailQuietButton} onPress={() => void copyInviteLink()}>
                <Text style={compactStyles.detailQuietButtonText}>Copy invite link</Text>
              </Pressable>
              {onViewHost && !quest.official && quest.hostName ? (
                <Pressable accessibilityRole="button" accessibilityLabel="View more by this Multiplayer host" style={compactStyles.detailQuietButton} onPress={() => onViewHost(quest)}>
                  <Text style={compactStyles.detailQuietButtonText}>More by host</Text>
                </Pressable>
              ) : null}
              {onReport && !quest.official && !quest.isOwner ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Report Multiplayer Side Quest" style={compactStyles.detailQuietButton} onPress={() => onReport(quest)}>
                  <Text style={compactStyles.detailQuietButtonText}>Report Side Quest</Text>
                </Pressable>
              ) : null}
            </View>
            {quest.inviteMode === "private-key" && quest.isOwner ? <Text style={styles.microcopy}>This private invite link includes the invite code. Only share it with players you want in.</Text> : null}
            {onReport && !quest.official && !quest.isOwner ? <Text style={styles.microcopy}>Community Multiplayer reports go to SQC support with the quest ID and host context, not private player data.</Text> : null}
          </View>

          {!quest.official && quest.hostName ? (
            <View style={compactStyles.multiplayerNativeCard}>
              <Text style={compactStyles.multiplayerCardEyebrow}>Host context</Text>
              <Text style={compactStyles.multiplayerCardTitle}>Hosted by {quest.hostName}</Text>
              <Text style={styles.microcopy}>Open a local host shelf to browse other public Community Multiplayer Side Quests from this host. Private invite-only tables and account details stay hidden.</Text>
            </View>
          ) : null}

          {mode === "joined" && proofMode ? (
            <>
              <View style={compactStyles.multiplayerScoreGrid}>
                <View style={compactStyles.multiplayerScoreTile}>
                  <Text style={compactStyles.multiplayerScoreLabel}>Completed</Text>
                  <Text style={compactStyles.multiplayerScoreValue}>{verified.replace(" / ", "/")}</Text>
                </View>
                <View style={compactStyles.multiplayerScoreTile}>
                  <Text style={compactStyles.multiplayerScoreLabel}>Verified</Text>
                  <Text style={compactStyles.multiplayerScoreValue}>{verified}</Text>
                </View>
              </View>

              <View style={compactStyles.multiplayerNativeCard}>
                <Text style={compactStyles.multiplayerCardEyebrow}>Quests to complete</Text>
                <Text style={compactStyles.multiplayerCardTitle}>Finish these {questRows.length} Side Quests to win.</Text>
                <View style={compactStyles.appRows}>
                  {questRows.map((row) => (
                    <AppRow
                      key={row.title}
                      title={row.title}
                      meta={row.meta}
                      status={completedQuestTitles.has(row.title.toLowerCase()) ? "Completed" : row.status}
                      imageSource={row.imageSource}
                      glowSource={row.glowSource}
                      glowColor={row.glowColor}
                      overlaySeal={completedQuestTitles.has(row.title.toLowerCase())}
                      onPress={() => setSelectedRuleQuestTitle(row.title)}
                    />
                  ))}
                </View>
              </View>

              <View style={compactStyles.multiplayerNativeCard}>
                <Text style={compactStyles.multiplayerCardEyebrow}>Leaderboard</Text>
                <Text style={compactStyles.multiplayerCardTitle}>How you’re doing vs everyone else.</Text>
                <View style={compactStyles.appRows}>
                  {leaderboardRows.map((row) => (
                    <MultiplayerLeaderboardRow key={`${row.rank}-${row.name}`} row={row} />
                  ))}
                </View>
              </View>

              <View style={compactStyles.multiplayerNativeCard}>
                <Text style={compactStyles.multiplayerCardEyebrow}>Competition rules</Text>
                <Text style={compactStyles.multiplayerCardTitle}>Everyone plays under the same receipt.</Text>
                <View style={compactStyles.multiplayerListStack}>
                  {ruleRows.map((row) => (
                    <View key={row.label} style={compactStyles.multiplayerRuleRow}>
                      <Text style={compactStyles.multiplayerRuleLabel}>{row.label}</Text>
                      <Text style={compactStyles.multiplayerRuleValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={compactStyles.multiplayerNativeCard}>
                <Text style={compactStyles.multiplayerCardEyebrow}>Quests in this Multiplayer Side Quest</Text>
                <Text style={compactStyles.multiplayerCardTitle}>{questRows.length} Side Quests to complete.</Text>
                <View style={compactStyles.appRows}>
                  {questRows.slice(0, 4).map((row) => (
                    <AppRow
                      key={row.title}
                      title={row.title}
                      meta={row.meta}
                      status={completedQuestTitles.has(row.title.toLowerCase()) ? "Completed" : row.status}
                      imageSource={row.imageSource}
                      glowSource={row.glowSource}
                      glowColor={row.glowColor}
                      overlaySeal={completedQuestTitles.has(row.title.toLowerCase())}
                      onPress={() => setSelectedRuleQuestTitle(row.title)}
                    />
                  ))}
                </View>
              </View>

              <View style={compactStyles.multiplayerNativeCard}>
                <Text style={compactStyles.multiplayerCardEyebrow}>Leaderboard</Text>
                <Text style={compactStyles.multiplayerCardTitle}>{mode === "joined" ? "Current Multiplayer Side Quest standings." : "Who is in so far."}</Text>
                <View style={compactStyles.appRows}>
                  {leaderboardRows.map((row) => (
                    <MultiplayerLeaderboardRow key={`${row.rank}-${row.name}`} row={row} compact />
                  ))}
                </View>
              </View>

              <View style={compactStyles.multiplayerNativeCard}>
                <Text style={compactStyles.multiplayerCardEyebrow}>Rules and time</Text>
                <View style={compactStyles.multiplayerListStack}>
                  {ruleRows.slice(0, 4).map((row) => (
                    <View key={row.label} style={compactStyles.multiplayerRuleRow}>
                      <Text style={compactStyles.multiplayerRuleLabel}>{row.label}</Text>
                      <Text style={compactStyles.multiplayerRuleValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {quest.isOwner ? (
            <View style={compactStyles.multiplayerNativeCard}>
              <Text style={compactStyles.multiplayerCardEyebrow}>Owner settings</Text>
              <Text style={compactStyles.multiplayerCardTitle}>Simple Multiplayer controls.</Text>
              <View style={compactStyles.multiplayerRuleRow}>
                <Text style={compactStyles.multiplayerRuleLabel}>Current window</Text>
                <Text style={compactStyles.multiplayerRuleValue}>{formatGroupQuestDate(quest.startAt)} → {formatGroupQuestDate(quest.endAt)}</Text>
              </View>
              {adminInviteMode === "private-key" ? (
                <View style={compactStyles.multiplayerRuleRow}>
                  <Text style={compactStyles.multiplayerRuleLabel}>Invite code</Text>
                  <View style={compactStyles.multiplayerInlineAction}>
                    <Text selectable style={compactStyles.multiplayerRuleValue}>{quest.inviteKey ?? "Key pending"}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Copy private invite code" style={compactStyles.detailQuietButton} onPress={copyInviteKey}>
                      <Text style={compactStyles.detailQuietButtonText}>Copy</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <Text style={styles.inputLabel}>Quest name</Text>
              <TextInput value={adminName} placeholder="Name this Multiplayer Side Quest" placeholderTextColor="rgba(255,247,232,.42)" style={styles.textInput} onChangeText={setAdminName} />
              <Text style={styles.inputLabel}>Intro text</Text>
              <TextInput value={adminInviteCopy} multiline placeholder="Explain what players are joining..." placeholderTextColor="rgba(255,247,232,.42)" style={[styles.textInput, styles.textAreaInput]} onChangeText={setAdminInviteCopy} />
              <Text style={styles.microcopy}>Shown to players before they join.</Text>
              <Text style={styles.inputLabel}>Visibility</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {(["public", "private-key"] as const).map((modeOption) => {
                  const selected = adminInviteMode === modeOption;
                  const copy = getInviteModeOptionCopy(modeOption);
                  return (
                    <Pressable key={modeOption} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setAdminInviteMode(modeOption)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{copy.title}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{copy.helper}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.inputLabel}>Games allowed</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {MULTIPLAYER_PROVIDER_MODES.map((modeOption) => {
                  const selected = adminProviderMode === modeOption.id;
                  const title = modeOption.id === "both" ? "Both" : modeOption.id === "lichess" ? "Lichess" : "Chess.com";
                  const helper = modeOption.id === "both" ? "Players can use either site" : modeOption.id === "lichess" ? "Only public Lichess games" : "Only public Chess.com games";
                  return (
                    <Pressable key={modeOption.id} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setAdminProviderMode(modeOption.id)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{title}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{helper}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <GroupQuestDateTimeControl label="Start" value={adminStartAt} onChange={setAdminStartAt} />
              <GroupQuestDateTimeControl label="End" value={adminEndAt} onChange={setAdminEndAt} />
              <Text style={styles.inputLabel}>Quick duration</Text>
              <GroupQuestDurationChips startAt={adminStartAt} onChangeEndAt={setAdminEndAt} />
              <Text style={styles.microcopy}>Dates save as your local time. No typing needed.</Text>
              <Text style={styles.inputLabel}>Included Side Quests</Text>
              <View style={compactStyles.appRows}>
                {adminQuestChoices.map((choice) => (
                  <AppRow
                    key={choice.id}
                    title={choice.title}
                    meta={choice.meta}
                    status={adminQuestIds.includes(choice.id) ? "Included" : choice.status}
                    imageSource={choice.imageSource}
                    onPress={() => toggleAdminQuestId(choice.id)}
                  />
                ))}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Save Multiplayer Side Quest settings" style={[compactStyles.detailPrimaryButton, busy ? compactStyles.disabledAction : null]} disabled={busy} onPress={saveAdminSettings}>
                <Text style={compactStyles.detailPrimaryButtonText}>{busy ? "Saving..." : "Save settings"}</Text>
              </Pressable>
              <View style={compactStyles.multiplayerListStack}>
                <Text style={compactStyles.multiplayerRuleLabel}>Players</Text>
                {leaderboardRows.map((row) => (
                  <View key={`${row.rank}-${row.name}-admin`} style={compactStyles.multiplayerRuleRow}>
                    <Text style={compactStyles.multiplayerRuleValue}>{row.rank} · {row.name} · {row.verified}</Text>
                    {row.removable ? (
                      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${row.name}`} style={compactStyles.detailQuietButton} disabled={busy} onPress={() => removeParticipant(row)}>
                        <Text style={compactStyles.detailQuietButtonText}>Remove player</Text>
                      </Pressable>
                    ) : <Text style={styles.microcopy}>Owner / you</Text>}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={compactStyles.multiplayerFooterActions}>
            {message ? <Text style={compactStyles.inlineSuccess}>{message}</Text> : null}
            {error ? <Text style={compactStyles.inlineError}>{error}</Text> : null}
            {mode === "joined" ? (
              <>
                <View style={compactStyles.pullRefreshHintInline}>
                  <MaterialCommunityIcons name="arrow-down" size={14} color="rgba(199,189,169,.72)" />
                  <Text style={compactStyles.pullRefreshHintText}>Pull down to refresh</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Leave Multiplayer Side Quest" style={[compactStyles.detailQuietButton, busy ? compactStyles.disabledAction : null]} disabled={busy} onPress={() => onLeave?.()}>
                  <Text style={compactStyles.detailQuietButtonText}>Leave Side Quest</Text>
                </Pressable>
              </>
            ) : joinClosed ? (
              <View style={compactStyles.detailQuietButton} accessibilityLabel="Multiplayer Side Quest ended">
                <Text style={compactStyles.detailQuietButtonText}>Ended — no longer open to join</Text>
              </View>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Join Multiplayer Side Quest" style={[compactStyles.detailPrimaryButton, busy ? compactStyles.disabledAction : null]} disabled={busy} onPress={() => onJoin?.()}>
                <Text style={compactStyles.detailPrimaryButtonText}>{busy ? "Joining..." : "Join Side Quest"}</Text>
              </Pressable>
            )}
          </View>
        </ScrollHintedScrollView>
        <Modal visible={Boolean(selectedRuleQuest)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setSelectedRuleQuestTitle(null)}>
          <SafeAreaView style={compactStyles.detailScreen}>
            <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
            <View style={compactStyles.detailTopBar}>
              <Pressable accessibilityRole="button" accessibilityLabel="Close multiplayer quest rules" style={compactStyles.detailCloseButton} onPress={() => setSelectedRuleQuestTitle(null)}>
                <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
              </Pressable>
            </View>
            <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
              {selectedRuleQuest ? (
                <View style={compactStyles.completedProofScreen}>
                  <View style={compactStyles.multiplayerDetailHero}>
                    <Image source={selectedRuleQuest.imageSource} style={compactStyles.multiplayerRuleQuestCoat} resizeMode="contain" />
                    <Text style={compactStyles.multiplayerDetailKicker}>Multiplayer Side Quest rules</Text>
                    <Text style={compactStyles.detailTitle}>{selectedRuleQuest.title}</Text>
                    <Text style={compactStyles.detailGoal}>{selectedRuleQuest.meta}</Text>
                    <Text style={compactStyles.detailLatestCheck}>{selectedRuleQuest.status.toUpperCase()}</Text>
                  </View>

                  <View style={compactStyles.multiplayerNativeCard}>
                    <Text style={compactStyles.multiplayerCardEyebrow}>What counts</Text>
                    <Text style={compactStyles.multiplayerCardTitle}>Complete this within the Multiplayer Side Quest window.</Text>
                    <View style={compactStyles.multiplayerListStack}>
                      {selectedRuleQuest.ruleLines.map((line) => (
                        <View key={line} style={compactStyles.multiplayerRuleRow}>
                          <Text style={compactStyles.multiplayerRuleValue}>{line}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={compactStyles.multiplayerNativeCard}>
                    <Text style={compactStyles.multiplayerCardEyebrow}>Multiplayer proof</Text>
                    <View style={compactStyles.multiplayerListStack}>
                      <View style={compactStyles.multiplayerRuleRow}>
                        <Text style={compactStyles.multiplayerRuleLabel}>Proof</Text>
                        <Text style={compactStyles.multiplayerRuleValue}>Use a public game that starts after you joined this Multiplayer Side Quest.</Text>
                      </View>
                      <View style={compactStyles.multiplayerRuleRow}>
                        <Text style={compactStyles.multiplayerRuleLabel}>Solo progress</Text>
                        <Text style={compactStyles.multiplayerRuleValue}>Solo completions only count here if they were completed during this Multiplayer Side Quest.</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollHintedScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

function MultiplayerLeaderboardRow({
  row,
  compact = false,
}: {
  row: {
    rank: string;
    name: string;
    provider: string;
    points: string;
    verified: string;
    note: string;
  };
  compact?: boolean;
}) {
  return (
    <View style={[compactStyles.appRow, compactStyles.multiplayerLeaderboardAppRow]}>
      <View style={compactStyles.multiplayerRankBadge}>
        <Text style={compactStyles.multiplayerRankBadgeText}>{row.rank}</Text>
      </View>
      <View style={compactStyles.appRowText}>
        <View style={compactStyles.multiplayerLeaderboardTopLine}>
          <Text style={compactStyles.appRowTitle} numberOfLines={1}>{row.name}</Text>
          <Text style={compactStyles.multiplayerLeaderboardPoints}>{row.verified.replace(" verified", "")}</Text>
        </View>
        {!compact ? <Text style={compactStyles.appRowMeta} numberOfLines={1}>{row.provider}</Text> : null}
        <View style={compactStyles.multiplayerProgressTrack}>
          <View style={[compactStyles.multiplayerProgressFill, { width: `${getLeaderboardProgressPercent(row.verified)}%` }]} />
        </View>
        <Text style={compactStyles.appRowMeta} numberOfLines={1}>{row.verified} · {row.note}</Text>
      </View>
    </View>
  );
}

function CurrentSideQuestDetailModal({
  visible,
  signedIn,
  challenge,
  activeCoatSource,
  activeQuestGoal,
  pickedLabel,
  proofNeeded,
  latestCheckLabel,
  latestCheckPassed,
  latestReceipt,
  canViewCurrentProof,
  actionState,
  onClose,
  onRunCheck,
  onViewProof,
  onSwitchQuest,
}: {
  visible: boolean;
  signedIn: MobileAccountState;
  challenge: MobileChallenge | null;
  activeCoatSource: ImageSourcePropType;
  activeQuestGoal: string;
  pickedLabel: string;
  proofNeeded: string;
  latestCheckLabel: string;
  latestCheckPassed: boolean;
  latestReceipt: MobileAccountState["latestReceipt"];
  canViewCurrentProof: boolean;
  actionState: { busy: boolean; message: string | null; error: string | null };
  onClose: () => void;
  onRunCheck: () => Promise<void>;
  onViewProof: () => void;
  onSwitchQuest: () => void;
}) {
  const [coatExpanded, setCoatExpanded] = useState(false);
  const activeQuest = signedIn.activeQuest;
  if (!activeQuest) return null;

  const completed = activeQuest.completed || latestCheckPassed;
  const latestCheckFailed = isFailedReceipt(latestReceipt);
  const accountLabel = signedIn.chessAccounts.lichessUsername
    ? `lichess · ${signedIn.chessAccounts.lichessUsername}`
    : signedIn.chessAccounts.chessComUsername
      ? `chess.com · ${signedIn.chessAccounts.chessComUsername}`
      : "No chess account connected";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={compactStyles.detailScreen}>
        <GradientBackdrop challenge={challenge} />
        <View style={compactStyles.detailTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close Current Active Side Quest" style={compactStyles.detailCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
          </Pressable>
        </View>
        <ScrollHintedScrollView
          contentContainerStyle={compactStyles.detailContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={actionState.busy} tintColor={colors.gold} onRefresh={() => void onRunCheck()} />}
        >
          <View style={compactStyles.detailHero}>
            <Pressable accessibilityRole="imagebutton" accessibilityLabel="Enlarge Coat of Arms" style={compactStyles.detailCoatFrame} onPress={() => setCoatExpanded(true)}>
              {challenge ? <Image source={getChallengeCoatGlowSource(challenge.id)} style={[compactStyles.detailCoatGlowImage, { tintColor: getSafeBadgeColors(challenge).glow }]} resizeMode="contain" /> : null}
              <Image source={activeCoatSource} style={compactStyles.detailCoatImage} resizeMode="contain" />
            </Pressable>
            <Text style={compactStyles.detailTitle}>{activeQuest.title}</Text>
            <Text style={compactStyles.detailGoal}>{activeQuestGoal}</Text>
          </View>

          <View style={compactStyles.detailPanelStrong}>
            <Text style={compactStyles.detailPanelTitle}>How proof works</Text>
            <View style={compactStyles.proofStepList}>
              <ProofStep number="1" text="Pick a Side Quest." />
              <ProofStep number="2" text="Play a new public Lichess or Chess.com game." />
              <ProofStep number="3" text="Return here and check your latest game." />
            </View>
          </View>

          <View style={compactStyles.detailPanel}>
            <DetailRow label="Picked" value={pickedLabel} />
            <DetailRow label="What to do" value={proofNeeded} />
            <DetailRow label="Latest check" value={latestCheckLabel} tone={latestCheckPassed ? "good" : "default"} />
          </View>

          {latestCheckFailed ? <FailureDiagnosticBoard receipt={latestReceipt} /> : null}
          {!completed && isPendingReceipt(latestReceipt) ? <ActiveQuestNoGameSummary /> : null}
          {completed ? <VictoryProofBoard proof={latestReceipt} /> : null}

          {canViewCurrentProof ? (
            <View style={compactStyles.detailPanelStrong}>
              <View style={compactStyles.proofReadyHeaderRow}>
                <View style={compactStyles.proofReadySealFrame}>
                  <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.proofReadySealImage} resizeMode="contain" />
                </View>
                <View style={compactStyles.proofReadyCopyBlock}>
                  <Text style={compactStyles.detailPanelTitle}>Proof ready</Text>
                  <Text style={compactStyles.detailPanelCopy}>Your latest eligible game completed this Side Quest.</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" style={compactStyles.detailPrimaryButton} onPress={onViewProof}>
                <Text style={compactStyles.detailPrimaryButtonText}>View victory proof</Text>
              </Pressable>
            </View>
          ) : (
            <View style={compactStyles.detailActionStack}>
              <Pressable accessibilityRole="button" accessibilityLabel="Check my latest game" style={[compactStyles.detailPrimaryButton, actionState.busy && compactStyles.detailPrimaryButtonDisabled]} disabled={actionState.busy} onPress={() => void onRunCheck()}>
                <Text style={compactStyles.detailPrimaryButtonText}>{actionState.busy ? "Checking…" : "Check my latest game"}</Text>
              </Pressable>
              <View style={compactStyles.detailInlineRefresh}>
                <MaterialCommunityIcons name="arrow-down" size={13} color="rgba(199,189,169,.72)" />
                <Text style={compactStyles.detailInlineRefreshText}>Pull down to refresh</Text>
              </View>
            </View>
          )}
          {actionState.message ? <Text style={latestCheckFailed ? compactStyles.inlineError : compactStyles.inlineSuccess}>{actionState.message}</Text> : null}
          {actionState.error ? <Text style={compactStyles.inlineError}>{actionState.error}</Text> : null}

          <Pressable accessibilityRole="button" style={compactStyles.detailQuietButton} onPress={onSwitchQuest}>
            <Text style={compactStyles.detailQuietButtonText}>Switch Side Quest</Text>
          </Pressable>

        </ScrollHintedScrollView>
        <Modal visible={coatExpanded} transparent animationType="fade" onRequestClose={() => setCoatExpanded(false)}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close enlarged Coat of Arms" style={compactStyles.coatLightbox} onPress={() => setCoatExpanded(false)}>
            <View style={compactStyles.coatLightboxCard}>
              {challenge ? <Image source={getChallengeCoatGlowSource(challenge.id)} style={[compactStyles.coatLightboxGlow, { tintColor: getSafeBadgeColors(challenge).glow }]} resizeMode="contain" /> : null}
              <Image source={activeCoatSource} style={compactStyles.coatLightboxImage} resizeMode="contain" />
              <Text style={compactStyles.coatLightboxTitle}>{getSafeBadgeIdentity(challenge).name}</Text>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

function DetailRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" }) {
  return (
    <View style={compactStyles.detailRow}>
      <Text style={compactStyles.detailRowLabel}>{label}</Text>
      <Text style={[compactStyles.detailRowValue, tone === "good" && compactStyles.detailRowValueGood]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function ProofStep({ number, text }: { number: string; text: string }) {
  return (
    <View style={compactStyles.proofStepRow}>
      <Text style={compactStyles.proofStepBadge}>{number}</Text>
      <Text style={compactStyles.proofStepText}>{text}</Text>
    </View>
  );
}


function CompletionCelebrationOverlay({
  unlock,
  challenge,
  onClose,
}: {
  unlock: CompletionCelebrationUnlock | null;
  challenge: MobileChallenge | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!unlock) return;
    Vibration.vibrate([0, 35, 170, 95]);
  }, [unlock]);

  if (!unlock) return null;

  const coatSource = challenge ? getChallengeCoatImageSource(challenge) : { uri: absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") };
  const glowSource = challenge ? getChallengeCoatGlowSource(challenge.id) : null;
  const headline = unlock.mode === "multiplayer" ? "Quest completed in Multiplayer" : "Quest completed";
  const subline = unlock.mode === "multiplayer" ? "Solo completion recorded too." : "Coat of Arms unlocked.";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={compactStyles.celebrationBackdrop}>
        <View style={[compactStyles.celebrationGlow, { backgroundColor: colorWithAlpha(unlock.accentColor, 0.18) }]} />
        <View style={compactStyles.celebrationCard} accessibilityLabel={`${headline}. ${unlock.challengeTitle}. ${subline}`}>
          <Text style={compactStyles.celebrationKicker}>{unlock.mode === "multiplayer" ? "Multiplayer proof accepted" : "Proof accepted"}</Text>
          <Text style={compactStyles.celebrationHeadline}>{headline}</Text>
          <Text style={compactStyles.celebrationSubline}>{subline}</Text>

          <View style={compactStyles.celebrationCoatFrame}>
            {glowSource ? <Image source={glowSource} style={[compactStyles.celebrationCoatGlow, { tintColor: getSafeBadgeColors(challenge).glow ?? unlock.accentColor }]} resizeMode="contain" /> : null}
            <CelebrationParticles accentColor={unlock.accentColor} family={unlock.family} />
            <Image source={coatSource} style={compactStyles.celebrationCoat} resizeMode="contain" />
            <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.celebrationSeal} resizeMode="contain" />
          </View>

          <Text style={compactStyles.celebrationTitle}>{unlock.challengeTitle}</Text>
          <Text style={compactStyles.celebrationBadge}>Coat of Arms: {unlock.badgeName}</Text>
          <Text style={compactStyles.celebrationFlavor}>{unlock.flavorLine}</Text>
          {unlock.extraCompletedCount ? <Text style={compactStyles.celebrationMeta}>+{unlock.extraCompletedCount} more Side Quest{unlock.extraCompletedCount === 1 ? "" : "s"} completed in this refresh.</Text> : null}


          <Pressable accessibilityRole="button" accessibilityLabel="Close celebration" style={compactStyles.celebrationCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={21} color={colors.paper} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function CelebrationParticles({ accentColor, family }: { accentColor: string; family: CompletionCelebrationFamily }) {
  const particles = family === "dark" ? ["◆", "✦", "◆", "✧", "◆", "✦"] : family === "absurd" ? ["✹", "✦", "✺", "✧", "✹", "✦"] : ["✦", "✧", "✦", "✧", "✦", "✧"];
  return (
    <View pointerEvents="none" style={compactStyles.celebrationParticles}>
      {particles.map((particle, index) => (
        <Text key={`${particle}-${index}`} style={[compactStyles.celebrationParticle, celebrationParticlePositions[index] ?? celebrationParticlePositions[0], { color: colorWithAlpha(accentColor, index % 2 ? 0.72 : 0.95) }]}>{particle}</Text>
      ))}
    </View>
  );
}

function getCompletedQuestIdSet(account: MobileAccountState) {
  return new Set(account.completedQuests.map((quest) => quest.id));
}

function getCelebrationFamily(challenge: MobileChallenge | null): CompletionCelebrationFamily {
  const text = `${challenge?.id ?? ""} ${challenge?.category ?? ""} ${challenge?.difficulty ?? ""} ${challenge?.flavor ?? ""}`.toLowerCase();
  if (text.includes("absurd") || text.includes("blunder") || text.includes("goblin") || text.includes("picnic")) return "absurd";
  if (text.includes("brutal") || text.includes("king walk") || text.includes("dark")) return "dark";
  if (text.includes("precision") || text.includes("bishop") || text.includes("queen")) return "surgical";
  if (text.includes("mythic") || text.includes("legend")) return "mythic";
  return "triumphant";
}

function getCelebrationFlavorLine(challenge: MobileChallenge | null) {
  if (!challenge) return "The heralds have recorded this one.";
  if (getSafeBadgeIdentity(challenge).unlockCopy) return getSafeBadgeIdentity(challenge).unlockCopy;
  return challenge.flavor || challenge.proofCallout || "The heralds have recorded this one.";
}

const celebrationParticlePositions = [
   { top: 10, left: 22, transform: [{ rotate: "-18deg" }] },
  { top: 24, right: 28, transform: [{ rotate: "16deg" }] },
  { bottom: 32, left: 18, transform: [{ rotate: "12deg" }] },
  { bottom: 18, right: 24, transform: [{ rotate: "-14deg" }] },
  { top: 76, left: 2, transform: [{ rotate: "24deg" }] },
  { top: 82, right: 4, transform: [{ rotate: "-24deg" }] },
] as const;

function waitMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ENGLISH_DATE_LOCALE = "en-US";

function formatRelativeDateTime(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const today = new Date();
  const dateKey = date.toDateString();
  const todayKey = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const prefix = dateKey === todayKey ? "Today" : dateKey === yesterday.toDateString() ? "Yesterday" : date.toLocaleDateString(ENGLISH_DATE_LOCALE, { month: "short", day: "numeric" });
  return `${prefix} · ${date.toLocaleTimeString(ENGLISH_DATE_LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

function formatLatestCheckTime(value: string | null | undefined): string {
  return formatRelativeDateTime(value, "not yet");
}

function formatAccountDate(value: string | null | undefined): string {
  if (!value) return "not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "not available";
  return date.toLocaleString(ENGLISH_DATE_LOCALE, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatQuestPickedDate(value: string | null | undefined): string {
  return formatRelativeDateTime(value, "not recorded");
}

function normalizeCheckHeadline(headline: string): string {
  return headline
    .replace(/^latest\s+/i, "")
    .replace(/^proof\s+/i, "")
    .trim()
    .toLowerCase();
}

function AccountIdentityLine({ name, lichessUsername, chessComUsername }: { name: string; lichessUsername: string | null; chessComUsername: string | null }) {
  return (
    <View style={compactStyles.identityLine} accessibilityLabel={`Signed in as ${name}`}>
      <Text style={compactStyles.identityName} numberOfLines={1}>{name}</Text>
      <View style={compactStyles.identityAccountsLine}>
        {lichessUsername ? (
          <View style={compactStyles.identityAccount}>
            <Text style={[compactStyles.identityPlatform, compactStyles.identityPlatformLichess]}>lichess</Text>
            <Text style={compactStyles.identityUsername} numberOfLines={1}>{lichessUsername}</Text>
          </View>
        ) : null}
        {chessComUsername ? (
          <View style={compactStyles.identityAccount}>
            <Text style={[compactStyles.identityPlatform, compactStyles.identityPlatformChessCom]}>chess.com</Text>
            <Text style={compactStyles.identityUsername} numberOfLines={1}>{chessComUsername}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ReadinessChip({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={[compactStyles.readinessChip, !value && compactStyles.readinessChipMissing]}>
      <Text style={compactStyles.readinessLabel}>{label}</Text>
      <Text style={compactStyles.readinessValue} numberOfLines={1}>{value ?? "Add"}</Text>
    </View>
  );
}

function AppSection({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  return (
    <View style={compactStyles.appSection}>
      <View style={compactStyles.panelHeaderRow}>
        <Text style={compactStyles.freshSectionTitle}>{title}</Text>
        {action && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction}>
            <Text style={compactStyles.sectionAction}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={compactStyles.appRows}>{children}</View>
    </View>
  );
}

function HomeFeatureCard({
  imageSource,
  glowSource,
  glowColor,
  variant = "coat",
  eyebrow,
  title,
  copy,
  primaryMeta,
  secondaryMeta,
  onPress,
}: {
  imageSource: ImageSourcePropType | null;
  glowSource?: ImageSourcePropType | null;
  glowColor?: string;
  variant?: "coat" | "seal";
  eyebrow: string;
  title: string;
  copy: string;
  primaryMeta: string;
  secondaryMeta: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.homeFeatureCard} onPress={onPress}>
      {imageSource ? (
        <View style={compactStyles.homeFeatureImageFrame}>
          {glowSource ? <Image source={glowSource} style={[compactStyles.homeFeatureGlowImage, { tintColor: glowColor ?? colors.gold }]} resizeMode="contain" /> : null}
          <Image source={imageSource} style={variant === "seal" ? compactStyles.homeFeatureSealImage : compactStyles.homeFeatureCoatImage} resizeMode="contain" />
        </View>
      ) : null}
      <View style={compactStyles.homeFeatureCopy}>
        <Text style={compactStyles.homeFeatureEyebrow}>{eyebrow}</Text>
        <Text style={compactStyles.homeFeatureTitle}>{title}</Text>
        <Text style={compactStyles.homeFeatureBody}>{copy}</Text>
        <View style={compactStyles.homeFeatureMetaRow}>
          <Text style={compactStyles.homeFeatureMeta}>{primaryMeta}</Text>
          <Text style={compactStyles.homeFeatureMeta}>{secondaryMeta}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,247,232,.52)" />
    </Pressable>
  );
}

function AccountHelpSupportSection({ onOpenHelp }: { onOpenHelp: () => void }) {
  return (
    <AppSection title="Help & Support" action="Open" onAction={onOpenHelp}>
      <AppRow title="How SQC works" meta="Side Quests, proof checks, Coat of Arms, and Multiplayer help." imageSource={SQC_COAT_OF_ARMS_ASSET} onPress={onOpenHelp} />
      <AppRow title="Report a problem" meta="Tell us what happened and we’ll take a look." imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={onOpenHelp} />
    </AppSection>
  );
}

function HelpSupportModal({ visible, onClose, signedIn, authBridge, initialMessage = "" }: { visible: boolean; onClose: () => void; signedIn: MobileAccountState | null; authBridge: MobileAuthBridge; initialMessage?: string }) {
  const [supportMessage, setSupportMessage] = useState(initialMessage);
  const [localSupportMessages, setLocalSupportMessages] = useState<MobileSupportMessage[]>([]);
  const [submitState, setSubmitState] = useState<{ busy: boolean; message: string | null; error: string | null }>({ busy: false, message: null, error: null });
  const supportThread = [...(signedIn?.supportMessages ?? []), ...localSupportMessages]
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  async function copySupportDetails() {
    const details = [
      "Side Quest Chess support",
      `Account: ${signedIn?.profile.email ?? signedIn?.profile.displayName ?? "not signed in"}`,
      `Lichess: ${signedIn?.chessAccounts.lichessUsername ?? "not connected"}`,
      `Chess.com: ${signedIn?.chessAccounts.chessComUsername ?? "not connected"}`,
      `Active quest: ${signedIn?.activeQuest?.title ?? "none"}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");
    await Clipboard.setStringAsync(details);
    Alert.alert("Support details copied", "Paste this into the support form and add what went wrong.");
  }

  async function submitSupport() {
    if (!authBridge.isSignedIn || !authBridge.getSessionToken) {
      setSubmitState({ busy: false, message: null, error: "Sign in first so the support note can attach to your account." });
      return;
    }

    const trimmed = supportMessage.trim();
    if (trimmed.length < 3) {
      setSubmitState({ busy: false, message: null, error: "Write a little more so the note is useful." });
      return;
    }

    setSubmitState({ busy: true, message: null, error: null });

    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await submitMobileSupportMessage({ sessionToken, message: trimmed });
      if (result.supportMessage) {
        setLocalSupportMessages((current) => [...current, result.supportMessage as MobileSupportMessage]);
      }
      setSupportMessage("");
      setSubmitState({ busy: false, message: result.message, error: null });
    } catch (caught) {
      setSubmitState({ busy: false, message: null, error: caught instanceof Error ? caught.message : "Could not send the support note." });
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={compactStyles.detailScreen}>
        <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
        <View style={compactStyles.detailTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close Help and Support" style={compactStyles.detailCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
          </Pressable>
        </View>
        <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={compactStyles.multiplayerDetailHero}>
            <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.multiplayerRuleQuestCoat} resizeMode="contain" />
            <Text style={compactStyles.multiplayerDetailKicker}>Help & Support</Text>
            <Text style={compactStyles.detailTitle}>How we can help</Text>
            <Text style={compactStyles.detailGoal}>Quick answers for Side Quests, proof, connected accounts, and Multiplayer.</Text>
          </View>

          <View style={compactStyles.detailPanelStrong}>
            <Text style={compactStyles.detailPanelTitle}>Quick answers</Text>
            <Text style={compactStyles.detailPanelCopy}>SQC checks public chess games after you pick or join a Side Quest. If something looks wrong, refresh proof after the game has fully finished.</Text>
          </View>

          <View style={compactStyles.appRows}>
            <HelpSupportRow title="How Side Quests work" body={HELP_TOPICS.solo.body} />
            <HelpSupportRow title="Why proof may not verify" body={HELP_TOPICS.proof.body} />
            <HelpSupportRow title="Connecting chess accounts" body={HELP_TOPICS.accounts.body} />
            <HelpSupportRow title="Multiplayer Side Quests" body={HELP_TOPICS.multiplayer.body} />
            <HelpSupportRow title="Coat of Arms" body={HELP_TOPICS.coat.body} />
          </View>

          <View style={compactStyles.multiplayerNativeCard}>
            <Text style={compactStyles.multiplayerCardEyebrow}>Report a problem</Text>
            <Text style={compactStyles.detailPanelCopy}>Something not working. Send a short note here and we can reply in this conversation if we need more details.</Text>
            <View style={compactStyles.helpSupportThread}>
              <Text style={compactStyles.appRowTitle}>Conversation</Text>
              {supportThread.length ? supportThread.map((entry) => (
                <View key={entry.id} style={[compactStyles.helpSupportMessageBubble, entry.source === "admin" ? compactStyles.helpSupportAdminBubble : null]}>
                  <Text style={compactStyles.helpSupportMessageMeta}>{entry.source === "admin" ? "SQC support" : "You"} · {formatAccountDate(entry.at)}</Text>
                  <Text style={compactStyles.helpSupportBody}>{entry.message}</Text>
                </View>
              )) : (
                <Text style={compactStyles.helpSupportBody}>Your messages and replies from SQC support will appear here.</Text>
              )}
            </View>
            <View style={styles.inputStack}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                value={supportMessage}
                multiline
                maxLength={1200}
                placeholder="What happened"
                placeholderTextColor="rgba(255,247,232,.42)"
                style={[styles.textInput, styles.textAreaInput]}
                onChangeText={setSupportMessage}
              />
            </View>
            {submitState.message ? <Text style={compactStyles.inlineSuccess}>{submitState.message}</Text> : null}
            {submitState.error ? <Text style={compactStyles.inlineError}>{submitState.error}</Text> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Send support message" style={[compactStyles.detailPrimaryButton, submitState.busy ? compactStyles.disabledAction : null]} disabled={submitState.busy} onPress={() => void submitSupport()}>
              <Text style={compactStyles.detailPrimaryButtonText}>{submitState.busy ? "Sending..." : "Send support message"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Copy support details" style={compactStyles.detailPrimaryButton} onPress={() => void copySupportDetails()}>
              <Text style={compactStyles.detailPrimaryButtonText}>Copy support details</Text>
            </Pressable>
          </View>
        </ScrollHintedScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function HelpSupportRow({ title, body }: { title: string; body: string }) {
  return (
    <View style={compactStyles.helpSupportRow}>
      <Text style={compactStyles.appRowTitle}>{title}</Text>
      <Text style={compactStyles.helpSupportBody}>{body}</Text>
    </View>
  );
}

function AppRow({
  title,
  meta,
  status,
  statusImageSource,
  sourceBadge,
  imageSource,
  glowSource,
  glowColor,
  variant = "coat",
  blurImage = false,
  dimImage = false,
  overlaySeal = false,
  onPress,
}: {
  title: string;
  meta: string;
  status?: string;
  statusImageSource?: ImageSourcePropType | null;
  sourceBadge?: string | null;
  imageSource?: ImageSourcePropType | null;
  glowSource?: ImageSourcePropType | null;
  glowColor?: string;
  variant?: "coat" | "seal";
  blurImage?: boolean;
  dimImage?: boolean;
  overlaySeal?: boolean;
  onPress: () => void;
}) {
  const visibleStatus = status && !["Open", "Proof", "-"].includes(status) ? status : null;
  const statusTone = visibleStatus ? getBrowseStatusTone(visibleStatus) : null;
  return (
    <Pressable accessibilityRole="button" style={compactStyles.appRow} onPress={onPress}>
      {imageSource ? (
        <View style={compactStyles.rowCoatFrame}>
          {glowSource ? <Image source={glowSource} style={[compactStyles.rowCoatGlowImage, { tintColor: glowColor ?? colors.gold }]} resizeMode="contain" /> : null}
          {overlaySeal ? <View style={compactStyles.rowCompletedSealBackdrop} /> : null}
          <Image
            source={imageSource}
            style={[
              variant === "seal" ? compactStyles.rowSealImage : compactStyles.rowCoatImage,
              dimImage && compactStyles.rowCoatImageDim,
            ]}
            resizeMode="contain"
            blurRadius={blurImage ? 5 : 0}
          />
          {overlaySeal ? <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.rowCompletedSeal} resizeMode="contain" /> : null}
        </View>
      ) : null}
      <View style={compactStyles.appRowText}>
        {sourceBadge ? <Text style={compactStyles.sourceBadge} numberOfLines={1}>{sourceBadge}</Text> : null}
        <Text style={compactStyles.appRowTitle} numberOfLines={1}>{title}</Text>
        <Text style={compactStyles.appRowMeta} numberOfLines={2}>{meta}</Text>
      </View>
      {statusImageSource ? <Image source={statusImageSource} style={compactStyles.rowStatusSealImage} resizeMode="contain" /> : visibleStatus ? <Text style={[
        compactStyles.appRowStatus,
        visibleStatus.toLowerCase() === "joined" && compactStyles.appRowStatusJoined,
        statusTone === "green" && compactStyles.appRowStatusGreen,
        statusTone === "gold" && compactStyles.appRowStatusGold,
        statusTone === "orange" && compactStyles.appRowStatusOrange,
        statusTone === "danger" && compactStyles.appRowStatusDanger,
        statusTone === "absurd" && compactStyles.appRowStatusAbsurd,
      ]} numberOfLines={1}>{visibleStatus}</Text> : null}
    </Pressable>
  );
}

function getMultiplayerTrophySealSource(placement: "Gold" | "Silver" | "Bronze"): ImageSourcePropType {
  if (placement === "Gold") return SQC_GOLD_SEAL_ASSET;
  if (placement === "Silver") return SQC_SILVER_SEAL_ASSET;
  return SQC_BRONZE_SEAL_ASSET;
}

function getMultiplayerQuestCoatSource(title: string): ImageSourcePropType {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("queen")) return CHALLENGE_COAT_IMAGE_ASSETS["queen-never-heard-of-her"];
  if (lowerTitle.includes("knightmare")) return CHALLENGE_COAT_IMAGE_ASSETS["knightmare-mode"];
  if (lowerTitle.includes("rook")) return require("./assets/badges/v7/coming-soon-clean/rook-lift-internship-badge.png");
  if (lowerTitle.includes("bishop")) return CHALLENGE_COAT_IMAGE_ASSETS["bishop-field-trip"];
  return SQC_COAT_OF_ARMS_ASSET;
}

function getMultiplayerQuestBrowseRow(
  input: { questId?: string | null; title: string },
  challenges: MobileChallenge[],
  customQuestSummaries: MobileGroupQuestSummary["customQuestSummaries"] = [],
) {
  const lowerTitle = input.title.toLowerCase();
  const challenge = (input.questId ? challenges.find((item) => item.id === input.questId) : null)
    ?? challenges.find((item) => item.title.toLowerCase() === lowerTitle);

  if (challenge) {
    return {
      title: challenge.title,
      meta: challenge.objective,
      status: challenge.difficulty,
      imageSource: getChallengeCoatImageSource(challenge),
      glowSource: getChallengeCoatGlowSource(challenge.id),
      glowColor: getSafeBadgeColors(challenge).glow,
      ruleLines: challenge.rules.length ? challenge.rules : [challenge.instruction, challenge.proofCallout],
    };
  }

  const customSummary = (input.questId ? customQuestSummaries?.find((summary) => summary.id === input.questId) : null)
    ?? customQuestSummaries?.find((summary) => summary.title.toLowerCase() === lowerTitle);

  if (customSummary) {
    return {
      title: customSummary.title,
      meta: cleanCustomRuleSummaryText(customSummary.summary),
      status: "Included",
      imageSource: getCustomQuestImageSource(customSummary.badgeImageUrl),
      glowSource: null,
      glowColor: colors.gold,
      ruleLines: [
        cleanCustomRuleSummaryText(customSummary.summary),
        "Complete it during the Multiplayer Side Quest time window.",
        "Use a fresh public Lichess or Chess.com game that satisfies the multiplayer rules.",
      ],
    };
  }

  return {
    title: input.title,
    meta: "This Multiplayer Side Quest includes a Side Quest that the app could not fully map yet.",
    status: "Included",
    imageSource: getMultiplayerQuestCoatSource(input.title),
    glowSource: null,
    glowColor: colors.gold,
    ruleLines: [
      "This Multiplayer Side Quest includes this exact Side Quest title.",
      "Complete it during the Multiplayer Side Quest time window.",
      "Use a fresh public Lichess or Chess.com game that satisfies the multiplayer rules.",
    ],
  };
}

function getMultiplayerQuestChoices(challenges: MobileChallenge[], customQuests: MobileCustomSideQuest[], existingSummaries: MobileGroupQuestSummary["customQuestSummaries"] = []) {
  const customById = new Map(customQuests.filter(isCustomQuestPublished).map((quest) => [quest.id, quest]));
  for (const summary of existingSummaries ?? []) {
    if (!customById.has(summary.id)) {
      customById.set(summary.id, {
        id: summary.id,
        title: summary.title,
        summary: summary.summary,
        config: "",
        createdAt: "",
        updatedAt: "",
        visibility: "private",
        lifecycle: "published",
        badgeImageUrl: summary.badgeImageUrl ?? null,
      });
    }
  }

  return [
    ...challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      meta: challenge.objective,
      status: "Official",
      sourceBadge: "SQC Official",
      imageSource: getChallengeCoatImageSource(challenge),
    })),
    ...Array.from(customById.values()).map((quest) => ({
      id: quest.id,
      title: quest.title,
      meta: `Custom · ${getCustomVisibilityLabel(quest.visibility)} · ${cleanCustomRuleSummaryText(quest.summary)}`,
      status: "Custom",
      sourceBadge: quest.visibility === "public" ? "Community" : "Private",
      imageSource: getCustomQuestImageSource(quest.badgeImageUrl),
    })),
  ];
}

function isCustomQuestPublished(quest: Pick<MobileCustomSideQuest, "lifecycle">) {
  return (quest.lifecycle ?? "published") === "published";
}

function getCustomVisibilityLabel(visibility?: "private" | "public") {
  return visibility === "public" ? "Public" : "Private to you";
}

function getCustomLifecycleStatus(quest: Pick<CustomLibraryQuest, "id" | "lifecycle">, activeId?: string | null, completed = false) {
  const lifecycle = quest.lifecycle ?? "published";
  if (lifecycle === "draft") return "Draft";
  if (lifecycle === "archived") return "Archived";
  if (quest.id === activeId) return "Active";
  return completed ? "Completed" : "Ready";
}

function getCustomLibraryMeta(quest: Pick<CustomLibraryQuest, "summary" | "visibility" | "lifecycle">) {
  return [quest.lifecycle === "draft" ? "Draft" : quest.lifecycle === "archived" ? "Archived" : "Saved", getCustomVisibilityLabel(quest.visibility), cleanCustomRuleSummaryText(quest.summary)].filter(Boolean).join(" · ");
}

function getCustomVisibilityTitle(visibility?: "private" | "public") {
  return visibility === "public" ? "Public: shareable when ready" : "Private: only you can find it";
}

function getCustomVisibilityExplanation(visibility?: "private" | "public") {
  if (visibility === "public") {
    return "Other players may see the title, goal, and Coat of Arms when you share it or when public custom Side Quest browsing arrives. Your editor details and account stay private.";
  }

  return "Only you can find and manage this Side Quest. Other players can play it in a Multiplayer Side Quest you host, but they cannot browse, edit, or reuse the private setup unless you share it.";
}

function getCustomStateSavedMessage(name: string, next: { lifecycle?: "draft" | "published" | "archived"; visibility?: "private" | "public" }) {
  if (next.lifecycle === "archived") return `${name} is archived and no longer playable.`;
  if (next.visibility === "public") return `${name} is public/shareable. Other players may see its title, goal, and Coat of Arms when it is shared.`;
  if (next.visibility === "private") return `${name} is private. Only you can manage it, but you can still use it in Multiplayer Side Quests you host.`;
  return `${name} is published and ready to play.`;
}

const CUSTOM_SIDE_QUEST_SINGLE_CREST_PATH = "/badges/custom/custom-side-quest-crest.png";

function getCustomStatsLine(stats?: MobileCustomSideQuest["stats"]) {
  if (!stats) return "No attempts yet";
  return `Solo: ${stats.soloAttempts} tries, ${stats.soloCompletions} completed · Multiplayer: used ${stats.multiplayerLineups} times, completed ${stats.multiplayerFulfillments}`;
}

function getCustomQuestPopularity(stats?: MobileCustomSideQuest["stats"]) {
  if (!stats) return 0;
  return stats.soloSelections + stats.soloCompletions * 3 + stats.multiplayerLineups * 2 + stats.multiplayerFulfillments * 4;
}

function getCustomQuestUpdatedMs(quest: Pick<CustomLibraryQuest, "updatedAt" | "createdAt">) {
  const value = quest.updatedAt ?? quest.createdAt;
  const parsed = value ? Date.parse(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function customQuestMatchesSearch(quest: Pick<CustomLibraryQuest, "name" | "summary">, search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return `${quest.name} ${quest.summary}`.toLowerCase().includes(needle);
}

function multiplayerQuestMatchesSearch(quest: MobileGroupQuestSummary, search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [quest.title, quest.hostName, quest.copy, quest.providerLabel, ...(quest.questTitles ?? []), ...(quest.customQuestSummaries?.map((item) => `${item.title} ${item.summary}`) ?? []), ...Object.values(quest.rules ?? {})]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function getMultiplayerCommunitySortTime(quest: MobileGroupQuestSummary, sort: MultiplayerCommunitySort) {
  const raw = sort === "closing" ? quest.endAt : quest.startAt ?? quest.endAt;
  const parsed = raw ? Date.parse(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCustomQuestImageSource(badgeImageUrl?: string | null): ImageSourcePropType {
  const badgePath = getSingleCustomQuestBadgePath(badgeImageUrl);
  if (badgePath.includes("custom-side-quest-crest.png")) return SQC_CUSTOM_SIDE_QUEST_CREST_ASSET;
  return { uri: absoluteAssetUrl(badgePath) };
}

function getSingleCustomQuestBadgePath(badgeImageUrl?: string | null) {
  if (!badgeImageUrl) return CUSTOM_SIDE_QUEST_SINGLE_CREST_PATH;
  if (badgeImageUrl.includes("/badges/custom/") && !badgeImageUrl.includes("custom-side-quest-crest.png")) return CUSTOM_SIDE_QUEST_SINGLE_CREST_PATH;
  return badgeImageUrl;
}

function getJoinedMultiplayerListStatus(quest: MobileAccountState["activeGroupQuests"][number]) {
  return quest.isOwner ? "Hosting" : "Joined";
}

function getJoinedMultiplayerListMeta(quest: MobileAccountState["activeGroupQuests"][number]) {
  return quest.official
    ? [quest.isOwner ? "You host" : null, "Official public", quest.copy].filter(Boolean).join(" · ")
    : [quest.isOwner ? "You host" : null, quest.copy].filter(Boolean).join(" · ");
}

function getOfficialMultiplayerListStatus(
  quest: NonNullable<MobileAccountState["officialPublicGroupQuests"]>[number],
) {
  return quest.joinState === "Joined" ? "Joined" : "Not joined";
}

function getOfficialMultiplayerListMeta(
  quest: NonNullable<MobileAccountState["officialPublicGroupQuests"]>[number],
) {
  const joined = quest.joinState === "Joined";
  return ["Official public", joined ? "You joined" : "Not joined", quest.copy].filter(Boolean).join(" · ");
}

function formatGroupQuestDate(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dateFromGroupQuestValue(value?: string | null, fallback: Date = new Date()) {
  if (!value) return new Date(fallback.getTime());
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(fallback.getTime()) : date;
}

function addGroupQuestDays(value: Date, days: number) {
  const next = new Date(value.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function addGroupQuestMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60 * 1000);
}

function setGroupQuestDuration(startAt: Date, days: number) {
  return addGroupQuestDays(startAt, days);
}

function formatGroupQuestControlDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value);
}

function formatGroupQuestControlTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function GroupQuestDateTimeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (next: Date) => void;
}) {
  const [pickerTarget, setPickerTarget] = useState<NativeDateTimePickerTarget>(null);

  const handleNativePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setPickerTarget(null);
    if (event.type === "dismissed" || !selected || !pickerTarget) return;
    onChange(applyNativeDateTimeSelection(value, selected, pickerTarget.mode));
    if (Platform.OS !== "android") setPickerTarget(null);
  };

  return (
    <View style={styles.dateTimeControl}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.dateTimePanel}>
        <View style={styles.dateTimeNativeGrid}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Choose ${label} date`} style={styles.dateTimeNativeButton} onPress={() => setPickerTarget({ label, mode: "date" })}>
            <Text style={styles.dateTimeNativeKicker}>Date</Text>
            <Text style={styles.dateTimeNativeValue}>{formatGroupQuestControlDate(value)}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Choose ${label} time`} style={styles.dateTimeNativeButton} onPress={() => setPickerTarget({ label, mode: "time" })}>
            <Text style={styles.dateTimeNativeKicker}>Time</Text>
            <Text style={styles.dateTimeNativeValue}>{formatGroupQuestControlTime(value)}</Text>
          </Pressable>
        </View>
        <Text style={styles.dateTimeNativeHint}>Tap date or time to choose a value.</Text>
      </View>
      {pickerTarget ? (
        <DateTimePicker
          value={value}
          mode={pickerTarget.mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          locale="en-US"
          is24Hour={false}
          onChange={handleNativePickerChange}
        />
      ) : null}
    </View>
  );
}


type NativeDateTimePickerTarget = {
  label: string;
  mode: "date" | "time";
} | null;

function applyNativeDateTimeSelection(current: Date, selected: Date, mode: "date" | "time") {
  const next = new Date(current.getTime());
  if (mode === "date") {
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
  } else {
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
  }
  return next;
}

function GroupQuestDurationChips({
  startAt,
  onChangeEndAt,
}: {
  startAt: Date;
  onChangeEndAt: (next: Date) => void;
}) {
  return (
    <View style={styles.durationChipRow} accessibilityLabel="Quick Multiplayer Side Quest duration choices">
      {[
        { label: "24h", days: 1 },
        { label: "3 days", days: 3 },
        { label: "1 week", days: 7 },
        { label: "2 weeks", days: 14 },
      ].map((option) => (
        <Pressable key={option.label} accessibilityRole="button" accessibilityLabel={`Set duration to ${option.label}`} style={styles.dateTimeChip} onPress={() => onChangeEndAt(setGroupQuestDuration(startAt, option.days))}>
          <Text style={styles.dateTimeChipText}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function defaultGroupQuestEndAtIso(durationDays: number) {
  const end = new Date();
  end.setDate(end.getDate() + Math.max(1, Math.min(30, Math.round(durationDays))));
  end.setHours(23, 59, 0, 0);
  return end.toISOString();
}

function getLeaderboardProgressPercent(verified: string) {
  const match = verified.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return 0;
  const done = Number(match[1]);
  const total = Number(match[2]);
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

function getChallengeCoatGlowSource(challengeId: string): ImageSourcePropType {
  return CHALLENGE_COAT_GLOW_ASSETS[challengeId] ?? CHALLENGE_COAT_GLOW_ASSETS["finish-any-game"];
}

function getBrowseStatusTone(status: string): "green" | "gold" | "orange" | "danger" | "absurd" | null {
  if (status === "Admin") return "gold";
  if (status === "Easy") return "green";
  if (status === "Medium") return "gold";
  if (status === "Hard") return "orange";
  if (status === "Brutal") return "danger";
  if (status === "Absurd") return "absurd";
  return null;
}

function getRowImageSource(url: string | null): ImageSourcePropType | null {
  if (!url) return null;
  const badgePath = getSingleCustomQuestBadgePath(url);
  if (badgePath.includes("custom-side-quest-crest.png")) return SQC_CUSTOM_SIDE_QUEST_CREST_ASSET;
  return { uri: absoluteAssetUrl(badgePath) };
}

function FeedSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={compactStyles.feedSection}>
      <Text style={compactStyles.feedSectionTitle}>{title}</Text>
      <View style={compactStyles.feedRows}>{children}</View>
    </View>
  );
}

function FeedRow({ title, status, meta, onPress }: { title: string; status: string; meta: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.feedRow} onPress={onPress}>
      <View style={compactStyles.feedRowCopy}>
        <Text style={compactStyles.feedRowTitle} numberOfLines={1}>{title}</Text>
        <Text style={compactStyles.feedRowMeta} numberOfLines={1}>{meta}</Text>
      </View>
      <Text style={compactStyles.feedRowStatus} numberOfLines={1}>{status}</Text>
    </Pressable>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={compactStyles.miniStat}>
      <Text style={compactStyles.miniStatValue}>{value}</Text>
      <Text style={compactStyles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function TableRow({ label, title, state, proof, onPress }: { label: string; title: string; state: string; proof: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.tableRow} onPress={onPress}>
      <View style={compactStyles.tableNameCell}>
        <Text style={compactStyles.tableRowLabel}>{label}</Text>
        <Text style={compactStyles.tableRowTitle} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={compactStyles.tableCell} numberOfLines={1}>{state}</Text>
      <Text style={compactStyles.tableCell} numberOfLines={1}>{proof}</Text>
    </Pressable>
  );
}

function QuestBoardDashboard({
  bootstrap,
  selectedChallenge,
  pendingSideQuestDetailId,
  pendingCompletedDetailId,
  onConsumePendingQuestOpen,
  account,
  authBridge,
  onSelectChallenge,
  onSelectTab,
  onAccountUpdated,
  onOpenChallengeDetail,
  onOpenMultiplayerCreate,
}: {
  bootstrap: MobileBootstrap;
  selectedChallenge: MobileChallenge;
  pendingSideQuestDetailId: string | null;
  pendingCompletedDetailId: string | null;
  onConsumePendingQuestOpen: () => void;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: AccountUpdatedCallback;
  onOpenChallengeDetail: (challengeId: string) => void;
  onOpenMultiplayerCreate: (questId?: string) => void;
}) {
  const [detailChallengeId, setDetailChallengeId] = useState<string | null>(null);
  const [completedDetailId, setCompletedDetailId] = useState<string | null>(null);
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const completedIds = new Set(signedIn?.progress.completedChallengeIds ?? []);
  const activeId = signedIn?.activeQuest && !signedIn.activeQuest.completed ? signedIn.activeQuest.id : null;
  const browseQuests: BrowseQuest[] = [
    ...bootstrap.challenges.map((challenge) => ({ ...challenge, browseKind: "live" as const })),
    ...MOBILE_COMING_SOON_QUESTS.filter(() => false),
  ];
  const sortedQuests = [...browseQuests].sort((a, b) => {
    if (a.browseKind !== b.browseKind) return a.browseKind === "live" ? -1 : 1;

    const difficultyDelta = (DIFFICULTY_RANK[a.difficulty] ?? 99) - (DIFFICULTY_RANK[b.difficulty] ?? 99);
    if (difficultyDelta !== 0) return difficultyDelta;

    const rank = (challenge: BrowseQuest) => {
      if (challenge.browseKind === "coming-soon") return 3;
      if (challenge.id === activeId) return 0;
      if (completedIds.has(challenge.id)) return 2;
      return 1;
    };
    const rankDelta = rank(a) - rank(b);
    if (rankDelta !== 0) return rankDelta;

    if (a.browseKind === "coming-soon" && b.browseKind === "coming-soon") {
      const dateDelta = (a.releaseDate ?? "9999-99-99").localeCompare(b.releaseDate ?? "9999-99-99");
      if (dateDelta !== 0) return dateDelta;
    }
    if (a.reward !== b.reward) return a.reward - b.reward;
    return a.title.localeCompare(b.title);
  });
  const detailChallenge = detailChallengeId ? bootstrap.challenges.find((challenge) => challenge.id === detailChallengeId) ?? null : null;
  const completedQuestRecord = completedDetailId && signedIn ? signedIn.completedQuests.find((quest) => quest.id === completedDetailId) ?? null : null;
  const completedDetailOfficialChallenge = completedDetailId ? bootstrap.challenges.find((challenge) => challenge.id === completedDetailId) ?? null : null;
  const completedDetailCustomQuest = completedDetailId ? [...(signedIn?.customSideQuests ?? []), ...(signedIn?.communitySideQuests ?? [])].find((quest) => quest.id === completedDetailId) ?? null : null;
  const completedDetailChallenge = completedDetailOfficialChallenge ?? (completedQuestRecord ? buildCustomProofChallenge(completedQuestRecord, completedDetailCustomQuest) : null);
  const [customCreateOpen, setCustomCreateOpen] = useState(false);
  const [customEditingQuestId, setCustomEditingQuestId] = useState<string | null>(null);
  const [customDetailId, setCustomDetailId] = useState<string | null>(null);
  const [sideQuestCatalogTab, setSideQuestCatalogTab] = useState<"official" | "community">("official");
  const [communityView, setCommunityView] = useState<CommunityBrowseView>("discover");
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityCreatorFilter, setCommunityCreatorFilter] = useState<string | null>(null);
  const [communityFilter, setCommunityFilter] = useState<CommunityBrowseFilter>("all");
  const [communitySort, setCommunitySort] = useState<CommunityBrowseSort>("popular");
  const [customLibraryFilter, setCustomLibraryFilter] = useState<CustomLibraryFilter>("all");
  const [customPublishVisibility, setCustomPublishVisibility] = useState<"private" | "public">("private");
  const [communityReportOpen, setCommunityReportOpen] = useState(false);
  const [communityReportMessage, setCommunityReportMessage] = useState("");
  const [customConditionEditorOpen, setCustomConditionEditorOpen] = useState(false);
  const [customQuestName, setCustomQuestName] = useState("My custom Side Quest");
  const [customRuleLogic, setCustomRuleLogic] = useState<CustomRuleLogic>("all");
  const [customRulePiece, setCustomRulePiece] = useState<CustomRulePiece>("queen");
  const [customRuleOwner, setCustomRuleOwner] = useState<CustomRuleOwner>("my");
  const [customRuleCondition, setCustomRuleCondition] = useState<CustomRuleCondition>("game result");
  const [customRuleTiming, setCustomRuleTiming] = useState<CustomRuleTiming>("by move");
  const [customRuleMoveNumber, setCustomRuleMoveNumber] = useState("15");
  const [customRuleQuantifier, setCustomRuleQuantifier] = useState<CustomRuleQuantifier>("any one");
  const [customRuleCount, setCustomRuleCount] = useState(1);
  const [customRuleIdentity, setCustomRuleIdentity] = useState("original");
  const [customRuleTargetSquare, setCustomRuleTargetSquare] = useState("e4");
  const [customRuleMoveSequence, setCustomRuleMoveSequence] = useState("e4 e5 Nf3");
  const [customRuleOpeningSequence, setCustomRuleOpeningSequence] = useState("1.e4 e5 2.f4");
  const [customRuleResult, setCustomRuleResult] = useState<CustomRuleResult>("win");
  const [customRuleNegated, setCustomRuleNegated] = useState(false);
  const [customRequirements, setCustomRequirements] = useState<CustomRuleRequirement[]>([]);
  const customRequirementIdCounter = useRef(0);
  const [customEditingRequirementId, setCustomEditingRequirementId] = useState<string | null>(null);
  const [customDrafts, setCustomDrafts] = useState<CustomLibraryQuest[]>([]);
  const serverCustomDrafts: CustomLibraryQuest[] = isAuthenticatedAccount(account) ? (account.customSideQuests ?? []).map((quest) => ({ id: quest.id, name: quest.title, summary: quest.summary, config: quest.config, visibility: quest.visibility ?? "private", lifecycle: quest.lifecycle ?? "published", createdAt: quest.createdAt, updatedAt: quest.updatedAt, creatorName: quest.creatorName, ownedByYou: quest.ownedByYou, badgeImageUrl: quest.badgeImageUrl ?? null, stats: quest.stats })) : [];
  const serverCommunityQuests: CustomLibraryQuest[] = isAuthenticatedAccount(account) ? (account.communitySideQuests ?? []).map((quest) => ({ id: quest.id, name: quest.title, summary: quest.summary, config: quest.config, visibility: quest.visibility ?? "public", lifecycle: quest.lifecycle ?? "published", createdAt: quest.createdAt, updatedAt: quest.updatedAt, creatorName: quest.creatorName, ownedByYou: quest.ownedByYou, badgeImageUrl: quest.badgeImageUrl ?? null, stats: quest.stats })) : [];
  const visibleCustomDrafts = serverCustomDrafts.length ? serverCustomDrafts : customDrafts;
  const communityReferenceMs = signedIn?.generatedAt ? Date.parse(signedIn.generatedAt) : 0;
  const publicCommunityQuests = serverCommunityQuests.filter((quest) => quest.lifecycle === "published" && quest.visibility === "public");
  const communityBrowseQuests = publicCommunityQuests
    .filter((quest) => customQuestMatchesSearch(quest, communitySearch))
    .filter((quest) => !communityCreatorFilter || quest.creatorName === communityCreatorFilter)
    .filter((quest) => {
      if (communityFilter === "popular") return getCustomQuestPopularity(quest.stats) > 0;
      if (communityFilter === "new") return Boolean(communityReferenceMs) && communityReferenceMs - getCustomQuestUpdatedMs(quest) < 1000 * 60 * 60 * 24 * 30;
      if (communityFilter === "completed") return Boolean(signedIn?.completedQuests.some((completedQuest) => completedQuest.id === quest.id));
      return true;
    })
    .sort((a, b) => {
      if (communitySort === "newest") return getCustomQuestUpdatedMs(b) - getCustomQuestUpdatedMs(a);
      if (communitySort === "az") return a.name.localeCompare(b.name);
      const popularDelta = getCustomQuestPopularity(b.stats) - getCustomQuestPopularity(a.stats);
      if (popularDelta !== 0) return popularDelta;
      return getCustomQuestUpdatedMs(b) - getCustomQuestUpdatedMs(a);
    });
  const filteredCustomDrafts = visibleCustomDrafts
    .filter((quest) => customQuestMatchesSearch(quest, communitySearch))
    .filter((quest) => {
      if (customLibraryFilter === "published") return quest.lifecycle === "published";
      if (customLibraryFilter === "drafts") return quest.lifecycle === "draft";
      if (customLibraryFilter === "public") return quest.visibility === "public";
      if (customLibraryFilter === "archived") return quest.lifecycle === "archived";
      return true;
    })
    .sort((a, b) => getCustomQuestUpdatedMs(b) - getCustomQuestUpdatedMs(a));
  const customDetailDraft = customDetailId ? [...visibleCustomDrafts, ...publicCommunityQuests].find((draft) => draft.id === customDetailId) ?? null : null;
  const customDetailCompletedQuest = customDetailDraft && signedIn ? signedIn.completedQuests.find((quest) => quest.id === customDetailDraft.id) ?? null : null;
  const customDetailLatestReceipt = customDetailDraft && signedIn?.latestReceipt?.challengeId === customDetailDraft.id ? signedIn.latestReceipt : null;
  const customDetailActive = Boolean(customDetailDraft && activeId === customDetailDraft.id);
  const customDetailOwned = Boolean(customDetailDraft && visibleCustomDrafts.some((draft) => draft.id === customDetailDraft.id));
  const currentCustomRequirement = {
    piece: customRulePiece,
    owner: customRuleOwner,
    condition: customRuleCondition,
    timing: customRuleTiming,
    moveNumber: normalizeCustomMoveNumber(customRuleMoveNumber),
    quantifier: customRuleQuantifier,
    count: normalizeCustomRuleCount(customRulePiece, customRuleCount),
    identity: normalizeCustomPieceIdentity(customRulePiece, customRuleIdentity),
    targetSquare: normalizeCustomSquare(customRuleTargetSquare),
    moveSequence: normalizeCustomMoveSequence(customRuleMoveSequence),
    openingSequence: normalizeCustomOpeningSequence(customRuleOpeningSequence),
    result: customRuleResult,
    negated: customRuleNegated,
  };
  const customRuleRequirements = customRequirements.map(({ id: _id, ...requirement }) => requirement);
  const customRuleSummary = customRuleRequirements.length ? buildCustomRuleSetSummary({ logic: customRuleLogic, requirements: customRuleRequirements }) : "Add at least one condition before this Side Quest can be scored.";
  const customRuleConfig = buildCustomPieceRuleConfig({ logic: customRuleLogic, requirements: customRuleRequirements });
  const customBadgePreviewUrl = getCustomCoatPreviewUrl(customRuleRequirements, customQuestName);
  const canPublishCustomQuest = customRequirements.length > 0 || customConditionEditorOpen;

  function openCustomEditor(quest?: CustomLibraryQuest | null) {
    setCustomConditionEditorOpen(false);
    setCustomEditingRequirementId(null);
    if (quest) {
      const parsedRules = parseCustomRuleRequirements(quest.config);
      setCustomEditingQuestId(quest.id);
      setCustomQuestName(quest.name);
      setCustomPublishVisibility(quest.visibility ?? "private");
      setCustomRuleLogic(parsedRules?.logic ?? "all");
      setCustomRequirements(parsedRules?.requirements ?? []);
    } else {
      setCustomEditingQuestId(null);
      setCustomQuestName("My custom Side Quest");
      setCustomPublishVisibility("private");
      setCustomRuleLogic("all");
      setCustomRequirements([]);
    }
    setCustomCreateOpen(true);
  }

  function loadCustomRequirement(requirement: CustomRuleRequirement) {
    setCustomRulePiece(requirement.piece);
    setCustomRuleOwner(requirement.owner);
    setCustomRuleCondition(requirement.condition);
    setCustomRuleTiming(requirement.timing);
    setCustomRuleMoveNumber(String(requirement.moveNumber));
    setCustomRuleQuantifier(requirement.quantifier);
    setCustomRuleCount(requirement.count);
    setCustomRuleIdentity(requirement.identity);
    setCustomRuleTargetSquare(requirement.targetSquare);
    setCustomRuleMoveSequence(requirement.moveSequence || "e4 e5 Nf3");
    setCustomRuleOpeningSequence(requirement.openingSequence || "1.e4 e5 2.f4");
    setCustomRuleResult(requirement.result || "win");
    setCustomRuleNegated(requirement.negated);
  }

  function openNewCustomRequirement() {
    setCustomEditingRequirementId(null);
    setCustomConditionEditorOpen(true);
  }

  function editCustomRequirement(requirement: CustomRuleRequirement) {
    loadCustomRequirement(requirement);
    setCustomEditingRequirementId(requirement.id);
    setCustomConditionEditorOpen(true);
  }

  function saveCustomRequirement() {
    const validationError = getCustomRequirementValidation(currentCustomRequirement);
    if (validationError) {
      Alert.alert("Condition needs one fix", validationError);
      return false;
    }

    setCustomRequirements(getCustomRequirementsIncludingOpenCondition(false) ?? customRequirements);
    setCustomEditingRequirementId(null);
    setCustomConditionEditorOpen(false);
    return true;
  }

  function getCustomRequirementsIncludingOpenCondition(allowInvalidDraft: boolean) {
    if (!customConditionEditorOpen) {
      return customRequirements;
    }

    const validationError = getCustomRequirementValidation(currentCustomRequirement);
    if (validationError && !allowInvalidDraft) {
      Alert.alert("Condition needs one fix", validationError);
      return null;
    }

    if (customEditingRequirementId) {
      return customRequirements.map((requirement) => requirement.id === customEditingRequirementId ? { id: requirement.id, ...currentCustomRequirement } : requirement);
    }

    customRequirementIdCounter.current += 1;
    return [{ id: `draft-condition-${customRequirementIdCounter.current}`, ...currentCustomRequirement }, ...customRequirements].slice(0, 6);
  }

  function duplicateCustomRequirement(requirement: CustomRuleRequirement) {
    customRequirementIdCounter.current += 1;
    setCustomRequirements((current) => [{ ...requirement, id: `draft-condition-${customRequirementIdCounter.current}` }, ...current].slice(0, 6));
  }

  function removeCustomRequirement(requirementId: string) {
    setCustomRequirements((current) => current.filter((requirement) => requirement.id !== requirementId));
    if (customEditingRequirementId === requirementId) {
      setCustomEditingRequirementId(null);
      setCustomConditionEditorOpen(false);
    }
  }

  async function saveCustomDraft(lifecycle: "draft" | "published" = "published") {
    const requirementsForSave = getCustomRequirementsIncludingOpenCondition(lifecycle === "draft");
    if (!requirementsForSave) {
      return;
    }
    if (lifecycle === "published" && !requirementsForSave.length) {
      Alert.alert("Add a condition first", "A custom Side Quest needs at least one saved condition before it can be published.");
      return;
    }
    const name = customQuestName.trim() || "Custom Side Quest";
    const summary = requirementsForSave.length ? buildCustomRuleSetSummary({ logic: customRuleLogic, requirements: requirementsForSave.map(({ id: _id, ...requirement }) => requirement) }) : "Add at least one condition before this Side Quest can be scored.";
    const config = buildCustomPieceRuleConfig({ logic: customRuleLogic, requirements: requirementsForSave.map(({ id: _id, ...requirement }) => requirement) });
    const badgePreviewUrl = getCustomCoatPreviewUrl(requirementsForSave, name);
    if (!authBridge.isSignedIn) {
      setCustomDrafts((current) => {
        const now = new Date().toISOString();
        const editingLocalId = customEditingQuestId?.startsWith("local-custom-") ? customEditingQuestId : null;
        const draft: CustomLibraryQuest = { id: editingLocalId ?? `local-custom-${customRequirementIdCounter.current + 1}`, name, summary, config, visibility: lifecycle === "published" ? customPublishVisibility : "private", lifecycle, createdAt: now, updatedAt: now, badgeImageUrl: badgePreviewUrl };
        if (!editingLocalId) customRequirementIdCounter.current += 1;
        if (editingLocalId) return current.map((entry) => entry.id === editingLocalId ? { ...entry, ...draft, createdAt: entry.createdAt ?? now } : entry);
        return [draft, ...current].slice(0, 6);
      });
      Alert.alert(customEditingQuestId ? "Local Side Quest updated" : lifecycle === "draft" ? "Draft saved locally" : "Sign in to launch this Side Quest", customEditingQuestId ? `${name} has the latest rules on this device.` : lifecycle === "draft" ? `${name} is saved as a local draft.` : `${name} is saved locally for now. Sign in to make it pickable and verifiable.`);
      setCustomCreateOpen(false);
      setCustomEditingQuestId(null);
      return;
    }
    try {
      const sessionToken = await authBridge.getSessionToken();
      const visibility = lifecycle === "published" ? customPublishVisibility : "private";
      await saveMobileCustomSideQuest({ sessionToken, id: customEditingQuestId ?? undefined, title: name, summary, config, lifecycle, visibility });
      await Promise.resolve(onAccountUpdated());
      Alert.alert(customEditingQuestId ? "Custom Side Quest updated" : lifecycle === "draft" ? "Custom Side Quest draft saved" : visibility === "public" ? "Community Side Quest published" : "Custom Side Quest saved", customEditingQuestId ? `${name} now has the latest name, rules, and visibility.` : lifecycle === "draft" ? `${name} is saved as a private draft. Publish it when the rules are ready.` : visibility === "public" ? `${name} is now public in Community Discover.` : `${name} is ready in your private Side Quest Library.`);
      setCustomCreateOpen(false);
      setCustomEditingQuestId(null);
    } catch (caught) {
      Alert.alert(lifecycle === "published" ? "Could not publish Side Quest" : "Could not save draft", caught instanceof Error ? caught.message : "Try again in a moment.");
    }
  }

  function openCommunityCreatorShelf(quest: CustomLibraryQuest) {
    if (!quest.creatorName) return;
    setCommunityCreatorFilter(quest.creatorName);
    setCommunityView("discover");
    setSideQuestCatalogTab("community");
    setCustomDetailId(null);
  }

  function openCommunityReport(quest: CustomLibraryQuest) {
    const creatorLine = quest.creatorName ? `Creator: ${quest.creatorName}` : "Creator: unknown";
    setCommunityReportMessage([
      "Report Community Solo Side Quest",
      `Quest: ${quest.name}`,
      `Quest ID: ${quest.id}`,
      creatorLine,
      "Issue: ",
    ].join("\n"));
    setCommunityReportOpen(true);
  }

  async function startCustomSideQuest(questId: string) {
    if (!authBridge.isSignedIn) {
      Alert.alert("Sign in to start custom Side Quests", "Saved Side Quests can be picked after sign-in.");
      return;
    }
    try {
      const sessionToken = await authBridge.getSessionToken();
      await runMobileQuestAction({ sessionToken, action: "start", challengeId: questId });
      await Promise.resolve(onAccountUpdated());
      onSelectTab("home");
    } catch (caught) {
      Alert.alert("Could not start custom Side Quest", caught instanceof Error ? caught.message : "Try again in a moment.");
    }
  }

  useEffect(() => {
    if (!pendingCompletedDetailId && !pendingSideQuestDetailId) return;

    const timer = setTimeout(() => {
      if (pendingCompletedDetailId) {
        setCompletedDetailId(pendingCompletedDetailId);
        setDetailChallengeId(null);
        onConsumePendingQuestOpen();
        return;
      }

      if (pendingSideQuestDetailId) {
        setDetailChallengeId(pendingSideQuestDetailId);
        setCompletedDetailId(null);
        onConsumePendingQuestOpen();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [onConsumePendingQuestOpen, pendingCompletedDetailId, pendingSideQuestDetailId]);

  return (
    <View style={compactStyles.stack}>
      <View style={compactStyles.sideQuestListEmblemWrap}>
        <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.sideQuestListEmblem} resizeMode="contain" />
      </View>
      <View style={compactStyles.sideQuestBrandTabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: sideQuestCatalogTab === "official" }}
          accessibilityLabel="Show SQC Official Side Quests"
          style={[
            compactStyles.sideQuestBrandTab,
            compactStyles.sideQuestBrandTabOfficial,
            sideQuestCatalogTab === "official" && compactStyles.sideQuestBrandTabOfficialActive,
          ]}
          onPress={() => setSideQuestCatalogTab("official")}
        >
          <Text style={[compactStyles.sideQuestBrandTabText, sideQuestCatalogTab === "official" && compactStyles.sideQuestBrandTabOfficialTextActive]} numberOfLines={2}>SQC Official Side Quests</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: sideQuestCatalogTab === "community" }}
          accessibilityLabel="Show Community Side Quests"
          style={[
            compactStyles.sideQuestBrandTab,
            compactStyles.sideQuestBrandTabCommunity,
            sideQuestCatalogTab === "community" && compactStyles.sideQuestBrandTabCommunityActive,
          ]}
          onPress={() => setSideQuestCatalogTab("community")}
        >
          <Text style={[compactStyles.sideQuestBrandTabText, sideQuestCatalogTab === "community" && compactStyles.sideQuestBrandTabCommunityTextActive]} numberOfLines={2}>Community Solo</Text>
        </Pressable>
      </View>

      {sideQuestCatalogTab === "community" ? (
        <View style={compactStyles.communityEmptyPanel}>
          <Text style={compactStyles.communityEmptyTitle}>Community Solo, fully in your hand.</Text>
          <Text style={compactStyles.communityEmptyCopy}>Browse, inspect, start, check, prove, collect, and report Community Solo Side Quests in the app. The website has the same product surface in a wider layout.</Text>
        </View>
      ) : null}

      {sideQuestCatalogTab === "official" ? (
        <View style={compactStyles.appSection}>
          <View style={compactStyles.panelHeaderRow}>
            <Text style={compactStyles.freshSectionTitle}>SQC Official Side Quests</Text>
            <Text style={compactStyles.sectionAction}>{sortedQuests.length} official</Text>
          </View>
          <View style={compactStyles.sideQuestCatalogRows}>
            {sortedQuests.map((challenge) => {
            const comingSoon = challenge.browseKind === "coming-soon";
            const active = challenge.id === activeId;
            const completed = !comingSoon && completedIds.has(challenge.id);
            const comingSoonDate = challenge.releaseDate ? formatComingSoonDate(challenge.releaseDate) : null;
            return (
              <AppRow
                key={challenge.id}
                title={challenge.title}
                meta={comingSoon ? `Coming ${comingSoonDate ?? "soon"} · ${challenge.objective}` : challenge.objective}
                status={comingSoon ? `Coming ${comingSoonDate ?? "soon"}` : active ? "Active" : completed ? "Completed" : challenge.difficulty}
                imageSource={getChallengeCoatImageSource(challenge)}
                glowSource={getChallengeCoatGlowSource(challenge.id)}
                glowColor={getSafeBadgeColors(challenge).glow}
                blurImage={comingSoon}
                dimImage={comingSoon}
                overlaySeal={completed}
                onPress={() => {
                  if (comingSoon) {
                    Alert.alert(challenge.title, `Coming ${comingSoonDate ?? "soon"}.`);
                    return;
                  }
                  if (completed) {
                    setCompletedDetailId(challenge.id);
                    return;
                  }
                  onSelectChallenge(challenge.id, "sideQuests");
                  setDetailChallengeId(challenge.id);
                }}
              />
            );
            })}
          </View>
        </View>
      ) : (
        <>
          <View style={compactStyles.communitySubTabs}>
            {(["discover", "mine"] as CommunityBrowseView[]).map((view) => (
              <Pressable
                key={view}
                accessibilityRole="tab"
                accessibilityState={{ selected: communityView === view }}
                style={[compactStyles.communitySubTab, communityView === view && compactStyles.communitySubTabActive]}
                onPress={() => setCommunityView(view)}
              >
                <Text style={[compactStyles.communitySubTabText, communityView === view && compactStyles.communitySubTabTextActive]}>{view === "discover" ? "Discover" : "My Library"}</Text>
              </Pressable>
            ))}
          </View>

          {communityView === "discover" ? (
            <View style={compactStyles.appSection}>
              <View style={compactStyles.panelHeaderRow}>
                <Text style={compactStyles.freshSectionTitle}>Community Solo Discover</Text>
                <Text style={compactStyles.sectionAction}>{publicCommunityQuests.length ? `${communityBrowseQuests.length}/${publicCommunityQuests.length}` : "0 public"}</Text>
              </View>
              {publicCommunityQuests.length || communitySearch || communityCreatorFilter ? (
                <View style={compactStyles.communityBrowsePanel}>
                  {communityCreatorFilter ? (
                    <View style={compactStyles.communityEmptyPanel}>
                      <Text style={compactStyles.communityEmptyTitle}>Creator shelf: {communityCreatorFilter}</Text>
                      <Text style={compactStyles.communityEmptyCopy}>Showing public Community Solo Side Quests from this creator only. Private drafts and account details stay hidden.</Text>
                      <Pressable accessibilityRole="button" accessibilityLabel="Show all Community Solo creators" style={compactStyles.secondaryAction} onPress={() => setCommunityCreatorFilter(null)}>
                        <Text style={compactStyles.secondaryActionText}>Show all creators</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  <View style={compactStyles.communitySearchBox}>
                    <MaterialCommunityIcons name="magnify" size={18} color="rgba(255,247,232,.52)" />
                    <TextInput
                      value={communitySearch}
                      placeholder={communityCreatorFilter ? "Search this creator shelf" : "Search by name or rule"}
                      placeholderTextColor="rgba(255,247,232,.42)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={compactStyles.communitySearchInput}
                      onChangeText={setCommunitySearch}
                    />
                    {communitySearch || communityCreatorFilter ? (
                      <Pressable accessibilityRole="button" accessibilityLabel="Clear community search" onPress={() => { setCommunitySearch(""); setCommunityCreatorFilter(null); }}>
                        <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,247,232,.5)" />
                      </Pressable>
                    ) : null}
                  </View>
                  <View style={compactStyles.communityControlsRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={compactStyles.communityChipRow}>
                      {(["all", "popular", "new", "completed"] as CommunityBrowseFilter[]).map((filter) => (
                        <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: communityFilter === filter }} style={[compactStyles.communityChip, communityFilter === filter && compactStyles.communityChipActive]} onPress={() => setCommunityFilter(filter)}>
                          <Text style={[compactStyles.communityChipText, communityFilter === filter && compactStyles.communityChipTextActive]}>{filter === "all" ? "All" : filter === "popular" ? "Popular" : filter === "new" ? "New" : "Completed"}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                    <Pressable accessibilityRole="button" accessibilityLabel="Change community sort" style={compactStyles.communitySortCompact} onPress={() => setCommunitySort(communitySort === "popular" ? "newest" : communitySort === "newest" ? "az" : "popular")}>
                      <Text style={compactStyles.communitySortCompactText}>{communitySort === "popular" ? "Sort: Top" : communitySort === "newest" ? "Sort: New" : "Sort: A–Z"}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              {communityBrowseQuests.length ? (
                <View style={compactStyles.sideQuestCatalogRows}>
                  {communityBrowseQuests.map((quest) => (
                    <AppRow key={quest.id} title={quest.name} meta={`${quest.creatorName ? `By ${quest.creatorName} · ` : ""}${cleanCustomRuleSummaryText(quest.summary)} · ${getCustomStatsLine(quest.stats)}`} status={getCustomLifecycleStatus(quest, activeId, Boolean(signedIn?.completedQuests.some((completedQuest) => completedQuest.id === quest.id)))} sourceBadge={quest.ownedByYou ? "Yours" : "Community"} imageSource={getCustomQuestImageSource(quest.badgeImageUrl)} variant="seal" onPress={() => setCustomDetailId(quest.id)} />
                  ))}
                </View>
              ) : (
                <View style={compactStyles.communityEmptyPanel}>
                  <Text style={compactStyles.communityEmptyTitle}>{publicCommunityQuests.length ? communityCreatorFilter ? "That creator shelf is empty." : "No matches yet." : "No public Community Side Quests yet."}</Text>
                  <Text style={compactStyles.communityEmptyCopy}>{publicCommunityQuests.length ? communityCreatorFilter ? "Try clearing the creator shelf, search text, or filter. Nothing private is shown from guessed creator context." : "Try a broader search or switch the filter back to All." : "Create the first public Side Quest from My Library. Public quests will appear here as the catalog grows."}</Text>
                  <View style={compactStyles.actionRowTight}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Create Side Quest" style={compactStyles.primaryAction} onPress={() => openCustomEditor()}>
                      <Text style={compactStyles.primaryActionText}>Create Side Quest</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel="View my Side Quests" style={compactStyles.secondaryAction} onPress={() => setCommunityView("mine")}>
                      <Text style={compactStyles.secondaryActionText}>My Library</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={compactStyles.appSection}>
              <View style={compactStyles.panelHeaderRow}>
                <Text style={compactStyles.freshSectionTitle}>My Custom Library</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Create custom Side Quest" onPress={() => openCustomEditor()}>
                  <Text style={compactStyles.sectionAction}>+ Create</Text>
                </Pressable>
              </View>
              {visibleCustomDrafts.length ? null : (
                <Pressable accessibilityRole="button" accessibilityLabel="Create custom Side Quest" style={compactStyles.freshPanel} onPress={() => openCustomEditor()}>
                  <View style={compactStyles.currentQuestRow}>
                    <View style={compactStyles.coatMarker}>
                      <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.coatMarkerImage} resizeMode="contain" />
                    </View>
                    <View style={compactStyles.currentQuestText}>
                      <Text style={compactStyles.currentQuestTitle}>Build your own Side Quest</Text>
                      <Text style={compactStyles.currentQuestMeta}>Create rules, keep drafts private, publish when ready, and use them solo or in Multiplayer Side Quests you host.</Text>
                    </View>
                  </View>
                  <View style={compactStyles.actionRowTight}>
                    <View style={compactStyles.primaryAction}>
                      <Text style={compactStyles.primaryActionText}>Build a Side Quest</Text>
                    </View>
                  </View>
                </Pressable>
              )}
              <View style={compactStyles.communitySearchBox}>
                <MaterialCommunityIcons name="magnify" size={18} color="rgba(255,247,232,.52)" />
                <TextInput
                  value={communitySearch}
                  placeholder="Search my quests"
                  placeholderTextColor="rgba(255,247,232,.42)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={compactStyles.communitySearchInput}
                  onChangeText={setCommunitySearch}
                />
                {communitySearch ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Clear library search" onPress={() => setCommunitySearch("")}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,247,232,.5)" />
                  </Pressable>
                ) : null}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={compactStyles.communityChipRow}>
                {(["all", "published", "drafts", "public", "archived"] as CustomLibraryFilter[]).map((filter) => (
                  <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: customLibraryFilter === filter }} style={[compactStyles.communityChip, customLibraryFilter === filter && compactStyles.communityChipActive]} onPress={() => setCustomLibraryFilter(filter)}>
                    <Text style={[compactStyles.communityChipText, customLibraryFilter === filter && compactStyles.communityChipTextActive]}>{filter === "all" ? "All" : filter === "drafts" ? "Drafts" : filter === "public" ? "Public" : filter === "archived" ? "Archived" : "Published"}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {filteredCustomDrafts.length ? (
                <View style={compactStyles.sideQuestCatalogRows}>
                  {filteredCustomDrafts.map((draft) => (
                    <AppRow key={draft.id} title={draft.name} meta={`${getCustomLibraryMeta(draft)} · ${getCustomStatsLine(draft.stats)}`} status={getCustomLifecycleStatus(draft, activeId, Boolean(signedIn?.completedQuests.some((quest) => quest.id === draft.id)))} sourceBadge={draft.lifecycle === "draft" ? "Draft" : draft.visibility === "public" ? "Community" : "Private"} imageSource={getCustomQuestImageSource(draft.badgeImageUrl)} variant="seal" onPress={() => setCustomDetailId(draft.id)} />
                  ))}
                </View>
              ) : (
                <View style={compactStyles.communityEmptyPanel}>
                  <Text style={compactStyles.communityEmptyTitle}>{visibleCustomDrafts.length ? "No library matches." : "Your library is empty."}</Text>
                  <Text style={compactStyles.communityEmptyCopy}>{visibleCustomDrafts.length ? "Change the library filter or search text to find another saved Side Quest." : "Create a draft first, then publish it when the rule feels ready."}</Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      <CustomSideQuestDetailModal
        quest={customDetailDraft}
        visible={Boolean(customDetailDraft)}
        active={customDetailActive}
        completed={Boolean(customDetailCompletedQuest)}
        completedAt={customDetailCompletedQuest?.completedAt ?? null}
        latestReceipt={customDetailLatestReceipt}
        onClose={() => setCustomDetailId(null)}
        onStart={async (questId) => {
          await startCustomSideQuest(questId);
          setCustomDetailId(null);
        }}
        onEdit={customDetailOwned ? (quest) => {
          openCustomEditor(quest);
          setCustomDetailId(null);
        } : undefined}
        onDuplicate={async (quest) => {
          if (!authBridge.isSignedIn) return Alert.alert("Sign in required", "Sign in to duplicate saved custom Side Quests.");
          const sessionToken = await authBridge.getSessionToken();
          await saveMobileCustomSideQuest({ sessionToken, title: `${quest.name} Copy`, summary: quest.summary, config: quest.config, lifecycle: "published", visibility: quest.visibility ?? "private" });
          await Promise.resolve(onAccountUpdated());
          Alert.alert("Custom Side Quest duplicated", `${quest.name} Copy is now in your library.`);
        }}
        onDelete={customDetailOwned ? async (questId) => {
          if (!authBridge.isSignedIn) {
            setCustomDrafts((current) => current.filter((draft) => draft.id !== questId));
          } else {
            const sessionToken = await authBridge.getSessionToken();
            await deleteMobileCustomSideQuest({ sessionToken, id: questId });
            await Promise.resolve(onAccountUpdated());
          }
          setCustomDetailId(null);
        } : undefined}
        onCheck={async (questId, gameId) => {
          if (!authBridge.isSignedIn) throw new Error("Sign in first to check custom Side Quest proof.");
          const sessionToken = await authBridge.getSessionToken();
          await runMobileQuestAction({ sessionToken, action: gameId ? "submit" : "check", challengeId: questId, gameId });
          const nextAccount = await Promise.resolve(onAccountUpdated());
          const coercedAccount = coerceAccountResponse(nextAccount);
          const refreshedReceipt = isAuthenticatedAccount(coercedAccount) && coercedAccount.latestReceipt?.challengeId === questId ? coercedAccount.latestReceipt : null;
          return getCheckActionMessage(refreshedReceipt);
        }}
        onReset={async (questId) => {
          if (!authBridge.isSignedIn) throw new Error("Sign in first to deactivate this custom Side Quest.");
          const sessionToken = await authBridge.getSessionToken();
          const result = await runMobileQuestAction({ sessionToken, action: "deactivate", challengeId: questId });
          await Promise.resolve(onAccountUpdated());
          return result.message;
        }}
        onSaveState={customDetailOwned ? async (quest, next) => {
          if (!authBridge.isSignedIn) {
            setCustomDrafts((current) => current.map((draft) => draft.id === quest.id ? { ...draft, lifecycle: next.lifecycle ?? draft.lifecycle, visibility: next.visibility ?? draft.visibility } : draft));
            return;
          }
          const sessionToken = await authBridge.getSessionToken();
          await saveMobileCustomSideQuest({ sessionToken, id: quest.id, title: quest.name, summary: quest.summary, config: quest.config, lifecycle: next.lifecycle ?? quest.lifecycle ?? "published", visibility: next.visibility ?? quest.visibility ?? "private" });
          await Promise.resolve(onAccountUpdated());
          Alert.alert("Custom Side Quest updated", getCustomStateSavedMessage(quest.name, next));
        } : undefined}
        onViewResult={customDetailCompletedQuest ? () => {
          setCompletedDetailId(customDetailCompletedQuest.id);
          setCustomDetailId(null);
        } : undefined}
        onReport={!customDetailOwned && customDetailDraft?.visibility === "public" ? openCommunityReport : undefined}
        onViewCreator={customDetailDraft?.visibility === "public" ? openCommunityCreatorShelf : undefined}
        onUseInMultiplayer={customDetailDraft && (customDetailDraft.lifecycle ?? "published") === "published" ? (quest) => {
          setCustomDetailId(null);
          onOpenMultiplayerCreate(quest.id);
        } : undefined}
      />

      <HelpSupportModal key={communityReportMessage || "community-report"} visible={communityReportOpen} onClose={() => setCommunityReportOpen(false)} signedIn={signedIn} authBridge={authBridge} initialMessage={communityReportMessage} />

      <Modal visible={customCreateOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => { setCustomCreateOpen(false); setCustomEditingQuestId(null); }}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close custom Side Quest builder" style={compactStyles.detailCloseButton} onPress={() => { setCustomCreateOpen(false); setCustomEditingQuestId(null); }}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={compactStyles.multiplayerDetailHero}>
              <Image source={getCustomQuestImageSource(null)} style={compactStyles.multiplayerDetailSeal} resizeMode="contain" />
              <Text style={compactStyles.multiplayerDetailKicker}>Custom Side Quest</Text>
              <Text style={compactStyles.detailTitle}>{customEditingQuestId ? "Edit your Side Quest." : "Build your Side Quest."}</Text>
              <Text style={compactStyles.detailGoal}>{customEditingQuestId ? "Update the name, rules, and publish state without rebuilding from scratch." : "Choose what should happen in a real game. SQC will check it after you play."}</Text>
            </View>
            <View style={compactStyles.multiplayerNativeCard}>
              <Text style={styles.inputLabel}>Side Quest name</Text>
              <TextInput value={customQuestName} placeholder="Name this custom Side Quest" placeholderTextColor="rgba(255,247,232,.42)" style={styles.textInput} onChangeText={setCustomQuestName} />
              <Text style={styles.microcopy}>Saved Side Quests appear in your library and can be used for Solo or Multiplayer.</Text>
              <View style={compactStyles.customCoatPreviewRow}>
                <Image source={{ uri: absoluteAssetUrl(getSingleCustomQuestBadgePath(customBadgePreviewUrl)) }} style={compactStyles.customCoatPreviewImage} resizeMode="contain" />
                <View style={compactStyles.customCoatPreviewCopy}>
                  <Text style={compactStyles.multiplayerRuleLabel}>Side Quest Coat of Arms</Text>
                  <Text style={styles.microcopy}>This is the Coat of Arms players unlock when this Side Quest is completed.</Text>
                </View>
              </View>
              <Text style={compactStyles.multiplayerCardEyebrow}>How to complete it</Text>
              <Text style={compactStyles.multiplayerCardTitle}>What must happen?</Text>
              <Text style={styles.microcopy}>Add one or more conditions. SQC checks them against your next public game. Public means the game is visible on your connected chess account.</Text>
              <Text style={compactStyles.multiplayerRuleLabel}>If you add several conditions, how should they count?</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {CUSTOM_RULE_LOGICS.map((logic) => {
                  const selected = customRuleLogic === logic;
                  return (
                    <Pressable key={logic} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleLogic(logic)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{logic === "all" ? "Complete every condition" : "Complete any one condition"}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{logic === "all" ? "All selected conditions must happen. You can change this later." : "One selected condition is enough. You can change this later."}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={compactStyles.multiplayerRuleRow}>
                <Text style={compactStyles.multiplayerRuleLabel}>Your conditions</Text>
                <Text style={compactStyles.multiplayerRuleValue}>{customRequirements.length ? `${customRequirements.length} saved. They can happen in any order.` : "No conditions yet. Add the first thing players must do."}</Text>
                {!customRequirements.length && !customConditionEditorOpen ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Add first custom Side Quest condition" style={compactStyles.detailPrimaryButton} onPress={openNewCustomRequirement}>
                    <Text style={compactStyles.detailPrimaryButtonText}>Add Condition</Text>
                  </Pressable>
                ) : null}
              </View>
              {customRequirements.length ? (
                <View style={compactStyles.appRows}>
                  {customRequirements.map((requirement, index) => (
                    <View key={requirement.id} style={compactStyles.customConditionListRow}>
                      <View style={compactStyles.currentQuestRow}>
                        <View style={compactStyles.coatMarker}>
                          <Text style={compactStyles.customConditionIndex}>{index + 1}</Text>
                        </View>
                        <View style={compactStyles.currentQuestText}>
                          <Text style={compactStyles.currentQuestTitle}>{getCustomConditionLabel(index)}</Text>
                          <Text style={compactStyles.currentQuestMeta}>{buildCustomPieceRuleSummary(requirement)}</Text>
                        </View>
                      </View>
                      <View style={compactStyles.actionRowTight}>
                        <Pressable accessibilityRole="button" accessibilityLabel="Edit saved condition" style={compactStyles.secondaryAction} onPress={() => editCustomRequirement(requirement)}>
                          <Text style={compactStyles.secondaryActionText}>Edit</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" accessibilityLabel="Duplicate saved condition" style={compactStyles.secondaryAction} onPress={() => duplicateCustomRequirement(requirement)}>
                          <Text style={compactStyles.secondaryActionText}>Duplicate</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" accessibilityLabel="Delete saved condition" style={compactStyles.secondaryAction} onPress={() => removeCustomRequirement(requirement.id)}>
                          <Text style={compactStyles.secondaryActionText}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
              {!customConditionEditorOpen && customRequirements.length ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Add custom Side Quest condition" style={compactStyles.detailSecondaryButton} onPress={openNewCustomRequirement}>
                  <Text style={compactStyles.detailSecondaryButtonText}>Add Another Condition</Text>
                </Pressable>
              ) : customConditionEditorOpen ? (
                <View>
                  <Text style={compactStyles.multiplayerCardEyebrow}>Condition editor</Text>
                  <Text style={compactStyles.multiplayerCardTitle}>{customEditingRequirementId ? "Edit condition" : "New condition"}</Text>
                  <Text style={styles.microcopy}>You can tap Save Condition, or publish/save the Side Quest directly and SQC will include this open condition if it is valid.</Text>
                  <Text style={compactStyles.multiplayerRuleLabel}>Condition type</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    {CUSTOM_RULE_CONDITIONS.map((condition) => {
                      const selected = customRuleCondition === condition;
                      const copy = getCustomConditionTypeCopy(condition);
                      return (
                        <Pressable key={condition} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => { setCustomRuleCondition(condition); if (condition === "on square") setCustomRuleTiming("at move"); if (condition === "game result") setCustomRuleResult("win"); }}>
                          <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                          <View style={compactStyles.multiplayerOptionCopy}>
                            <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{copy.title}</Text>
                            <Text style={compactStyles.multiplayerOptionHelper}>{copy.helper}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  {customConditionUsesPiece(customRuleCondition) ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Piece</Text>
                      <View style={compactStyles.multiplayerOptionGrid}>
                    {CUSTOM_RULE_PIECES.map((piece) => {
                      const selected = customRulePiece === piece;
                      const identityChoices = getCustomPieceIdentityChoices(piece);
                      return (
                        <View key={piece} style={selected ? compactStyles.customPieceChoiceGroupSelected : compactStyles.customPieceChoiceGroup}>
                          <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => { setCustomRulePiece(piece); setCustomRuleCount((current) => normalizeCustomRuleCount(piece, current)); setCustomRuleIdentity((current) => normalizeCustomPieceIdentity(piece, current)); if (getCustomPieceMaxCount(piece) === 1) setCustomRuleQuantifier("any one"); }}>
                            <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                            <View style={compactStyles.multiplayerOptionCopy}>
                              <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{titleCaseRuleValue(piece)}</Text>
                              {piece === "king" || piece === "queen" ? <Text style={compactStyles.multiplayerOptionHelper}>Only one exists, so there is no “which one” choice.</Text> : null}
                            </View>
                          </Pressable>
                          {selected && identityChoices.length ? (
                            <View style={compactStyles.customPieceSubchoicePanel}>
                              <Text style={compactStyles.customPieceSubchoiceLabel}>Which {piece}</Text>
                              <View style={compactStyles.multiplayerOptionGrid}>
                                {identityChoices.map((choice) => {
                                  const choiceSelected = isCustomPieceIdentityChoiceSelected(piece, customRuleIdentity, customRuleQuantifier, choice);
                                  return (
                                    <Pressable key={choice.id} accessibilityRole="button" accessibilityState={{ selected: choiceSelected }} style={[compactStyles.multiplayerOptionCard, choiceSelected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => { setCustomRuleIdentity(choice.identity); setCustomRuleCount((current) => normalizeCustomRuleCount(piece, current)); if (choice.quantifier) setCustomRuleQuantifier(choice.quantifier); else if (choice.id === "any") setCustomRuleQuantifier("any one"); }}>
                                      <View style={[compactStyles.multiplayerOptionDot, choiceSelected ? compactStyles.multiplayerOptionDotSelected : null]} />
                                      <View style={compactStyles.multiplayerOptionCopy}>
                                        <Text style={choiceSelected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{choice.label}</Text>
                                        <Text style={compactStyles.multiplayerOptionHelper}>{choice.helper}</Text>
                                      </View>
                                    </Pressable>
                                  );
                                })}
                              </View>
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                  {customPieceNeedsIdentityChoice(customRulePiece) && normalizeCustomPieceIdentity(customRulePiece, customRuleIdentity) !== "any" ? (
                    <Text style={styles.microcopy}>A specific starting piece is selected, so quantity is fixed to that one piece.</Text>
                  ) : null}
                  <Text style={compactStyles.multiplayerRuleLabel}>Whose piece</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    {CUSTOM_RULE_OWNERS.map((owner) => {
                      const selected = customRuleOwner === owner;
                      return (
                        <Pressable key={owner} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleOwner(owner)}>
                          <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                          <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{owner === "my" ? "Mine" : "Opponent's"}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                    </View>
                  ) : (
                    <Text style={styles.microcopy}>This condition applies to the move list, not to a specific piece.</Text>
                  )}
                  {customRuleCondition === "on square" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Square</Text>
                      <TextInput value={customRuleTargetSquare} placeholder="e4" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" maxLength={2} style={styles.textInput} onChangeText={setCustomRuleTargetSquare} />
                      <Text style={styles.microcopy}>Use algebraic board squares like e4, h8, or a1.</Text>
                    </View>
                  ) : null}
                  {customRuleCondition === "move sequence" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Move sequence</Text>
                      <TextInput value={customRuleMoveSequence} placeholder="e4 e5 Nf3 Nc6" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" multiline style={[styles.textInput, styles.textAreaInput]} onChangeText={(value) => setCustomRuleMoveSequence(normalizeCustomMoveSequence(value))} />
                      <Text style={styles.microcopy}>Enter algebraic moves in order, for example e4 e5 Nf3 Nc6. Timing decides when the sequence must be complete or appear.</Text>
                    </View>
                  ) : null}
                  {customRuleCondition === "opening sequence" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Opening sequence</Text>
                      <TextInput value={customRuleOpeningSequence} placeholder="1.e4 e5 2.f4" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" multiline style={[styles.textInput, styles.textAreaInput]} onChangeText={(value) => setCustomRuleOpeningSequence(value.slice(0, 260))} onEndEditing={() => setCustomRuleOpeningSequence((current) => normalizeCustomOpeningSequence(current) || "1.e4 e5 2.f4")} />
                      <Text style={styles.microcopy}>Paste opening notation with move numbers. SQC cleans it into: {getCustomOpeningPreview(customRuleOpeningSequence)}</Text>
                    </View>
                  ) : null}
                  {customRuleCondition === "game result" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Result</Text>
                      <View style={compactStyles.multiplayerOptionGrid}>
                        {CUSTOM_RULE_RESULTS.map((result) => {
                          const selected = customRuleResult === result;
                          return (
                            <Pressable key={result} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleResult(result)}>
                              <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                              <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{titleCaseRuleValue(result)}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Text style={styles.microcopy}>Result is checked from your linked chess account’s perspective.</Text>
                    </View>
                  ) : null}
                  {customRuleCondition !== "opening sequence" && customRuleCondition !== "game result" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Timing</Text>
                      <View style={compactStyles.multiplayerOptionGrid}>
                        {CUSTOM_RULE_TIMINGS.map((timing) => {
                          const selected = customRuleTiming === timing;
                          const needsMoveNumber = selected && (timing === "by move" || timing === "at move");
                          return (
                            <View key={timing} style={[compactStyles.multiplayerOptionCard, compactStyles.customTimingChoiceCard, selected ? compactStyles.multiplayerOptionCardSelected : null]}>
                              <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={compactStyles.customTimingChoiceHeader} onPress={() => setCustomRuleTiming(timing)}>
                                <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                                <View style={compactStyles.multiplayerOptionCopy}>
                                  <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{titleCaseRuleValue(timing)}</Text>
                                  {needsMoveNumber ? <Text style={compactStyles.multiplayerOptionHelper}>Choose the move number for this timing.</Text> : null}
                                </View>
                              </Pressable>
                              {needsMoveNumber ? (
                                <View style={compactStyles.customTimingNestedInput}>
                                  <Text style={compactStyles.customPieceSubchoiceLabel}>Move number</Text>
                                  <TextInput value={customRuleMoveNumber} placeholder="15" placeholderTextColor="rgba(255,247,232,.42)" keyboardType="number-pad" inputMode="numeric" maxLength={3} style={styles.textInput} onChangeText={(value) => setCustomRuleMoveNumber(formatCustomMoveNumberInput(value))} onEndEditing={() => setCustomRuleMoveNumber((current) => current || "1")} />
                                </View>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.microcopy}>{customRuleCondition === "game result" ? "Game result is checked at the end, so no timing is needed." : "Opening sequence is always checked from move 1, so no timing is needed."}</Text>
                  )}
                  <Text style={compactStyles.multiplayerRuleLabel}>Pass when this condition is</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    <Pressable accessibilityRole="button" accessibilityState={{ selected: !customRuleNegated }} style={[compactStyles.multiplayerOptionCard, !customRuleNegated ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleNegated(false)}>
                      <View style={[compactStyles.multiplayerOptionDot, !customRuleNegated ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={!customRuleNegated ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>True</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>Use for “my rook must be on e4”.</Text>
                      </View>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityState={{ selected: customRuleNegated }} style={[compactStyles.multiplayerOptionCard, customRuleNegated ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleNegated(true)}>
                      <View style={[compactStyles.multiplayerOptionDot, customRuleNegated ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={customRuleNegated ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>False / must not happen</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>Use for “my rook must not be on e4”.</Text>
                      </View>
                    </Pressable>
                  </View>
                  <View style={compactStyles.multiplayerRuleRow}>
                    <Text style={compactStyles.multiplayerRuleLabel}>Condition preview</Text>
                    <Text style={compactStyles.multiplayerRuleValue}>{buildCustomPieceRuleSummary(currentCustomRequirement)}</Text>
                  </View>
                  <View style={compactStyles.multiplayerFooterActions}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Save current condition" style={compactStyles.detailSecondaryButton} onPress={saveCustomRequirement}>
                      <Text style={compactStyles.detailSecondaryButtonText}>{customEditingRequirementId ? "Update Condition" : "Save Condition"}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel="Cancel condition editing" style={compactStyles.detailQuietButton} onPress={() => { setCustomEditingRequirementId(null); setCustomConditionEditorOpen(false); }}>
                      <Text style={compactStyles.detailQuietButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <View style={compactStyles.multiplayerRuleRow}>
                <Text style={compactStyles.multiplayerRuleLabel}>Rule preview</Text>
                <Text style={compactStyles.multiplayerRuleValue}>{customRuleSummary}</Text>
              </View>
              <Text style={compactStyles.multiplayerRuleLabel}>Publish visibility</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {(["private", "public"] as const).map((visibility) => {
                  const selected = customPublishVisibility === visibility;
                  return (
                    <Pressable key={visibility} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomPublishVisibility(visibility)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{visibility === "public" ? "Public Community" : "Private Library"}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{visibility === "public" ? "Appears in Community Discover and can be picked by other players." : "Only you can pick it or use it in hosted Multiplayer Side Quests."}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Save custom Side Quest" accessibilityState={{ disabled: !canPublishCustomQuest }} style={[compactStyles.detailPrimaryButton, !canPublishCustomQuest && compactStyles.detailPrimaryButtonDisabled]} disabled={!canPublishCustomQuest} onPress={() => void saveCustomDraft("published")}>
                <Text style={compactStyles.detailPrimaryButtonText}>{canPublishCustomQuest ? customEditingQuestId ? "Save Side Quest Updates" : (customPublishVisibility === "public" ? "Publish to Community" : "Publish Private Side Quest") : "Add Condition to Publish"}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Save custom Side Quest draft" style={compactStyles.detailSecondaryButton} onPress={() => void saveCustomDraft("draft")}>
                <Text style={compactStyles.detailSecondaryButtonText}>{customEditingQuestId ? "Save as Draft" : "Save Draft"}</Text>
              </Pressable>
            </View>
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={Boolean(detailChallenge)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setDetailChallengeId(null)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <GradientBackdrop challenge={detailChallenge} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close Side Quest details" style={compactStyles.detailCloseButton} onPress={() => setDetailChallengeId(null)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            {detailChallenge ? <SelectedQuestDetailCard challenge={detailChallenge} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} /> : null}
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={Boolean(completedQuestRecord && completedDetailChallenge)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setCompletedDetailId(null)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <GradientBackdrop challenge={completedDetailChallenge} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close completed Side Quest proof" style={compactStyles.detailCloseButton} onPress={() => setCompletedDetailId(null)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            {completedQuestRecord && completedDetailChallenge ? (
              <CompletedQuestProofCard
                challenge={completedDetailChallenge}
                completedQuest={completedQuestRecord}
                authBridge={authBridge}
                onAccountUpdated={onAccountUpdated}
              />
            ) : null}
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function CoatBoardDashboard({ bootstrap, account, onOpenChallengeDetail, onClose }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; onOpenChallengeDetail: (challengeId: string) => void; onClose: () => void }) {
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const earnedIds = new Set(signedIn?.progress.completedChallengeIds ?? []);
  const multiplayerTrophies = signedIn?.multiplayerTrophies ?? [];
  const unlockedCount = earnedIds.size + multiplayerTrophies.length;

  return (
    <View style={compactStyles.stack}>
      <View style={compactStyles.coatBoardCloseRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close Browse Coat of Arms" style={compactStyles.coatBoardCloseButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={22} color={colors.paper} />
        </Pressable>
      </View>
      <View style={compactStyles.coatBoardHeroEmblemWrap}>
        <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.coatBoardHeroEmblem} resizeMode="contain" />
      </View>
      <View style={compactStyles.multiplayerNativeCard} accessibilityLabel="Trophy Cabinet summary">
        <Text style={compactStyles.multiplayerCardEyebrow}>Trophy Cabinet</Text>
        <Text style={compactStyles.multiplayerCardTitle}>{signedIn ? `${unlockedCount} unlocked item${unlockedCount === 1 ? "" : "s"}.` : "Sign in to sync your cabinet."}</Text>
        <Text style={styles.microcopy}>Solo Coat of Arms and Multiplayer podium scrolls live together here, so the app stands alone as your complete SQC trophy shelf.</Text>
      </View>
      {multiplayerTrophies.length ? (
        <View style={compactStyles.multiplayerNativeCard} accessibilityLabel="Multiplayer podium scrolls">
          <Text style={compactStyles.multiplayerCardEyebrow}>Multiplayer podium scrolls</Text>
          <Text style={compactStyles.multiplayerCardTitle}>Completed Multiplayer Side Quests.</Text>
          <View style={compactStyles.appRows}>
            {multiplayerTrophies.map((trophy) => (
              <AppRow
                key={trophy.id}
                title={trophy.title}
                meta={`Multiplayer podium · ${trophy.rankLabel}${trophy.completedAt ? ` · ${formatAccountDate(trophy.completedAt)}` : ""}`}
                status={trophy.placement}
                imageSource={SQC_MULTIPLAYER_SEAL_ASSET}
                variant="seal"
                statusImageSource={getMultiplayerTrophySealSource(trophy.placement)}
                onPress={() => Alert.alert("Multiplayer podium scroll", `${trophy.title}\n${trophy.rankLabel}\n\nOpen Multiplayer Side Quests to inspect the full leaderboard and receipt context.`)}
              />
            ))}
          </View>
          <Text style={styles.microcopy}>These are account trophy records only; private player/account details stay out of the cabinet.</Text>
        </View>
      ) : null}
      <View style={compactStyles.coatGrid}>
        {bootstrap.challenges.map((challenge) => (
          <Pressable key={challenge.id} accessibilityRole="button" style={compactStyles.coatTile} onPress={() => onOpenChallengeDetail(challenge.id)}>
            <Image source={{ uri: getChallengeCoatImageUrl(challenge) ?? absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") }} style={[compactStyles.coatTileImage, !earnedIds.has(challenge.id) && compactStyles.coatTileLocked]} resizeMode="contain" />
            <Text style={compactStyles.coatTileTitle} numberOfLines={2}>{challenge.title}</Text>
            {earnedIds.has(challenge.id) ? <Text style={compactStyles.earnedText}>Unlocked</Text> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AccountTrackerDashboard({ bootstrap, account, authBridge, onSelectTab, onSelectChallenge, onOpenCompletedQuestDetail, onAccountUpdated }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; authBridge: MobileAuthBridge; onSelectTab: (tab: AppTab) => void; onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void; onOpenChallengeDetail: (challengeId: string) => void; onOpenCompletedQuestDetail: (challengeId: string) => void; onAccountUpdated: AccountUpdatedCallback }) {
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const [helpOpen, setHelpOpen] = useState(false);
  if (!signedIn) {
    return (
      <View style={compactStyles.stack}>
        <View style={compactStyles.heroPanel}>
          <View style={compactStyles.topLine}>
            <Text style={compactStyles.kicker}>My SQC</Text>
          </View>
          <Text style={compactStyles.heroTitle}>Sign in to sync your board.</Text>
          <Text style={compactStyles.heroCopy}>Sign in to save Side Quest progress, latest proof, Coat of Arms unlocks, and connected chess usernames.</Text>
          <Pressable accessibilityRole="button" style={compactStyles.goldButton} onPress={() => authBridge.startGoogleSignIn ? void authBridge.startGoogleSignIn() : showNativeOnlyNotice("Sign-in is unavailable right now.")}>
            <Text style={compactStyles.goldButtonText}>Sign in</Text>
          </Pressable>
        </View>
        <AccountHelpSupportSection onOpenHelp={() => setHelpOpen(true)} />
        <HelpSupportModal visible={helpOpen} onClose={() => setHelpOpen(false)} signedIn={null} authBridge={authBridge} />
      </View>
    );
  }

  const accountState = signedIn;

  async function handleLogOut() {
    if (!authBridge.signOut) {
      Alert.alert("Log out", "Log out is unavailable right now.");
      return;
    }

    await authBridge.signOut();
    onSelectTab("home");
  }

  return (
    <View style={compactStyles.stack}>
      <View style={compactStyles.heroPanel}>
        <View style={compactStyles.topLine}>
          <Text style={compactStyles.kicker}>My SQC</Text>
        </View>
        <View style={compactStyles.accountIdentityCard}>
          <View style={compactStyles.accountIdentityAvatar}>
            {accountState.profile.imageUrl ? (
              <Image source={{ uri: accountState.profile.imageUrl }} style={compactStyles.accountIdentityAvatarImage} resizeMode="cover" />
            ) : (
              <Text style={compactStyles.accountIdentityAvatarText}>{accountState.profile.displayName.slice(0, 1).toUpperCase()}</Text>
            )}
          </View>
          <View style={compactStyles.accountIdentityCopy}>
            <View style={compactStyles.accountNameRow}>
              <Text style={[compactStyles.heroTitle, compactStyles.accountNameTitle]} numberOfLines={1}>{accountState.profile.displayName}</Text>
              <Text style={compactStyles.livePill}>Synced</Text>
            </View>
            {accountState.profile.email ? <Text style={compactStyles.accountInfoText}>{accountState.profile.email}</Text> : null}
            <Text style={compactStyles.accountInfoText}>Last login: {formatAccountDate(accountState.profile.lastSignInAt)}</Text>
          </View>
        </View>
        <Text style={compactStyles.heroCopy}>{accountState.chessAccounts.hasAny ? "Proof checks ready. SQC can read your public Lichess / Chess.com games." : "Add a public chess username before checking Side Quest proof."}</Text>
        <View style={compactStyles.readinessRow}>
          <ReadinessChip label="Lichess" value={accountState.chessAccounts.lichessUsername} />
          <ReadinessChip label="Chess.com" value={accountState.chessAccounts.chessComUsername} />
        </View>
      </View>
      <ChessUsernameEditor account={accountState} authBridge={authBridge} onSaved={onAccountUpdated} />
      <AccountSoloSideQuestSection account={accountState} bootstrap={bootstrap} onSelectTab={onSelectTab} onSelectChallenge={onSelectChallenge} />
      <AccountProgressStatsSection account={accountState} onSelectTab={onSelectTab} />
      <AccountTrophyList account={accountState} onSelectTab={onSelectTab} onOpenCompletedQuestDetail={onOpenCompletedQuestDetail} />
      <AccountHelpSupportSection onOpenHelp={() => setHelpOpen(true)} />
      <HelpSupportModal visible={helpOpen} onClose={() => setHelpOpen(false)} signedIn={accountState} authBridge={authBridge} />
      <Pressable accessibilityRole="button" accessibilityLabel="Log out" style={compactStyles.logoutButton} onPress={() => void handleLogOut()}>
        <Text style={compactStyles.logoutButtonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

function AccountSoloSideQuestSection({
  account,
  bootstrap,
  onSelectTab,
  onSelectChallenge,
}: {
  account: Extract<MobileAccountResponse, { authenticated: true }>;
  bootstrap: MobileBootstrap;
  onSelectTab: (tab: AppTab) => void;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  const activeOfficialChallenge = account.activeQuest?.id ? bootstrap.challenges.find((challenge) => challenge.id === account.activeQuest?.id) ?? null : null;
  const activeCustomQuest = account.activeQuest?.id ? [...(account.customSideQuests ?? []), ...(account.communitySideQuests ?? [])].find((quest) => quest.id === account.activeQuest?.id) ?? null : null;
  const activeChallenge = activeOfficialChallenge ?? (account.activeQuest ? buildCustomActiveChallenge(account.activeQuest, activeCustomQuest) : null);
  const activeQuestReceipt = account.latestReceipt?.challengeId === account.activeQuest?.id ? account.latestReceipt : null;
  const latestCheckText = activeQuestReceipt?.headline ? normalizeCheckHeadline(activeQuestReceipt.headline) : null;
  const latestCheckPassed = Boolean(latestCheckText?.toLowerCase().includes("passed"));
  const soloStatus = account.activeQuest?.completed || latestCheckPassed ? "Completed" : account.activeQuest ? "Active" : "None";
  const soloTitle = account.activeQuest?.title ?? "Choose a Solo Side Quest";
  const soloMeta = account.activeQuest
    ? `${activeChallenge?.objective ?? activeChallenge?.proofCallout ?? "Waiting for your next public game."} · ${getProofCheckDisplay(formatLatestCheckTime(activeQuestReceipt?.checkedAt ?? account.activeQuest.verifiedAt), activeQuestReceipt)}`
    : "Pick one Side Quest to judge against your next public game.";
  const hostedMultiplayer = account.activeGroupQuests.filter((quest) => quest.isOwner).length;
  const joinedMultiplayer = account.activeGroupQuests.length - hostedMultiplayer;
  const multiplayerStatus = account.activeGroupQuests.length ? `${account.activeGroupQuests.length} active` : "Open";
  const multiplayerMeta = account.activeGroupQuests.length
    ? `${hostedMultiplayer} hosted · ${joinedMultiplayer} joined`
    : "Join or create a Multiplayer Side Quest.";
  const customQuests = account.customSideQuests ?? [];
  const publishedCustom = customQuests.filter((quest) => quest.lifecycle !== "archived" && quest.lifecycle !== "draft").length;
  const draftCustom = customQuests.filter((quest) => quest.lifecycle === "draft").length;
  const customMeta = customQuests.length
    ? `${publishedCustom} playable · ${draftCustom} draft${draftCustom === 1 ? "" : "s"} · private by default`
    : "Build a private custom Side Quest for solo or multiplayer use.";

  return (
    <AppSection title="Side Quests" action="Open" onAction={() => onSelectTab("sideQuests")}>
      <AppRow
        title={`Solo: ${soloTitle}`}
        meta={soloMeta}
        status={soloStatus}
        imageSource={activeChallenge ? getChallengeCoatImageSource(activeChallenge) : SQC_COAT_OF_ARMS_ASSET}
        glowSource={activeChallenge ? getChallengeCoatGlowSource(activeChallenge.id) : null}
        glowColor={getSafeBadgeColors(activeChallenge).glow}
        overlaySeal={account.activeQuest?.completed || latestCheckPassed}
        onPress={() => account.activeQuest?.id ? onSelectChallenge(account.activeQuest.id, "sideQuests") : onSelectTab("sideQuests")}
      />
      <AppRow
        title="Multiplayer Side Quests"
        meta={multiplayerMeta}
        status={multiplayerStatus}
        imageSource={SQC_MULTIPLAYER_SEAL_ASSET}
        variant="seal"
        onPress={() => onSelectTab("multiplayerSideQuests")}
      />
      <AppRow
        title="Custom Side Quests"
        meta={customMeta}
        status={customQuests.length ? `${customQuests.length} made` : "Create"}
        imageSource={getCustomQuestImageSource(null)}
        variant="seal"
        onPress={() => onSelectTab("sideQuests")}
      />
    </AppSection>
  );
}

function AccountProgressStatsSection({ account, onSelectTab }: { account: Extract<MobileAccountResponse, { authenticated: true }>; onSelectTab: (tab: AppTab) => void }) {
  const completedCount = account.completedQuests.length;
  const multiplayerTrophyCount = account.multiplayerTrophies?.length ?? 0;
  const customQuests = account.customSideQuests ?? [];
  const customTries = customQuests.reduce((sum, quest) => sum + (quest.stats?.soloAttempts ?? 0) + (quest.stats?.multiplayerAttempts ?? 0), 0);
  const customWins = customQuests.reduce((sum, quest) => sum + (quest.stats?.soloCompletions ?? 0) + (quest.stats?.multiplayerFulfillments ?? 0), 0);
  const proofCount = account.progress.proofReceiptCount;

  return (
    <AppSection title="Progress & Stats" action="Details" onAction={() => onSelectTab("coatOfArms")}>
      <View style={compactStyles.statsPanel}>
        <View style={compactStyles.metricGrid}>
          <CompactMetric label="Completed" value={`${completedCount}`} />
          <CompactMetric label="Proofs" value={`${proofCount}`} />
          <CompactMetric label="Coat of Arms" value={`${completedCount + multiplayerTrophyCount}`} />
        </View>
        <Text style={compactStyles.micro}>Custom Side Quests: {customQuests.length} made · {customTries} tries · {customWins} wins</Text>
      </View>
    </AppSection>
  );
}

function AccountTrophyList({ account, onSelectTab, onOpenCompletedQuestDetail }: { account: Extract<MobileAccountResponse, { authenticated: true }>; onSelectTab: (tab: AppTab) => void; onOpenCompletedQuestDetail: (challengeId: string) => void }) {
  const trophies = account.multiplayerTrophies ?? [];
  const completedQuests = account.completedQuests ?? [];
  const hasAnyTrophies = trophies.length > 0 || completedQuests.length > 0;

  return (
    <AppSection title="Trophy Cabinet" action="Browse Coat of Arms" onAction={() => onSelectTab("coatOfArms")}>
      {trophies.slice(0, 4).map((trophy) => (
        <AppRow
          key={`multiplayer-${trophy.id}`}
          title={trophy.title}
          meta={`Multiplayer trophy · ${trophy.rankLabel}`}
          status={undefined}
          statusImageSource={getMultiplayerTrophySealSource(trophy.placement)}
          imageSource={SQC_MULTIPLAYER_SEAL_ASSET}
          variant="seal"
          onPress={() => Alert.alert("Multiplayer trophy", `${trophy.title}\n${trophy.rankLabel}\n\nThis trophy stays in the app.`)}
        />
      ))}
      {completedQuests.slice(0, 5).map((quest) => (
        <View key={`solo-${quest.id}`} style={compactStyles.trophyProofStack}>
          <AppRow
            title={cleanMultiplayerTitle(quest.title)}
            meta={`Coat of Arms: ${quest.badgeName}`}
            status={undefined}
            statusImageSource={SQC_COMPLETED_RED_SEAL_ASSET}
            imageSource={getRowImageSource(quest.badgeImageUrl)}
            onPress={() => onOpenCompletedQuestDetail(quest.id)}
          />
          <VictoryProofBoard proof={quest} />
        </View>
      ))}
      {!hasAnyTrophies ? (
        <AppRow title="No trophies yet" meta="Complete a Side Quest to unlock your first Coat of Arms." onPress={() => onSelectTab("sideQuests")} />
      ) : null}
    </AppSection>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={compactStyles.metricBox}>
      <Text style={compactStyles.metricValue}>{value}</Text>
      <Text style={compactStyles.metricLabel}>{label}</Text>
    </View>
  );
}

function CompactStatusRow({ label, title, meta, onPress }: { label: string; title: string; meta: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.statusRow} onPress={onPress}>
      <Text style={compactStyles.rowLabel}>{label}</Text>
      <View style={compactStyles.rowCopy}>
        <Text style={compactStyles.rowTitle} numberOfLines={1}>{title}</Text>
        <Text style={compactStyles.rowMeta} numberOfLines={1}>{meta}</Text>
      </View>
      <Text style={compactStyles.chevron}>›</Text>
    </Pressable>
  );
}

function CompactQuestRow({ challenge, active, completed, onPress }: { challenge: MobileChallenge; active: boolean; completed: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.questRow} onPress={onPress}>
      <Image source={{ uri: getChallengeCoatImageUrl(challenge) ?? absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") }} style={compactStyles.questIcon} resizeMode="contain" />
      <View style={compactStyles.rowCopy}>
        <Text style={compactStyles.rowTitle} numberOfLines={1}>{challenge.title}</Text>
        <Text style={compactStyles.rowMeta} numberOfLines={1}>{challenge.objective}</Text>
      </View>
      <View style={compactStyles.questPill}>
        <Text style={compactStyles.questPillText}>{completed ? "Done" : active ? "Now" : "Coat"}</Text>
      </View>
    </Pressable>
  );
}
function HomeScreen({
  bootstrap,
  account,
  onSelectTab,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  onSelectTab: (tab: AppTab) => void;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const isSignedIn = Boolean(signedInAccount);
  const completedChallengeIds = new Set(signedInAccount?.progress.completedChallengeIds ?? []);
  const randomChallengePool = bootstrap.challenges.filter((challenge) => challenge.id !== signedInAccount?.activeQuest?.id && !completedChallengeIds.has(challenge.id));
  const randomFallbackPool = randomChallengePool.length > 0 ? randomChallengePool : bootstrap.challenges;
  const handleRandomSoloQuest = () => {
    if (randomFallbackPool.length === 0) return;

    const challenge = randomFallbackPool[Math.floor(Math.random() * randomFallbackPool.length)];
    onSelectChallenge(challenge.id, "sideQuests");
  };
  const heroismChoices = [
    {
      label: "Cautiously heroic",
      copy: "I want chaos, but survivable.",
      cta: "Start with Knights Before Coffee",
      challengeId: "knights-before-coffee",
    },
    {
      label: "Recklessly meaningful",
      copy: "I can handle one objectively bad idea.",
      cta: "Try No Castle Club",
      challengeId: "no-castle-club",
    },
    {
      label: "Historically unwise",
      copy: "I am here to become a cautionary tale.",
      cta: "Lose the queen, win anyway",
      challengeId: "queen-never-heard-of-her",
    },
  ]
    .map((option) => {
      const challenge = bootstrap.challenges.find((candidate) => candidate.id === option.challengeId);
      return challenge ? { ...option, challenge } : null;
    })
    .filter((entry): entry is { label: string; copy: string; cta: string; challengeId: string; challenge: MobileChallenge } => Boolean(entry));

  return (
    <View style={styles.screenStack}>
      <View style={styles.homeHeroCard}>
        <CardGradientGlows />
        <Text style={styles.homeHeroTitle}>Chess, but with stupidly hard side quests.</Text>
        <Text style={styles.homeHeroBody}>
          {isSignedIn
            ? "Pick a Solo Side Quest or join a Multiplayer Side Quest, play a real Lichess or Chess.com game, then come back for automatic proof."
            : "Sign in, connect your public chess usernames, choose one ridiculous Solo Side Quest or Multiplayer Side Quest, play on Lichess or Chess.com and let SQC check your latest public games."}
        </Text>
        <View style={styles.homeHeroActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go on a Solo Side Quest" testID="home-go-solo-side-quest" style={styles.primaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
            <Text style={styles.primaryButtonText}>Go on a <Text style={styles.buttonEmphasis}>Solo</Text> Side Quest</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Join a Multiplayer Side Quest" testID="home-join-multiplayer-side-quest" style={styles.secondaryButtonWide} onPress={() => onSelectTab("multiplayerSideQuests")}>
            <Text style={styles.secondaryButtonText}>Join a <Text style={styles.buttonEmphasis}>Multiplayer</Text> Side Quest</Text>
          </Pressable>
        </View>
        <View style={styles.homeRitualStrip} accessibilityLabel="Side Quest Chess workflow">
          <Text style={styles.homeRitualStep}>Pick</Text>
          <Text style={styles.homeRitualArrow}>→</Text>
          <Text style={styles.homeRitualStep}>Play</Text>
          <Text style={styles.homeRitualArrow}>→</Text>
          <Text style={styles.homeRitualStep}>Prove</Text>
          <Text style={styles.homeRitualArrow}>→</Text>
          <Text style={styles.homeRitualStep}>Collect coat</Text>
        </View>
      </View>

      <View style={styles.whereBeginCard}>
        <Text style={styles.eyebrow}>Where to begin</Text>
      <Text style={styles.sectionTitle}>How heroic are you feeling today?</Text>
        <Text style={styles.sectionBody}>Pick a starting quest based on your current tolerance for terrible chess decisions.</Text>
        <View style={styles.heroismChoiceList}>
          {heroismChoices.map(({ label, copy, cta, challenge }) => (
            <HeroismChoiceCard key={challenge.id} label={label} copy={copy} cta={cta} challenge={challenge} onPress={() => onSelectChallenge(challenge.id, "sideQuests")} />
          ))}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Surprise me with a random Solo Side Quest" testID="home-random-solo-side-quest" style={styles.secondaryButtonWide} onPress={handleRandomSoloQuest}>
          <Text style={styles.secondaryButtonText}>Surprise me with a random Solo Side Quest</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Find your own path" testID="home-find-own-path" onPress={() => onSelectTab("sideQuests")}>
          <Text style={styles.heroismCustomPath}>Or go find your own path.</Text>
        </Pressable>
      </View>

      {!isSignedIn ? <AppRitualCard /> : null}

      {!isSignedIn ? (
        <View style={styles.multiplayerCalloutCard}>
          <Text style={styles.eyebrow}>Multiplayer Side Quests</Text>
          <Text style={styles.sectionTitle}>Same nonsense, now with witnesses.</Text>
          <Text style={styles.sectionBody}>Join public Multiplayer Side Quests, inspect the rules before committing, or sign in when you want to create one and invite friends.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Join Multiplayer Side Quests" testID="home-join-multiplayer-callout" style={styles.secondaryButtonWide} onPress={() => onSelectTab("multiplayerSideQuests")}>
            <Text style={styles.secondaryButtonText}>Join Multiplayer Side Quests</Text>
          </Pressable>
        </View>
      ) : null}

      {isSignedIn ? (
        <View style={styles.homeStatusCard}>
          <Text style={styles.eyebrow}>Active Solo Side Quest</Text>
          <Text style={styles.sectionTitle}>{signedInAccount?.activeQuest ? signedInAccount.activeQuest.title : "No active Solo Side Quest yet."}</Text>
          <Text style={styles.sectionBody}>{signedInAccount?.activeQuest ? "Open the active Side Quest page for rules, badge details, and the next weird chess Side Quest." : "Choose one Solo Side Quest first so My Side Quests knows which weird rule to judge after your next public game."}</Text>
          <View style={styles.scoreboardRow}>
            <BigScore label="Completed" value={`${signedInAccount?.progress.totalCompletedChallenges ?? 0}`} />
            <BigScore label="Coat of Arms" value={`${signedInAccount?.progress.totalCompletedChallenges ?? 0}`} />
            <BigScore label="Proofs" value={`${signedInAccount?.progress.proofReceiptCount ?? 0}`} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function GradientBackdrop({ challenge }: { challenge?: MobileChallenge | null }) {
  const primary = getSafeBadgeColors(challenge).primary;
  const secondary = getSafeBadgeColors(challenge).secondary;
  const glow = getSafeBadgeColors(challenge).glow ?? primary;

  return (
    <View pointerEvents="none" style={styles.appGradientFrame}>
      <LinearGradient
        colors={[colorWithAlpha(glow, 0.52), colorWithAlpha(primary, 0.22), "rgba(6,5,7,.98)", "#020204"]}
        locations={[0, 0.28, 0.68, 1]}
        start={{ x: 0.34, y: 0 }}
        end={{ x: 0.78, y: 1 }}
        style={styles.appGradientLayer}
      />
      <LinearGradient
        colors={[colorWithAlpha(secondary, 0.30), colorWithAlpha(secondary, 0.09), "rgba(0,0,0,0)"]}
        locations={[0, 0.44, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.12, y: 0.74 }}
        style={styles.appGradientLayer}
      />
      <LinearGradient
        colors={["rgba(255,247,232,.08)", "rgba(245,200,106,.06)", "rgba(0,0,0,0)"]}
        locations={[0, 0.36, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.72, y: 0.5 }}
        style={styles.appGradientLayer}
      />
    </View>
  );
}

function CardGradientGlows() {
  return (
    <View pointerEvents="none" style={styles.cardGradientFrame}>
      <LinearGradient colors={["rgba(245,200,106,.34)", "rgba(255,247,232,.10)", "rgba(23,17,25,.10)"]} locations={[0, 0.48, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradientLayer} />
      <LinearGradient colors={["rgba(255,95,159,.38)", "rgba(255,95,159,.12)", "rgba(255,95,159,0)"]} locations={[0, 0.45, 1]} start={{ x: 1, y: 0 }} end={{ x: 0.18, y: 0.72 }} style={styles.cardGradientLayer} />
      <LinearGradient colors={["rgba(118,169,255,0)", "rgba(118,169,255,.18)"]} locations={[0.2, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.cardGradientLayer} />
    </View>
  );
}

function HeroismChoiceCard({ label, copy, cta, challenge, onPress }: { label: string; copy: string; cta: string; challenge: MobileChallenge; onPress: () => void }) {
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={cta} testID={`home-heroism-${challenge.id}`} style={styles.heroismChoiceCard} onPress={onPress}>
      <View style={styles.heroismBadgeFrame}>
        <Image source={badgeSource} style={styles.heroismBadgeImage} resizeMode="contain" />
      </View>
      <View style={styles.heroismChoiceCopy}>
        <Text style={styles.heroismChoiceLabel}>{label}</Text>
        <Text style={styles.heroismChoiceSmall}>{copy}</Text>
        <Text style={styles.heroismChoiceCta}>{cta}</Text>
      </View>
    </Pressable>
  );
}

function AppRitualCard({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.appRitualCard}>
      <Text style={styles.eyebrow}>WHAT HAPPENS AFTER SIGN-IN</Text>
      <Text style={styles.sectionTitle}>A tiny ritual, not another chess dashboard.</Text>
      {!compact ? <Text style={styles.sectionBody}>The whole Side Quest Chess loop now stays inside this app.</Text> : null}
      <View style={styles.appRitualSteps}>
        <FlowStep done title="Choose solo or multiplayer" body="Start one Side Quest for yourself, or join a Multiplayer Side Quest when the bad idea deserves witnesses." />
        <FlowStep title="Play where you already play" body="Use a normal public Lichess or Chess.com game. Side Quest Chess never asks for chess-site passwords." />
        <FlowStep title="Get the receipt" body="SQC checks your latest public game and updates your proof, progress, and leaderboard results." />
      </View>
    </View>
  );
}
function BottomNav({ activeTab, account, bottomInset, onSelectTab }: { activeTab: AppTab; account: MobileAccountResponse | null; bottomInset: number; onSelectTab: (tab: AppTab) => void }) {
  const authenticated = isAuthenticatedAccount(account);

  return (
    <View style={[styles.bottomNavBar, { paddingBottom: Math.max(bottomInset, 0) }]}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.id }}
          accessibilityLabel={`Open ${tab.label}`}
          testID={`mobile-bottom-nav-${tab.id}`}
          style={[styles.bottomNavItem, activeTab === tab.id && styles.bottomNavItemActive]}
          onPress={() => onSelectTab(tab.id)}
        >
          <View style={[styles.bottomNavIconFrame, activeTab === tab.id && styles.bottomNavIconFrameActive]}>
            {tab.iconKind === "image" ? (
              <Image source={{ uri: absoluteAssetUrl(tab.imagePath) }} style={tab.id === "coatOfArms" ? styles.bottomNavCoatImage : tab.id === "sideQuests" ? styles.bottomNavSideQuestImage : styles.bottomNavLogoImage} resizeMode="contain" />
            ) : tab.id === "account" && authenticated ? (
              <View style={[styles.bottomNavLoggedInBadge, activeTab === tab.id && styles.bottomNavLoggedInBadgeActive]}>
                <MaterialCommunityIcons name="shield-check" size={21} color={activeTab === tab.id ? "#17120c" : colors.green} />
              </View>
            ) : (
              <MaterialCommunityIcons name={tab.iconName} size={24} color={activeTab === tab.id ? colors.gold : colors.muted} />
            )}
          </View>
          <Text style={[styles.bottomNavText, activeTab === tab.id && styles.bottomNavTextActive]} numberOfLines={1}>{tab.label}</Text>
          {activeTab === tab.id ? <View style={styles.bottomNavActiveDot} /> : null}
        </Pressable>
      ))}
    </View>
  );
}
function ActiveScreen({
  activeTab,
  bootstrap,
  catalogMode,
  selectedChallenge,
  account,
  authBridge,
  onSelectChallenge,
  pendingSideQuestDetailId,
  pendingCompletedDetailId,
  onOpenChallengeDetail,
  onOpenCompletedQuestDetail,
  onConsumePendingQuestOpen,
  onSelectTab,
  onOpenMultiplayerCreate,
  pendingMultiplayerCreateOpen,
  pendingMultiplayerCreateQuestId,
  onConsumePendingMultiplayerCreate,
  onAccountUpdated,
}: {
  activeTab: AppTab;
  bootstrap: MobileBootstrap;
  catalogMode: "live" | "offline";
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  pendingSideQuestDetailId: string | null;
  pendingCompletedDetailId: string | null;
  onOpenChallengeDetail: (challengeId: string) => void;
  onOpenCompletedQuestDetail: (challengeId: string) => void;
  onConsumePendingQuestOpen: () => void;
  onSelectTab: (tab: AppTab) => void;
  onOpenMultiplayerCreate: (questId?: string) => void;
  pendingMultiplayerCreateOpen: boolean;
  pendingMultiplayerCreateQuestId: string | null;
  onConsumePendingMultiplayerCreate: () => void;
  onAccountUpdated: AccountUpdatedCallback;
}) {
  switch (activeTab) {
    case "home":
      return <TodayDashboard bootstrap={bootstrap} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onOpenMultiplayerCreate={onOpenMultiplayerCreate} onSelectChallenge={onSelectChallenge} onAccountUpdated={onAccountUpdated} />;
    case "sideQuests":
      return <QuestBoardDashboard bootstrap={bootstrap} selectedChallenge={selectedChallenge} pendingSideQuestDetailId={pendingSideQuestDetailId} pendingCompletedDetailId={pendingCompletedDetailId} onConsumePendingQuestOpen={onConsumePendingQuestOpen} account={account} authBridge={authBridge} onSelectChallenge={onSelectChallenge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} onOpenChallengeDetail={onOpenChallengeDetail} onOpenMultiplayerCreate={onOpenMultiplayerCreate} />;
    case "multiplayerSideQuests":
      return <MultiplayerSideQuestsScreen bootstrap={bootstrap} account={account} authBridge={authBridge} onSelectTab={onSelectTab} pendingCreateOpen={pendingMultiplayerCreateOpen} pendingCreateQuestId={pendingMultiplayerCreateQuestId} onConsumePendingCreateOpen={onConsumePendingMultiplayerCreate} onAccountUpdated={onAccountUpdated} />;
    case "officialLeaderboards":
      return <OfficialMultiplayerLeaderboardsScreen bootstrap={bootstrap} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />;
    case "coatOfArms":
      return <CoatBoardDashboard bootstrap={bootstrap} account={account} onOpenChallengeDetail={onOpenChallengeDetail} onClose={() => onSelectTab("account")} />;
    case "account":
      return <AccountTrackerDashboard bootstrap={bootstrap} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onSelectChallenge={onSelectChallenge} onOpenChallengeDetail={onOpenChallengeDetail} onOpenCompletedQuestDetail={onOpenCompletedQuestDetail} onAccountUpdated={onAccountUpdated} />;
  }
}

function SideQuestsScreen({
  bootstrap,
  selectedChallenge,
  account,
  authBridge,
  onSelectChallenge,
  onSelectTab,
  onAccountUpdated,
  onOpenChallengeDetail,
}: {
  bootstrap: MobileBootstrap;
  catalogMode: "live" | "offline";
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: AccountUpdatedCallback;
  onOpenChallengeDetail: (challengeId: string) => void;
}) {
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const completedIds = new Set(signedInAccount ? signedInAccount.completedQuests.map((quest) => quest.id) : []);
  const activeQuestId = signedInAccount?.activeQuest && !signedInAccount.activeQuest.completed ? signedInAccount.activeQuest.id : null;
  const availableCount = bootstrap.challenges.length;
  const completedCount = completedIds.size;
  const [customCreateOpen, setCustomCreateOpen] = useState(false);
  const [customDetailId, setCustomDetailId] = useState<string | null>(null);
  const [sideQuestCatalogTab, setSideQuestCatalogTab] = useState<"official" | "community">("official");
  const [customConditionEditorOpen, setCustomConditionEditorOpen] = useState(false);
  const [customQuestName, setCustomQuestName] = useState("My custom Side Quest");
  const [customRuleLogic, setCustomRuleLogic] = useState<CustomRuleLogic>("all");
  const [customRulePiece, setCustomRulePiece] = useState<CustomRulePiece>("queen");
  const [customRuleOwner, setCustomRuleOwner] = useState<CustomRuleOwner>("my");
  const [customRuleCondition, setCustomRuleCondition] = useState<CustomRuleCondition>("game result");
  const [customRuleTiming, setCustomRuleTiming] = useState<CustomRuleTiming>("by move");
  const [customRuleMoveNumber, setCustomRuleMoveNumber] = useState("15");
  const [customRuleQuantifier, setCustomRuleQuantifier] = useState<CustomRuleQuantifier>("any one");
  const [customRuleCount, setCustomRuleCount] = useState(1);
  const [customRuleIdentity, setCustomRuleIdentity] = useState("original");
  const [customRuleTargetSquare, setCustomRuleTargetSquare] = useState("e4");
  const [customRuleMoveSequence, setCustomRuleMoveSequence] = useState("e4 e5 Nf3");
  const [customRuleOpeningSequence, setCustomRuleOpeningSequence] = useState("1.e4 e5 2.f4");
  const [customRuleResult, setCustomRuleResult] = useState<CustomRuleResult>("win");
  const [customRuleNegated, setCustomRuleNegated] = useState(false);
  const [customRequirements, setCustomRequirements] = useState<CustomRuleRequirement[]>([]);
  const customRequirementIdCounter = useRef(0);
  const [customEditingRequirementId, setCustomEditingRequirementId] = useState<string | null>(null);
  const [customDrafts, setCustomDrafts] = useState<CustomLibraryQuest[]>([]);
  const serverCustomDrafts: CustomLibraryQuest[] = isAuthenticatedAccount(account) ? (account.customSideQuests ?? []).map((quest) => ({ id: quest.id, name: quest.title, summary: quest.summary, config: quest.config, visibility: quest.visibility ?? "private", lifecycle: quest.lifecycle ?? "published", badgeImageUrl: quest.badgeImageUrl ?? null, stats: quest.stats })) : [];
  const visibleCustomDrafts = serverCustomDrafts.length ? serverCustomDrafts : customDrafts;
  const customDetailDraft = customDetailId ? visibleCustomDrafts.find((draft) => draft.id === customDetailId) ?? null : null;
  const customDetailCompletedQuest = customDetailDraft && signedInAccount ? signedInAccount.completedQuests.find((quest) => quest.id === customDetailDraft.id) ?? null : null;
  const customDetailLatestReceipt = customDetailDraft && signedInAccount?.latestReceipt?.challengeId === customDetailDraft.id ? signedInAccount.latestReceipt : null;
  const customDetailActive = Boolean(customDetailDraft && activeQuestId === customDetailDraft.id);
  const currentCustomRequirement = {
    piece: customRulePiece,
    owner: customRuleOwner,
    condition: customRuleCondition,
    timing: customRuleTiming,
    moveNumber: normalizeCustomMoveNumber(customRuleMoveNumber),
    quantifier: customRuleQuantifier,
    count: normalizeCustomRuleCount(customRulePiece, customRuleCount),
    identity: normalizeCustomPieceIdentity(customRulePiece, customRuleIdentity),
    targetSquare: normalizeCustomSquare(customRuleTargetSquare),
    moveSequence: normalizeCustomMoveSequence(customRuleMoveSequence),
    openingSequence: normalizeCustomOpeningSequence(customRuleOpeningSequence),
    result: customRuleResult,
    negated: customRuleNegated,
  };
  const customRuleRequirements = customRequirements.map(({ id: _id, ...requirement }) => requirement);
  const customRuleSummary = customRuleRequirements.length ? buildCustomRuleSetSummary({ logic: customRuleLogic, requirements: customRuleRequirements }) : "Add at least one condition before this Side Quest can be scored.";
  const customRuleConfig = buildCustomPieceRuleConfig({ logic: customRuleLogic, requirements: customRuleRequirements });
  const customBadgePreviewUrl = getCustomCoatPreviewUrl(customRuleRequirements, customQuestName);
  const canPublishCustomQuest = customRequirements.length > 0 || customConditionEditorOpen;

  function loadCustomRequirement(requirement: CustomRuleRequirement) {
    setCustomRulePiece(requirement.piece);
    setCustomRuleOwner(requirement.owner);
    setCustomRuleCondition(requirement.condition);
    setCustomRuleTiming(requirement.timing);
    setCustomRuleMoveNumber(String(requirement.moveNumber));
    setCustomRuleQuantifier(requirement.quantifier);
    setCustomRuleCount(requirement.count);
    setCustomRuleIdentity(requirement.identity);
    setCustomRuleTargetSquare(requirement.targetSquare);
    setCustomRuleMoveSequence(requirement.moveSequence || "e4 e5 Nf3");
    setCustomRuleOpeningSequence(requirement.openingSequence || "1.e4 e5 2.f4");
    setCustomRuleResult(requirement.result || "win");
    setCustomRuleNegated(requirement.negated);
  }

  function openNewCustomRequirement() {
    setCustomEditingRequirementId(null);
    setCustomConditionEditorOpen(true);
  }

  function editCustomRequirement(requirement: CustomRuleRequirement) {
    loadCustomRequirement(requirement);
    setCustomEditingRequirementId(requirement.id);
    setCustomConditionEditorOpen(true);
  }

  function saveCustomRequirement() {
    const validationError = getCustomRequirementValidation(currentCustomRequirement);
    if (validationError) {
      Alert.alert("Condition needs one fix", validationError);
      return false;
    }

    setCustomRequirements(getCustomRequirementsIncludingOpenCondition(false) ?? customRequirements);
    setCustomEditingRequirementId(null);
    setCustomConditionEditorOpen(false);
    return true;
  }

  function getCustomRequirementsIncludingOpenCondition(allowInvalidDraft: boolean) {
    if (!customConditionEditorOpen) {
      return customRequirements;
    }

    const validationError = getCustomRequirementValidation(currentCustomRequirement);
    if (validationError && !allowInvalidDraft) {
      Alert.alert("Condition needs one fix", validationError);
      return null;
    }

    if (customEditingRequirementId) {
      return customRequirements.map((requirement) => requirement.id === customEditingRequirementId ? { id: requirement.id, ...currentCustomRequirement } : requirement);
    }

    customRequirementIdCounter.current += 1;
    return [{ id: `draft-condition-${customRequirementIdCounter.current}`, ...currentCustomRequirement }, ...customRequirements].slice(0, 6);
  }

  function duplicateCustomRequirement(requirement: CustomRuleRequirement) {
    customRequirementIdCounter.current += 1;
    setCustomRequirements((current) => [{ ...requirement, id: `draft-condition-${customRequirementIdCounter.current}` }, ...current].slice(0, 6));
  }

  function removeCustomRequirement(requirementId: string) {
    setCustomRequirements((current) => current.filter((requirement) => requirement.id !== requirementId));
    if (customEditingRequirementId === requirementId) {
      setCustomEditingRequirementId(null);
      setCustomConditionEditorOpen(false);
    }
  }

  async function saveCustomDraft(lifecycle: "draft" | "published" = "published") {
    const requirementsForSave = getCustomRequirementsIncludingOpenCondition(lifecycle === "draft");
    if (!requirementsForSave) {
      return;
    }
    if (lifecycle === "published" && !requirementsForSave.length) {
      Alert.alert("Add a condition first", "A custom Side Quest needs at least one saved condition before it can be published.");
      return;
    }
    const name = customQuestName.trim() || "Custom Side Quest";
    const summary = requirementsForSave.length ? buildCustomRuleSetSummary({ logic: customRuleLogic, requirements: requirementsForSave.map(({ id: _id, ...requirement }) => requirement) }) : "Add at least one condition before this Side Quest can be scored.";
    const config = buildCustomPieceRuleConfig({ logic: customRuleLogic, requirements: requirementsForSave.map(({ id: _id, ...requirement }) => requirement) });
    const badgePreviewUrl = getCustomCoatPreviewUrl(requirementsForSave, name);
    if (!authBridge.isSignedIn) {
      setCustomDrafts((current) => {
        customRequirementIdCounter.current += 1;
        const draft: CustomLibraryQuest = { id: `local-custom-${customRequirementIdCounter.current}`, name, summary, config, visibility: "private", lifecycle, badgeImageUrl: badgePreviewUrl };
        return [draft, ...current].slice(0, 6);
      });
      Alert.alert(lifecycle === "draft" ? "Draft saved locally" : "Sign in to launch this Side Quest", lifecycle === "draft" ? `${name} is saved as a local draft.` : `${name} is saved locally for now. Sign in to make it pickable and verifiable.`);
      setCustomCreateOpen(false);
      return;
    }
    try {
      const sessionToken = await authBridge.getSessionToken();
      await saveMobileCustomSideQuest({ sessionToken, title: name, summary, config, lifecycle, visibility: "private" });
      await Promise.resolve(onAccountUpdated());
      Alert.alert(lifecycle === "draft" ? "Custom Side Quest draft saved" : "Custom Side Quest saved", lifecycle === "draft" ? `${name} is saved as a private draft. Publish it when the rules are ready.` : `${name} is ready in your Side Quest Library.`);
      setCustomCreateOpen(false);
    } catch (caught) {
      Alert.alert(lifecycle === "published" ? "Could not publish Side Quest" : "Could not save draft", caught instanceof Error ? caught.message : "Try again in a moment.");
    }
  }

  async function startCustomSideQuest(questId: string) {
    if (!authBridge.isSignedIn) {
      Alert.alert("Sign in to start custom Side Quests", "Saved Side Quests can be picked after sign-in.");
      return;
    }
    try {
      const sessionToken = await authBridge.getSessionToken();
      await runMobileQuestAction({ sessionToken, action: "start", challengeId: questId });
      await Promise.resolve(onAccountUpdated());
      onSelectTab("home");
    } catch (caught) {
      Alert.alert("Could not start custom Side Quest", caught instanceof Error ? caught.message : "Try again in a moment.");
    }
  }

  return (
    <View style={styles.screenStack}>
      <View style={styles.soloBrowseHero}>
        <CardGradientGlows />
        <View style={styles.soloBrowseHeroRow}>
          <View style={styles.soloBrowseHeroCopy}>
            <Text style={styles.eyebrow}>Solo Side Quests</Text>
            <Text style={styles.soloBrowseHeroTitle}>Choose your next Side Quest</Text>
            <Text style={styles.soloBrowseHeroText}>Pick one Side Quest, play on Lichess or Chess.com, then come back for automatic proof.</Text>
          </View>
          <Image source={SQC_COAT_OF_ARMS_ASSET} style={styles.soloBrowseHeroCoat} resizeMode="contain" />
        </View>
        <View style={styles.soloBrowseStatsRow}>
          <Text style={styles.soloBrowseStat}>{availableCount} available</Text>
          <Text style={styles.soloBrowseStat}>{completedCount} completed</Text>
          <Text style={styles.soloBrowseStat}>{activeQuestId ? "1 active" : "none active"}</Text>
        </View>
        <View style={styles.homeHeroActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Create custom Side Quest" style={styles.primaryButtonWide} onPress={() => setCustomCreateOpen(true)}>
            <Text style={styles.primaryButtonText}>Build a Side Quest</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Browse community Side Quests" style={styles.secondaryButtonWide} onPress={() => undefined}>
            <Text style={styles.secondaryButtonText}>Browse Community Side Quests</Text>
          </Pressable>
        </View>
      </View>

      <View style={compactStyles.multiplayerNativeCard}>
        <Text style={compactStyles.multiplayerCardEyebrow}>Side Quest Library</Text>
        <Text style={compactStyles.multiplayerCardTitle}>Your custom Side Quest library.</Text>
        <Text style={styles.sectionBody}>Create your own chess challenges, then use them in Solo or Multiplayer.</Text>
        <View style={compactStyles.appRows}>
          {visibleCustomDrafts.length ? visibleCustomDrafts.map((draft) => (
            <AppRow key={draft.id} title={draft.name} meta={`${getCustomLibraryMeta(draft)} · ${getCustomStatsLine(draft.stats)}`} status={getCustomLifecycleStatus(draft, activeQuestId, Boolean(signedInAccount?.completedQuests.some((quest) => quest.id === draft.id)))} imageSource={getCustomQuestImageSource(draft.badgeImageUrl)} variant="seal" onPress={() => setCustomDetailId(draft.id)} />
          )) : <AppRow title="No custom Side Quests yet" meta="Create your own chess challenge and give it a Coat of Arms." status="Create" imageSource={getCustomQuestImageSource(null)} variant="seal" onPress={() => setCustomCreateOpen(true)} />}
        </View>
      </View>

      <SelectedQuestDetailCard challenge={selectedChallenge} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />

      <View style={styles.soloDeckHeader}>
        <Text style={styles.sectionTitle}>Solo Side Quest deck</Text>
        <Text style={styles.sectionBody}>Tap a Coat of Arms to review the rule, then start the Side Quest you want SQC to judge next.</Text>
      </View>
      <AvailableQuestGrid challenges={bootstrap.challenges} completedIds={completedIds} activeQuestId={activeQuestId} onSelectChallenge={onSelectChallenge} />

      <CustomSideQuestDetailModal
        quest={customDetailDraft}
        visible={Boolean(customDetailDraft)}
        active={customDetailActive}
        completed={Boolean(customDetailCompletedQuest)}
        completedAt={customDetailCompletedQuest?.completedAt ?? null}
        latestReceipt={customDetailLatestReceipt}
        onClose={() => setCustomDetailId(null)}
        onStart={async (questId) => {
          await startCustomSideQuest(questId);
          setCustomDetailId(null);
        }}
        onCheck={async (questId, gameId) => {
          if (!authBridge.isSignedIn) throw new Error("Sign in first to check custom Side Quest proof.");
          const sessionToken = await authBridge.getSessionToken();
          await runMobileQuestAction({ sessionToken, action: gameId ? "submit" : "check", challengeId: questId, gameId });
          const nextAccount = await Promise.resolve(onAccountUpdated());
          const coercedAccount = coerceAccountResponse(nextAccount);
          const refreshedReceipt = isAuthenticatedAccount(coercedAccount) && coercedAccount.latestReceipt?.challengeId === questId ? coercedAccount.latestReceipt : null;
          return getCheckActionMessage(refreshedReceipt);
        }}
        onReset={async (questId) => {
          if (!authBridge.isSignedIn) throw new Error("Sign in first to deactivate this custom Side Quest.");
          const sessionToken = await authBridge.getSessionToken();
          const result = await runMobileQuestAction({ sessionToken, action: "deactivate", challengeId: questId });
          await Promise.resolve(onAccountUpdated());
          return result.message;
        }}
        onDuplicate={async (quest) => {
          if (!authBridge.isSignedIn) return Alert.alert("Sign in required", "Sign in to duplicate saved custom Side Quests.");
          const sessionToken = await authBridge.getSessionToken();
          await saveMobileCustomSideQuest({ sessionToken, title: `${quest.name} Copy`, summary: quest.summary, config: quest.config, lifecycle: "published", visibility: quest.visibility ?? "private" });
          await Promise.resolve(onAccountUpdated());
          Alert.alert("Custom Side Quest duplicated", `${quest.name} Copy is now in your library.`);
        }}
        onDelete={async (questId) => {
          if (!authBridge.isSignedIn) {
            setCustomDrafts((current) => current.filter((draft) => draft.id !== questId));
          } else {
            const sessionToken = await authBridge.getSessionToken();
            await deleteMobileCustomSideQuest({ sessionToken, id: questId });
            await Promise.resolve(onAccountUpdated());
          }
          setCustomDetailId(null);
        }}
        onSaveState={async (quest, next) => {
          if (!authBridge.isSignedIn) {
            setCustomDrafts((current) => current.map((draft) => draft.id === quest.id ? { ...draft, lifecycle: next.lifecycle ?? draft.lifecycle, visibility: next.visibility ?? draft.visibility } : draft));
            return;
          }
          const sessionToken = await authBridge.getSessionToken();
          await saveMobileCustomSideQuest({ sessionToken, id: quest.id, title: quest.name, summary: quest.summary, config: quest.config, lifecycle: next.lifecycle ?? quest.lifecycle ?? "published", visibility: next.visibility ?? quest.visibility ?? "private" });
          await Promise.resolve(onAccountUpdated());
          Alert.alert("Custom Side Quest updated", getCustomStateSavedMessage(quest.name, next));
        }}
      />

      <Modal visible={customCreateOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setCustomCreateOpen(false)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close custom Side Quest builder" style={compactStyles.detailCloseButton} onPress={() => setCustomCreateOpen(false)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={compactStyles.multiplayerDetailHero}>
              <Image source={getCustomQuestImageSource(null)} style={compactStyles.multiplayerDetailSeal} resizeMode="contain" />
              <Text style={compactStyles.multiplayerDetailKicker}>Custom Side Quest</Text>
              <Text style={compactStyles.detailTitle}>Build your Side Quest.</Text>
              <Text style={compactStyles.detailGoal}>Choose what should happen in a real game. SQC will check it after you play.</Text>
            </View>
            <View style={compactStyles.multiplayerNativeCard}>
              <Text style={styles.inputLabel}>Side Quest name</Text>
              <TextInput value={customQuestName} placeholder="Name this custom Side Quest" placeholderTextColor="rgba(255,247,232,.42)" style={styles.textInput} onChangeText={setCustomQuestName} />
              <Text style={styles.microcopy}>Saved Side Quests appear in your library and can be used for Solo or Multiplayer.</Text>
              <View style={compactStyles.customCoatPreviewRow}>
                <Image source={{ uri: absoluteAssetUrl(getSingleCustomQuestBadgePath(customBadgePreviewUrl)) }} style={compactStyles.customCoatPreviewImage} resizeMode="contain" />
                <View style={compactStyles.customCoatPreviewCopy}>
                  <Text style={compactStyles.multiplayerRuleLabel}>Side Quest Coat of Arms</Text>
                  <Text style={styles.microcopy}>This is the Coat of Arms players unlock when this Side Quest is completed.</Text>
                </View>
              </View>
              <Text style={compactStyles.multiplayerCardEyebrow}>How to complete it</Text>
              <Text style={compactStyles.multiplayerCardTitle}>What must happen?</Text>
              <Text style={styles.microcopy}>Add one or more conditions. SQC checks them against your next public game. Public means the game is visible on your connected chess account.</Text>
              <Text style={compactStyles.multiplayerRuleLabel}>If you add several conditions, how should they count?</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {CUSTOM_RULE_LOGICS.map((logic) => {
                  const selected = customRuleLogic === logic;
                  return (
                    <Pressable key={logic} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleLogic(logic)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{logic === "all" ? "Complete every condition" : "Complete any one condition"}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{logic === "all" ? "All selected conditions must happen. You can change this later." : "One selected condition is enough. You can change this later."}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={compactStyles.multiplayerRuleRow}>
                <Text style={compactStyles.multiplayerRuleLabel}>Your conditions</Text>
                <Text style={compactStyles.multiplayerRuleValue}>{customRequirements.length ? `${customRequirements.length} saved. They can happen in any order.` : "No conditions yet. Add the first thing players must do."}</Text>
                {!customRequirements.length && !customConditionEditorOpen ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Add first custom Side Quest condition" style={compactStyles.detailPrimaryButton} onPress={openNewCustomRequirement}>
                    <Text style={compactStyles.detailPrimaryButtonText}>Add Condition</Text>
                  </Pressable>
                ) : null}
              </View>
              {customRequirements.length ? (
                <View style={compactStyles.appRows}>
                  {customRequirements.map((requirement, index) => (
                    <View key={requirement.id} style={compactStyles.customConditionListRow}>
                      <View style={compactStyles.currentQuestRow}>
                        <View style={compactStyles.coatMarker}>
                          <Text style={compactStyles.customConditionIndex}>{index + 1}</Text>
                        </View>
                        <View style={compactStyles.currentQuestText}>
                          <Text style={compactStyles.currentQuestTitle}>{getCustomConditionLabel(index)}</Text>
                          <Text style={compactStyles.currentQuestMeta}>{buildCustomPieceRuleSummary(requirement)}</Text>
                        </View>
                      </View>
                      <View style={compactStyles.actionRowTight}>
                        <Pressable accessibilityRole="button" accessibilityLabel="Edit saved condition" style={compactStyles.secondaryAction} onPress={() => editCustomRequirement(requirement)}>
                          <Text style={compactStyles.secondaryActionText}>Edit</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" accessibilityLabel="Duplicate saved condition" style={compactStyles.secondaryAction} onPress={() => duplicateCustomRequirement(requirement)}>
                          <Text style={compactStyles.secondaryActionText}>Duplicate</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" accessibilityLabel="Delete saved condition" style={compactStyles.secondaryAction} onPress={() => removeCustomRequirement(requirement.id)}>
                          <Text style={compactStyles.secondaryActionText}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
              {!customConditionEditorOpen && customRequirements.length ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Add custom Side Quest condition" style={compactStyles.detailSecondaryButton} onPress={openNewCustomRequirement}>
                  <Text style={compactStyles.detailSecondaryButtonText}>Add Another Condition</Text>
                </Pressable>
              ) : customConditionEditorOpen ? (
                <View>
                  <Text style={compactStyles.multiplayerCardEyebrow}>Condition editor</Text>
                  <Text style={compactStyles.multiplayerCardTitle}>{customEditingRequirementId ? "Edit condition" : "New condition"}</Text>
                  <Text style={styles.microcopy}>You can tap Save Condition, or publish/save the Side Quest directly and SQC will include this open condition if it is valid.</Text>
                  <Text style={compactStyles.multiplayerRuleLabel}>Condition type</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    {CUSTOM_RULE_CONDITIONS.map((condition) => {
                      const selected = customRuleCondition === condition;
                      const copy = getCustomConditionTypeCopy(condition);
                      return (
                        <Pressable key={condition} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => { setCustomRuleCondition(condition); if (condition === "on square") setCustomRuleTiming("at move"); if (condition === "game result") setCustomRuleResult("win"); }}>
                          <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                          <View style={compactStyles.multiplayerOptionCopy}>
                            <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{copy.title}</Text>
                            <Text style={compactStyles.multiplayerOptionHelper}>{copy.helper}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  {customConditionUsesPiece(customRuleCondition) ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Piece</Text>
                      <View style={compactStyles.multiplayerOptionGrid}>
                    {CUSTOM_RULE_PIECES.map((piece) => {
                      const selected = customRulePiece === piece;
                      const identityChoices = getCustomPieceIdentityChoices(piece);
                      return (
                        <View key={piece} style={selected ? compactStyles.customPieceChoiceGroupSelected : compactStyles.customPieceChoiceGroup}>
                          <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => { setCustomRulePiece(piece); setCustomRuleCount((current) => normalizeCustomRuleCount(piece, current)); setCustomRuleIdentity((current) => normalizeCustomPieceIdentity(piece, current)); if (getCustomPieceMaxCount(piece) === 1) setCustomRuleQuantifier("any one"); }}>
                            <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                            <View style={compactStyles.multiplayerOptionCopy}>
                              <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{titleCaseRuleValue(piece)}</Text>
                              {piece === "king" || piece === "queen" ? <Text style={compactStyles.multiplayerOptionHelper}>Only one exists, so there is no “which one” choice.</Text> : null}
                            </View>
                          </Pressable>
                          {selected && identityChoices.length ? (
                            <View style={compactStyles.customPieceSubchoicePanel}>
                              <Text style={compactStyles.customPieceSubchoiceLabel}>Which {piece}</Text>
                              <View style={compactStyles.multiplayerOptionGrid}>
                                {identityChoices.map((choice) => {
                                  const choiceSelected = isCustomPieceIdentityChoiceSelected(piece, customRuleIdentity, customRuleQuantifier, choice);
                                  return (
                                    <Pressable key={choice.id} accessibilityRole="button" accessibilityState={{ selected: choiceSelected }} style={[compactStyles.multiplayerOptionCard, choiceSelected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => { setCustomRuleIdentity(choice.identity); setCustomRuleCount((current) => normalizeCustomRuleCount(piece, current)); if (choice.quantifier) setCustomRuleQuantifier(choice.quantifier); else if (choice.id === "any") setCustomRuleQuantifier("any one"); }}>
                                      <View style={[compactStyles.multiplayerOptionDot, choiceSelected ? compactStyles.multiplayerOptionDotSelected : null]} />
                                      <View style={compactStyles.multiplayerOptionCopy}>
                                        <Text style={choiceSelected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{choice.label}</Text>
                                        <Text style={compactStyles.multiplayerOptionHelper}>{choice.helper}</Text>
                                      </View>
                                    </Pressable>
                                  );
                                })}
                              </View>
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                  {customPieceNeedsIdentityChoice(customRulePiece) && normalizeCustomPieceIdentity(customRulePiece, customRuleIdentity) !== "any" ? (
                    <Text style={styles.microcopy}>A specific starting piece is selected, so quantity is fixed to that one piece.</Text>
                  ) : null}
                  <Text style={compactStyles.multiplayerRuleLabel}>Whose piece</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    {CUSTOM_RULE_OWNERS.map((owner) => {
                      const selected = customRuleOwner === owner;
                      return (
                        <Pressable key={owner} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleOwner(owner)}>
                          <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                          <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{owner === "my" ? "Mine" : "Opponent's"}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                    </View>
                  ) : (
                    <Text style={styles.microcopy}>This condition applies to the move list, not to a specific piece.</Text>
                  )}
                  {customRuleCondition === "on square" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Square</Text>
                      <TextInput value={customRuleTargetSquare} placeholder="e4" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" maxLength={2} style={styles.textInput} onChangeText={setCustomRuleTargetSquare} />
                      <Text style={styles.microcopy}>Use algebraic board squares like e4, h8, or a1.</Text>
                    </View>
                  ) : null}
                  {customRuleCondition === "move sequence" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Move sequence</Text>
                      <TextInput value={customRuleMoveSequence} placeholder="e4 e5 Nf3 Nc6" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" multiline style={[styles.textInput, styles.textAreaInput]} onChangeText={(value) => setCustomRuleMoveSequence(normalizeCustomMoveSequence(value))} />
                      <Text style={styles.microcopy}>Enter algebraic moves in order, for example e4 e5 Nf3 Nc6. Timing decides when the sequence must be complete or appear.</Text>
                    </View>
                  ) : null}
                  {customRuleCondition === "opening sequence" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Opening sequence</Text>
                      <TextInput value={customRuleOpeningSequence} placeholder="1.e4 e5 2.f4" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" multiline style={[styles.textInput, styles.textAreaInput]} onChangeText={(value) => setCustomRuleOpeningSequence(value.slice(0, 260))} onEndEditing={() => setCustomRuleOpeningSequence((current) => normalizeCustomOpeningSequence(current) || "1.e4 e5 2.f4")} />
                      <Text style={styles.microcopy}>Paste opening notation with move numbers. SQC cleans it into: {getCustomOpeningPreview(customRuleOpeningSequence)}</Text>
                    </View>
                  ) : null}
                  {customRuleCondition === "game result" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Result</Text>
                      <View style={compactStyles.multiplayerOptionGrid}>
                        {CUSTOM_RULE_RESULTS.map((result) => {
                          const selected = customRuleResult === result;
                          return (
                            <Pressable key={result} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleResult(result)}>
                              <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                              <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{titleCaseRuleValue(result)}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Text style={styles.microcopy}>Result is checked from your linked chess account’s perspective.</Text>
                    </View>
                  ) : null}
                  {customRuleCondition !== "opening sequence" && customRuleCondition !== "game result" ? (
                    <View>
                      <Text style={compactStyles.multiplayerRuleLabel}>Timing</Text>
                      <View style={compactStyles.multiplayerOptionGrid}>
                        {CUSTOM_RULE_TIMINGS.map((timing) => {
                          const selected = customRuleTiming === timing;
                          const needsMoveNumber = selected && (timing === "by move" || timing === "at move");
                          return (
                            <View key={timing} style={[compactStyles.multiplayerOptionCard, compactStyles.customTimingChoiceCard, selected ? compactStyles.multiplayerOptionCardSelected : null]}>
                              <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={compactStyles.customTimingChoiceHeader} onPress={() => setCustomRuleTiming(timing)}>
                                <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                                <View style={compactStyles.multiplayerOptionCopy}>
                                  <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{titleCaseRuleValue(timing)}</Text>
                                  {needsMoveNumber ? <Text style={compactStyles.multiplayerOptionHelper}>Choose the move number for this timing.</Text> : null}
                                </View>
                              </Pressable>
                              {needsMoveNumber ? (
                                <View style={compactStyles.customTimingNestedInput}>
                                  <Text style={compactStyles.customPieceSubchoiceLabel}>Move number</Text>
                                  <TextInput value={customRuleMoveNumber} placeholder="15" placeholderTextColor="rgba(255,247,232,.42)" keyboardType="number-pad" inputMode="numeric" maxLength={3} style={styles.textInput} onChangeText={(value) => setCustomRuleMoveNumber(formatCustomMoveNumberInput(value))} onEndEditing={() => setCustomRuleMoveNumber((current) => current || "1")} />
                                </View>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.microcopy}>{customRuleCondition === "game result" ? "Game result is checked at the end, so no timing is needed." : "Opening sequence is always checked from move 1, so no timing is needed."}</Text>
                  )}
                  <Text style={compactStyles.multiplayerRuleLabel}>Pass when this condition is</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    <Pressable accessibilityRole="button" accessibilityState={{ selected: !customRuleNegated }} style={[compactStyles.multiplayerOptionCard, !customRuleNegated ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleNegated(false)}>
                      <View style={[compactStyles.multiplayerOptionDot, !customRuleNegated ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={!customRuleNegated ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>True</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>Use for “my rook must be on e4”.</Text>
                      </View>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityState={{ selected: customRuleNegated }} style={[compactStyles.multiplayerOptionCard, customRuleNegated ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCustomRuleNegated(true)}>
                      <View style={[compactStyles.multiplayerOptionDot, customRuleNegated ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={customRuleNegated ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>False / must not happen</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>Use for “my rook must not be on e4”.</Text>
                      </View>
                    </Pressable>
                  </View>
                  <View style={compactStyles.multiplayerRuleRow}>
                    <Text style={compactStyles.multiplayerRuleLabel}>Condition preview</Text>
                    <Text style={compactStyles.multiplayerRuleValue}>{buildCustomPieceRuleSummary(currentCustomRequirement)}</Text>
                  </View>
                  <View style={compactStyles.multiplayerFooterActions}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Save current condition" style={compactStyles.detailSecondaryButton} onPress={saveCustomRequirement}>
                      <Text style={compactStyles.detailSecondaryButtonText}>{customEditingRequirementId ? "Update Condition" : "Save Condition"}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel="Cancel condition editing" style={compactStyles.detailQuietButton} onPress={() => { setCustomEditingRequirementId(null); setCustomConditionEditorOpen(false); }}>
                      <Text style={compactStyles.detailQuietButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <View style={compactStyles.multiplayerRuleRow}>
                <Text style={compactStyles.multiplayerRuleLabel}>Rule preview</Text>
                <Text style={compactStyles.multiplayerRuleValue}>{customRuleSummary}</Text>
              </View>
              <Text style={styles.microcopy}>New custom Side Quests start private. After saving, open it from your library if you want to make the safe title, goal, and Coat of Arms public/shareable.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Save custom Side Quest" accessibilityState={{ disabled: !canPublishCustomQuest }} style={[compactStyles.detailPrimaryButton, !canPublishCustomQuest && compactStyles.detailPrimaryButtonDisabled]} disabled={!canPublishCustomQuest} onPress={() => void saveCustomDraft("published")}>
                <Text style={compactStyles.detailPrimaryButtonText}>{canPublishCustomQuest ? "Publish Private Side Quest" : "Add Condition to Publish"}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Save custom Side Quest draft" style={compactStyles.detailSecondaryButton} onPress={() => void saveCustomDraft("draft")}>
                <Text style={compactStyles.detailSecondaryButtonText}>Save Draft</Text>
              </Pressable>
            </View>
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function MultiplayerSideQuestsScreen({ bootstrap, account, authBridge, onSelectTab, pendingCreateOpen, pendingCreateQuestId, onConsumePendingCreateOpen, onAccountUpdated }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; authBridge: MobileAuthBridge; onSelectTab: (tab: AppTab) => void; pendingCreateOpen?: boolean; pendingCreateQuestId?: string | null; onConsumePendingCreateOpen?: () => void; onAccountUpdated: AccountUpdatedCallback }) {
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const officialPublicGroupQuests = (signedInAccount?.officialPublicGroupQuests ?? []).filter((quest) => quest.official || quest.id.startsWith("official-"));
  const officialPublicGroupQuestIds = new Set(officialPublicGroupQuests.map((quest) => quest.id));
  const activeGroupQuests = (signedInAccount?.activeGroupQuests ?? []).filter((quest) => !officialPublicGroupQuestIds.has(quest.id) && !quest.id.startsWith("official-"));
  const publicUserGroupQuests = (signedInAccount?.publicUserGroupQuests ?? []).filter((quest) => !quest.official && !quest.id.startsWith("official-"));
  const [groupQuestActionState, setGroupQuestActionState] = useState<{ busy: boolean; questId: string | null; message: string | null; error: string | null }>({ busy: false, questId: null, message: null, error: null });
  const [joinedMultiplayerId, setJoinedMultiplayerId] = useState<string | null>(null);
  const closedGroupQuests = (signedInAccount?.closedGroupQuests ?? []).filter((quest) => !officialPublicGroupQuestIds.has(quest.id) && !quest.id.startsWith("official-"));
  const closedPublicUserGroupQuests = (signedInAccount?.closedPublicUserGroupQuests ?? []).filter((quest) => !quest.official && !quest.id.startsWith("official-"));
  const closedUserGroupQuests = [...closedGroupQuests, ...closedPublicUserGroupQuests].filter((quest, index, all) => all.findIndex((entry) => entry.id === quest.id) === index);
  const joinedMultiplayerQuest = joinedMultiplayerId ? [...activeGroupQuests, ...closedUserGroupQuests].find((quest) => quest.id === joinedMultiplayerId) ?? null : null;
  const [officialMultiplayerId, setOfficialMultiplayerId] = useState<string | null>(null);
  const officialMultiplayerQuest = officialMultiplayerId ? officialPublicGroupQuests.find((quest) => quest.id === officialMultiplayerId) ?? null : null;
  const [publicMultiplayerId, setPublicMultiplayerId] = useState<string | null>(null);
  const publicMultiplayerQuest = publicMultiplayerId ? [...publicUserGroupQuests, ...closedPublicUserGroupQuests].find((quest) => quest.id === publicMultiplayerId) ?? null : null;
  const [multiplayerCommunitySearch, setMultiplayerCommunitySearch] = useState("");
  const [multiplayerHostFilter, setMultiplayerHostFilter] = useState<string | null>(null);
  const [multiplayerCommunityFilter, setMultiplayerCommunityFilter] = useState<MultiplayerCommunityFilter>("open");
  const [multiplayerCommunitySort, setMultiplayerCommunitySort] = useState<MultiplayerCommunitySort>("closing");
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteKey, setInviteKey] = useState("");
  const [multiplayerReportOpen, setMultiplayerReportOpen] = useState(false);
  const [multiplayerReportMessage, setMultiplayerReportMessage] = useState("");
  const [mineListLimit, setMineListLimit] = useState(4);
  const [availableListLimit, setAvailableListLimit] = useState(4);
  const [hostedListLimit, setHostedListLimit] = useState(3);
  const [historyListLimit, setHistoryListLimit] = useState(3);
  const [createName, setCreateName] = useState("");
  const [createInviteCopy, setCreateInviteCopy] = useState(MULTIPLAYER_DEFAULT_INVITE_COPY);
  const [createInviteMode, setCreateInviteMode] = useState<"public" | "private-key">("public");
  const [createProviderMode, setCreateProviderMode] = useState<"both" | "lichess" | "chesscom">("both");
  const [createStartAt, setCreateStartAt] = useState(() => new Date());
  const [createEndAt, setCreateEndAt] = useState(() => dateFromGroupQuestValue(defaultGroupQuestEndAtIso(7)));
  const [createRules, setCreateRules] = useState<Record<string, string>>({ timeControl: "Any time control", rated: "Any rated state", color: "Any color" });
  const [createQuestIds, setCreateQuestIds] = useState<string[]>(bootstrap.challenges.slice(0, 3).map((challenge) => challenge.id));
  const createQuestChoices = useMemo(() => getMultiplayerQuestChoices(bootstrap.challenges, signedInAccount?.customSideQuests ?? []), [bootstrap.challenges, signedInAccount?.customSideQuests]);

  useEffect(() => {
    if (!pendingCreateOpen) return;
    const timer = setTimeout(() => {
      if (pendingCreateQuestId && createQuestChoices.some((choice) => choice.id === pendingCreateQuestId)) {
        setCreateQuestIds((current) => [pendingCreateQuestId, ...current.filter((id) => id !== pendingCreateQuestId)].slice(0, 4));
        const selectedQuest = createQuestChoices.find((choice) => choice.id === pendingCreateQuestId);
        if (selectedQuest) {
          setCreateName((current) => current.trim() ? current : `Multiplayer: ${selectedQuest.title}`.slice(0, 80));
        }
      }
      setCreateOpen(true);
      onConsumePendingCreateOpen?.();
    }, 0);
    return () => clearTimeout(timer);
  }, [createQuestChoices, onConsumePendingCreateOpen, pendingCreateOpen, pendingCreateQuestId]);

  const overviewSteps = [
    {
      title: "Create",
      copy: "Pick one or more Side Quests, set the proof window, choose invite rules, and lock the Multiplayer Side Quest constraints.",
      href: "/groupquests/create",
    },
    {
      title: "Invite",
      copy: "Share the invite link so players can inspect the Side Quests, proof window, and join conditions before committing.",
    },
    {
      title: "Play",
      copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the Multiplayer Side Quest rules.",
    },
    {
      title: "Prove",
      copy: "Each Multiplayer Side Quest gets its own leaderboard, event feed, and proof that stays separate from solo progress.",
    },
  ];
  async function runGroupQuestAction(groupQuestId: string, action: "join" | "leave" | "refresh" | "update" | "remove-participant", payload?: Record<string, unknown>) {
    if (!authBridge.isSignedIn) {
      showNativeOnlyNotice("Sign in to manage Multiplayer Side Quests in the app.");
      return;
    }

    setGroupQuestActionState({ busy: true, questId: groupQuestId, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileGroupQuestAction({ sessionToken, groupQuestId, action, payload });
      await Promise.resolve(onAccountUpdated());
      if (action === "join" || action === "leave" || action === "update" || action === "remove-participant") {
        await waitMs(450);
        await Promise.resolve(onAccountUpdated());
      }
      setGroupQuestActionState({ busy: false, questId: groupQuestId, message: result.message, error: null });

      if (action === "join") {
        setOfficialMultiplayerId(groupQuestId);
        setPublicMultiplayerId(groupQuestId);
        setJoinedMultiplayerId(null);
      }

      if (action === "leave") {
        setJoinedMultiplayerId((current) => current === groupQuestId ? null : current);
        setOfficialMultiplayerId((current) => current === groupQuestId ? null : current);
        setPublicMultiplayerId((current) => current === groupQuestId ? null : current);
      }
    } catch (caught) {
      setGroupQuestActionState({
        busy: false,
        questId: groupQuestId,
        message: null,
        error: caught instanceof Error ? caught.message : "Could not update this Multiplayer Side Quest.",
      });
    }
  }

  async function createGroupQuest() {
    if (!authBridge.isSignedIn) {
      showNativeOnlyNotice("Sign in to create Multiplayer Side Quests in the app.");
      return;
    }

    const trimmedName = createName.trim();
    if (!trimmedName) {
      setGroupQuestActionState({ busy: false, questId: "new", message: null, error: "Add a Multiplayer Side Quest name before creating." });
      return;
    }

    setGroupQuestActionState({ busy: true, questId: "new", message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileGroupQuestAction({
        sessionToken,
        groupQuestId: "new",
        action: "create",
        payload: {
          name: trimmedName,
          inviteCopy: createInviteCopy,
          inviteMode: createInviteMode,
          questIds: createQuestIds.length ? createQuestIds : [bootstrap.challenges[0]?.id].filter(Boolean),
          providerMode: createProviderMode,
          startAt: createStartAt.toISOString(),
          endAt: createEndAt.toISOString(),
          rules: createRules,
        },
      });
      const createdGroupQuestId = result.groupQuestId ?? "new";
      setCreateOpen(false);
      await Promise.resolve(onAccountUpdated());
      await waitMs(450);
      await Promise.resolve(onAccountUpdated());
      setGroupQuestActionState({ busy: false, questId: createdGroupQuestId, message: result.message, error: null });
      if (result.groupQuestId) {
        setJoinedMultiplayerId(result.groupQuestId);
        setOfficialMultiplayerId(null);
        setPublicMultiplayerId(null);
      }
    } catch (caught) {
      setGroupQuestActionState({ busy: false, questId: "new", message: null, error: caught instanceof Error ? caught.message : "Could not create Multiplayer Side Quest." });
    }
  }

  async function joinByInviteKey() {
    const key = inviteKey.trim();
    if (!key) {
      setGroupQuestActionState({ busy: false, questId: "invite", message: null, error: "Paste a private invite code first." });
      return;
    }
    await runGroupQuestAction("invite", "join", { inviteKey: key });
  }

  function toggleCreateQuestId(questId: string) {
    setCreateQuestIds((current) => current.includes(questId) ? current.filter((id) => id !== questId) : [...current, questId].slice(0, 4));
  }

  const allCommunityMultiplayerQuests = [...publicUserGroupQuests, ...closedPublicUserGroupQuests]
    .filter((quest, index, all) => all.findIndex((entry) => entry.id === quest.id) === index);
  const joinablePublicUserGroupQuests = publicUserGroupQuests.filter((quest) => quest.joinState !== "Joined" && quest.status !== "Finished");
  const joinedActiveGroupQuests = activeGroupQuests.filter((quest) => !quest.isOwner && quest.status !== "Finished");
  const hostedActiveGroupQuests = activeGroupQuests.filter((quest) => Boolean(quest.isOwner) && quest.status !== "Finished");
  const joinedPublicUserGroupQuests = publicUserGroupQuests.filter((quest) => quest.joinState === "Joined" && !quest.isOwner && quest.status !== "Finished" && !activeGroupQuests.some((activeQuest) => activeQuest.id === quest.id));
  const hostedPublicUserGroupQuests = publicUserGroupQuests.filter((quest) => Boolean(quest.isOwner) && quest.status !== "Finished" && !activeGroupQuests.some((activeQuest) => activeQuest.id === quest.id));
  const finishedPublicUserGroupQuests = closedPublicUserGroupQuests;
  const joinedBrowseGroupQuests = [...joinedActiveGroupQuests, ...hostedActiveGroupQuests, ...joinedPublicUserGroupQuests, ...hostedPublicUserGroupQuests].filter((quest, index, all) => all.findIndex((entry) => entry.id === quest.id) === index);
  const hostedBrowseGroupQuests = [...hostedActiveGroupQuests, ...hostedPublicUserGroupQuests].filter((quest, index, all) => all.findIndex((entry) => entry.id === quest.id) === index);
  const sortLobbyGroupQuests = <T extends { startAt?: string | null; endAt?: string | null }>(quests: T[]) => [...quests].sort((a, b) => Date.parse(b.startAt ?? b.endAt ?? "") - Date.parse(a.startAt ?? a.endAt ?? ""));
  const activeMineGroupQuests = sortLobbyGroupQuests(joinedBrowseGroupQuests);
  const availableGroupQuests = allCommunityMultiplayerQuests
    .filter((quest) => multiplayerQuestMatchesSearch(quest, multiplayerCommunitySearch))
    .filter((quest) => !multiplayerHostFilter || quest.hostName === multiplayerHostFilter)
    .filter((quest) => {
      if (multiplayerCommunityFilter === "open") return quest.status !== "Finished";
      if (multiplayerCommunityFilter === "joined") return quest.joinState === "Joined" && !quest.isOwner;
      if (multiplayerCommunityFilter === "hosted") return Boolean(quest.isOwner);
      if (multiplayerCommunityFilter === "finished") return quest.status === "Finished";
      return true;
    })
    .sort((a, b) => {
      if (multiplayerCommunitySort === "players") return Number.parseInt(b.playersLabel ?? "0", 10) - Number.parseInt(a.playersLabel ?? "0", 10);
      const aTime = getMultiplayerCommunitySortTime(a, multiplayerCommunitySort);
      const bTime = getMultiplayerCommunitySortTime(b, multiplayerCommunitySort);
      return multiplayerCommunitySort === "closing" ? aTime - bTime : bTime - aTime;
    });
  const hostedLobbyGroupQuests = sortLobbyGroupQuests(hostedBrowseGroupQuests);
  const historyGroupQuests = sortLobbyGroupQuests(closedUserGroupQuests);
  const visibleMineGroupQuests = activeMineGroupQuests.slice(0, mineListLimit);
  const visibleAvailableGroupQuests = availableGroupQuests.slice(0, availableListLimit);
  const visibleHostedGroupQuests = hostedLobbyGroupQuests.slice(0, hostedListLimit);
  const visibleHistoryGroupQuests = historyGroupQuests.slice(0, historyListLimit);
  const hiddenMineCount = Math.max(0, activeMineGroupQuests.length - visibleMineGroupQuests.length);
  const hiddenAvailableCount = Math.max(0, availableGroupQuests.length - visibleAvailableGroupQuests.length);
  const hiddenHostedCount = Math.max(0, hostedLobbyGroupQuests.length - visibleHostedGroupQuests.length);
  const hiddenHistoryCount = Math.max(0, historyGroupQuests.length - visibleHistoryGroupQuests.length);

  function openBrowseGroupQuest(groupQuestId: string) {
    if ([...activeGroupQuests, ...closedUserGroupQuests].some((quest) => quest.id === groupQuestId)) {
      setJoinedMultiplayerId(groupQuestId);
      return;
    }
    setPublicMultiplayerId(groupQuestId);
  }

  function openMultiplayerHostShelf(quest: MobileGroupQuestSummary) {
    if (!quest.hostName) return;
    setMultiplayerHostFilter(quest.hostName);
    setMultiplayerCommunityFilter("all");
    setPublicMultiplayerId(null);
    setJoinedMultiplayerId(null);
  }

  function openMultiplayerReport(quest: MobileGroupQuestSummary) {
    const hostLine = quest.hostName ? `Host: ${quest.hostName}` : "Host: unknown";
    const statusLine = quest.status ? `Status: ${quest.status}` : "Status: unknown";
    setMultiplayerReportMessage([
      "Report Community Multiplayer Side Quest",
      `Quest: ${cleanMultiplayerTitle(quest.title)}`,
      `Quest ID: ${quest.id}`,
      hostLine,
      statusLine,
      "Issue: ",
    ].join("\n"));
    setMultiplayerReportOpen(true);
  }

  return (
    <View style={styles.screenStack}>
      <View style={styles.multiplayerLobbyHero}>
        <Image source={{ uri: absoluteAssetUrl("/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png") }} style={styles.multiplayerLobbyHeroGraphic} resizeMode="contain" />
        <Text style={styles.multiplayerLobbyHeroTitle}>Multiplayer Lobby</Text>
        <Text style={styles.sectionBody}>Join, host, refresh proof, check standings, and manage Multiplayer Side Quests here. The website has the same Multiplayer product surface in a wider layout.</Text>
      </View>


      <JoinedMultiplayerQuestModal
        key={joinedMultiplayerQuest?.id ?? "joined"}
        visible={Boolean(joinedMultiplayerQuest)}
        quest={joinedMultiplayerQuest}
        challenges={bootstrap.challenges}
        mode="joined"
        busy={groupQuestActionState.busy && groupQuestActionState.questId === joinedMultiplayerQuest?.id}
        message={groupQuestActionState.questId === joinedMultiplayerQuest?.id ? groupQuestActionState.message : null}
        error={groupQuestActionState.questId === joinedMultiplayerQuest?.id ? groupQuestActionState.error : null}
        onClose={() => setJoinedMultiplayerId(null)}
        onRefresh={() => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "refresh") : undefined}
        onLeave={() => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "leave") : undefined}
        onUpdate={(payload) => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "update", payload) : undefined}
        onRemoveParticipant={(participantUserId) => joinedMultiplayerQuest ? void runGroupQuestAction(joinedMultiplayerQuest.id, "remove-participant", { participantUserId }) : undefined}
        onReport={openMultiplayerReport}
        onViewHost={openMultiplayerHostShelf}
      />

      <JoinedMultiplayerQuestModal
        key={officialMultiplayerQuest?.id ?? "official"}
        visible={Boolean(officialMultiplayerQuest)}
        quest={officialMultiplayerQuest}
        challenges={bootstrap.challenges}
        customQuests={signedInAccount?.customSideQuests ?? []}
        mode={officialMultiplayerQuest?.joinState === "Joined" ? "joined" : "public"}
        busy={groupQuestActionState.busy && groupQuestActionState.questId === officialMultiplayerQuest?.id}
        message={groupQuestActionState.questId === officialMultiplayerQuest?.id ? groupQuestActionState.message : null}
        error={groupQuestActionState.questId === officialMultiplayerQuest?.id ? groupQuestActionState.error : null}
        onClose={() => setOfficialMultiplayerId(null)}
        onRefresh={() => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "refresh") : undefined}
        onLeave={() => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "leave") : undefined}
        onJoin={() => officialMultiplayerQuest && officialMultiplayerQuest.status !== "Finished" ? void runGroupQuestAction(officialMultiplayerQuest.id, "join") : undefined}
        onUpdate={(payload) => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "update", payload) : undefined}
        onRemoveParticipant={(participantUserId) => officialMultiplayerQuest ? void runGroupQuestAction(officialMultiplayerQuest.id, "remove-participant", { participantUserId }) : undefined}
        onReport={openMultiplayerReport}
      />

      <JoinedMultiplayerQuestModal
        key={publicMultiplayerQuest?.id ?? "public"}
        visible={Boolean(publicMultiplayerQuest)}
        quest={publicMultiplayerQuest}
        challenges={bootstrap.challenges}
        customQuests={signedInAccount?.customSideQuests ?? []}
        mode={publicMultiplayerQuest?.joinState === "Joined" ? "joined" : "public"}
        busy={groupQuestActionState.busy && groupQuestActionState.questId === publicMultiplayerQuest?.id}
        message={groupQuestActionState.questId === publicMultiplayerQuest?.id ? groupQuestActionState.message : null}
        error={groupQuestActionState.questId === publicMultiplayerQuest?.id ? groupQuestActionState.error : null}
        onClose={() => setPublicMultiplayerId(null)}
        onRefresh={() => publicMultiplayerQuest ? void runGroupQuestAction(publicMultiplayerQuest.id, "refresh") : undefined}
        onLeave={() => publicMultiplayerQuest ? void runGroupQuestAction(publicMultiplayerQuest.id, "leave") : undefined}
        onJoin={() => publicMultiplayerQuest && publicMultiplayerQuest.status !== "Finished" ? void runGroupQuestAction(publicMultiplayerQuest.id, "join") : undefined}
        onUpdate={(payload) => publicMultiplayerQuest ? void runGroupQuestAction(publicMultiplayerQuest.id, "update", payload) : undefined}
        onRemoveParticipant={(participantUserId) => publicMultiplayerQuest ? void runGroupQuestAction(publicMultiplayerQuest.id, "remove-participant", { participantUserId }) : undefined}
        onReport={openMultiplayerReport}
        onViewHost={openMultiplayerHostShelf}
      />

      <HelpSupportModal key={multiplayerReportMessage || "multiplayer-report"} visible={multiplayerReportOpen} onClose={() => setMultiplayerReportOpen(false)} signedIn={signedInAccount} authBridge={authBridge} initialMessage={multiplayerReportMessage} />

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Your Multiplayer Side Quests">
        <Text style={styles.eyebrow}>Your Multiplayer Side Quests · {activeMineGroupQuests.length}</Text>
        <Text style={styles.sectionTitle}>Hosted and joined by you.</Text>
        <Text style={styles.sectionBody}>Your own Multiplayer Side Quests stay separate from official events and community browsing. This is your fast action queue.</Text>
        {visibleMineGroupQuests.length ? (
          <View style={compactStyles.appRows}>
            {visibleMineGroupQuests.map((quest) => (
              <AppRow key={quest.id} title={cleanMultiplayerTitle(quest.title)} meta={getJoinedMultiplayerListMeta(quest)} status={quest.isOwner ? "Hosting" : getJoinedMultiplayerListStatus(quest)} sourceBadge={quest.isOwner ? "Hosted by you" : "Joined"} imageSource={SQC_MULTIPLAYER_SEAL_ASSET} variant="seal" onPress={() => openBrowseGroupQuest(quest.id)} />
            ))}
          </View>
        ) : (
          <View style={styles.multiplayerLobbyEmptyCard}>
            <Text style={styles.sideQuestModeTitle}>No active Multiplayer Side Quests yet.</Text>
            <Text style={styles.sideQuestModeCopy}>Join an open Multiplayer Side Quest, paste an invite code, or create your own.</Text>
          </View>
        )}
        {hiddenMineCount ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Show more of my Multiplayer Side Quests" style={styles.secondaryButtonWide} onPress={() => setMineListLimit((current) => current + 4)}>
            <Text style={styles.secondaryButtonText}>More my quests ({hiddenMineCount})</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="SQC Official Multiplayer Side Quests">
        <Text style={styles.eyebrow}>SQC Official · {officialPublicGroupQuests.length}</Text>
        <Text style={styles.sectionTitle}>SQC Official Multiplayer Side Quests.</Text>
        <Text style={styles.sectionBody}>Curated SQC events and official leaderboards stay in their own trusted lane.</Text>
        {officialPublicGroupQuests.length ? (
          <View style={compactStyles.appRows}>
            {officialPublicGroupQuests.map((quest) => (
              <AppRow key={quest.id} title={cleanMultiplayerTitle(quest.title)} meta={getOfficialMultiplayerListMeta(quest)} status={getOfficialMultiplayerListStatus(quest)} sourceBadge="SQC Official" imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => setOfficialMultiplayerId(quest.id)} />
            ))}
          </View>
        ) : <Text style={styles.sectionBody}>No official Multiplayer Side Quests are open right now.</Text>}
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Community Multiplayer Side Quests">
        <Text style={styles.eyebrow}>Community · {availableGroupQuests.length}/{allCommunityMultiplayerQuests.length}</Text>
        <Text style={styles.sectionTitle}>Community Multiplayer Side Quests.</Text>
        <Text style={styles.sectionBody}>Search public user-hosted Multiplayer Side Quests when you are ready to join. App and website both support discovery, inspection, joining, and proof; this view keeps it native and compact.</Text>
        <View style={compactStyles.communityBrowsePanel}>
          {multiplayerHostFilter ? (
            <View style={compactStyles.communityEmptyPanel}>
              <Text style={compactStyles.communityEmptyTitle}>Host shelf: {multiplayerHostFilter}</Text>
              <Text style={compactStyles.communityEmptyCopy}>Showing public Community Multiplayer Side Quests from this host only. Private invite-only tables and account details stay hidden.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Show all Multiplayer hosts" style={compactStyles.secondaryAction} onPress={() => setMultiplayerHostFilter(null)}>
                <Text style={compactStyles.secondaryActionText}>Show all hosts</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={compactStyles.communitySearchBox}>
            <MaterialCommunityIcons name="magnify" size={18} color="rgba(255,247,232,.52)" />
            <TextInput
              value={multiplayerCommunitySearch}
              placeholder={multiplayerHostFilter ? "Search this host shelf" : "Search multiplayer community"}
              placeholderTextColor="rgba(255,247,232,.42)"
              autoCapitalize="none"
              autoCorrect={false}
              style={compactStyles.communitySearchInput}
              onChangeText={setMultiplayerCommunitySearch}
            />
            {multiplayerCommunitySearch || multiplayerHostFilter ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear multiplayer community search" onPress={() => { setMultiplayerCommunitySearch(""); setMultiplayerHostFilter(null); }}>
                <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,247,232,.5)" />
              </Pressable>
            ) : null}
          </View>
          <View style={compactStyles.communityControlsStack}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={compactStyles.communityChipRow}>
              {(["open", "all", "joined", "hosted", "finished"] as MultiplayerCommunityFilter[]).map((filter) => (
                <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: multiplayerCommunityFilter === filter }} style={[compactStyles.communityChip, multiplayerCommunityFilter === filter && compactStyles.communityChipActive]} onPress={() => setMultiplayerCommunityFilter(filter)}>
                  <Text style={[compactStyles.communityChipText, multiplayerCommunityFilter === filter && compactStyles.communityChipTextActive]}>{filter === "all" ? "All" : filter === "open" ? "Open" : filter === "joined" ? "Joined" : filter === "hosted" ? "Hosted" : "Finished"}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable accessibilityRole="button" accessibilityLabel="Change multiplayer community sort" style={compactStyles.communitySortCompact} onPress={() => setMultiplayerCommunitySort(multiplayerCommunitySort === "closing" ? "newest" : multiplayerCommunitySort === "newest" ? "players" : "closing")}>
              <Text style={compactStyles.communitySortCompactText}>{multiplayerCommunitySort === "closing" ? "Sort: Closing" : multiplayerCommunitySort === "newest" ? "Sort: New" : "Sort: Players"}</Text>
            </Pressable>
          </View>
        </View>
        {visibleAvailableGroupQuests.length ? (
          <View style={compactStyles.appRows}>
            {visibleAvailableGroupQuests.map((quest) => (
              <AppRow key={quest.id} title={cleanMultiplayerTitle(quest.title)} meta={getOfficialMultiplayerListMeta(quest)} status={getOfficialMultiplayerListStatus(quest)} sourceBadge="Community" imageSource={SQC_MULTIPLAYER_SEAL_ASSET} variant="seal" onPress={() => openBrowseGroupQuest(quest.id)} />
            ))}
          </View>
        ) : <Text style={styles.sectionBody}>{allCommunityMultiplayerQuests.length ? multiplayerHostFilter ? "No public Community Multiplayer Side Quests match this host shelf/search. Nothing private is shown from guessed host context." : "No community Multiplayer Side Quests match this search/filter." : "No public community Multiplayer Side Quests right now."}</Text>}
        {hiddenAvailableCount ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Show more open Multiplayer Side Quests" style={styles.secondaryButtonWide} onPress={() => setAvailableListLimit((current) => current + 4)}>
            <Text style={styles.secondaryButtonText}>More community Side Quests ({hiddenAvailableCount})</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.groupquestsActionCard} accessibilityLabel="Join private Multiplayer Side Quest">
        <Text style={styles.eyebrow}>Invite Code</Text>
        <Text style={styles.sideQuestModeTitle}>Join private Multiplayer Side Quest.</Text>
        <Text style={styles.sideQuestModeCopy}>Paste an invite code from the host to join a private Multiplayer Side Quest.</Text>
        <View style={styles.inputStack}>
          <Text style={styles.inputLabel}>Invite code</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} value={inviteKey} placeholder="e.g. nocastle-ab12cd" placeholderTextColor="rgba(255,247,232,.42)" style={styles.textInput} onChangeText={setInviteKey} />
        </View>
        <Pressable accessibilityRole="button" style={styles.secondaryButtonWide} accessibilityLabel="Join private Multiplayer Side Quest" disabled={groupQuestActionState.busy && groupQuestActionState.questId === "invite"} onPress={() => void joinByInviteKey()}>
          <Text style={styles.secondaryButtonText}>{groupQuestActionState.busy && groupQuestActionState.questId === "invite" ? "Joining..." : "Join with code"}</Text>
        </Pressable>
        {groupQuestActionState.questId === "invite" && groupQuestActionState.error ? <Text style={styles.errorCopy}>{groupQuestActionState.error}</Text> : null}
        {groupQuestActionState.questId === "invite" && groupQuestActionState.message ? <Text style={styles.successCopy}>{groupQuestActionState.message}</Text> : null}
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Create Multiplayer Side Quest">
        <Text style={styles.eyebrow}>Create</Text>
        <Text style={styles.sectionTitle}>Host a Community Multiplayer Side Quest.</Text>
        <Text style={styles.sectionBody}>Your hosted Multiplayer Side Quests appear under Your Multiplayer Side Quests, not in SQC Official.</Text>
        <Pressable accessibilityRole="button" style={styles.centeredPrimaryButton} accessibilityLabel="Create a New Multiplayer Side Quest" disabled={!authBridge.isSignedIn} onPress={() => setCreateOpen(true)}>
          <Text style={styles.primaryButtonText}>Create a New Multiplayer Side Quest</Text>
        </Pressable>
        {!authBridge.isSignedIn ? <Text style={styles.microcopy}>Sign in first to create or join Multiplayer Side Quests.</Text> : null}
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Finished Multiplayer Side Quests">
        <Text style={styles.eyebrow}>History · {historyGroupQuests.length}</Text>
        <Text style={styles.sectionTitle}>Finished Multiplayer Side Quests.</Text>
        {visibleHistoryGroupQuests.length ? (
          <View style={compactStyles.appRows}>
            {visibleHistoryGroupQuests.map((quest) => (
              <AppRow key={quest.id} title={cleanMultiplayerTitle(quest.title)} meta={getOfficialMultiplayerListMeta(quest)} status={getOfficialMultiplayerListStatus(quest)} imageSource={SQC_MULTIPLAYER_SEAL_ASSET} variant="seal" onPress={() => openBrowseGroupQuest(quest.id)} />
            ))}
          </View>
        ) : <Text style={styles.sectionBody}>No finished Multiplayer Side Quests yet.</Text>}
        {hiddenHistoryCount ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Show more finished Multiplayer Side Quests" style={styles.secondaryButtonWide} onPress={() => setHistoryListLimit((current) => current + 3)}>
            <Text style={styles.secondaryButtonText}>More history ({hiddenHistoryCount})</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal visible={createOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setCreateOpen(false)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close create Multiplayer Side Quest" style={compactStyles.detailCloseButton} onPress={() => setCreateOpen(false)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={compactStyles.multiplayerDetailHero}>
              <Image source={SQC_MULTIPLAYER_SEAL_ASSET} style={compactStyles.multiplayerDetailSeal} resizeMode="contain" />
              <Text style={compactStyles.multiplayerDetailKicker}>Create Multiplayer</Text>
              <Text style={compactStyles.detailTitle}>Start a shared Multiplayer Side Quest.</Text>
              <Text style={compactStyles.detailGoal}>Choose the rules, create the Multiplayer Side Quest, then share the invite with players.</Text>
            </View>
            <View style={compactStyles.multiplayerNativeCard}>
              <Text style={styles.inputLabel}>Quest name</Text>
              <TextInput value={createName} placeholder="Name this Multiplayer Side Quest" placeholderTextColor="rgba(255,247,232,.42)" style={styles.textInput} onChangeText={setCreateName} />
              <Text style={styles.microcopy}>Required. Make it clear enough that players know what they are joining.</Text>
              <Text style={styles.inputLabel}>Intro text</Text>
              <TextInput value={createInviteCopy} multiline placeholder="Explain what players are joining..." placeholderTextColor="rgba(255,247,232,.42)" style={[styles.textInput, styles.textAreaInput]} onChangeText={setCreateInviteCopy} />
              <Text style={styles.microcopy}>Shown to players before they join.</Text>
              <Text style={styles.inputLabel}>Access</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {(["public", "private-key"] as const).map((mode) => {
                  const selected = createInviteMode === mode;
                  const copy = getInviteModeOptionCopy(mode);
                  return (
                    <Pressable key={mode} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCreateInviteMode(mode)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{copy.title}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{copy.helper}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.inputLabel}>Games allowed</Text>
              <View style={compactStyles.multiplayerOptionGrid}>
                {MULTIPLAYER_PROVIDER_MODES.map((mode) => {
                  const selected = createProviderMode === mode.id;
                  const title = mode.id === "both" ? "Both" : mode.id === "lichess" ? "Lichess" : "Chess.com";
                  const helper = mode.id === "both" ? "Players can use either site" : mode.id === "lichess" ? "Only public Lichess games" : "Only public Chess.com games";
                  return (
                    <Pressable key={mode.id} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCreateProviderMode(mode.id)}>
                      <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                      <View style={compactStyles.multiplayerOptionCopy}>
                        <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{title}</Text>
                        <Text style={compactStyles.multiplayerOptionHelper}>{helper}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <GroupQuestDateTimeControl label="Start" value={createStartAt} onChange={setCreateStartAt} />
              <GroupQuestDateTimeControl label="End" value={createEndAt} onChange={setCreateEndAt} />
              <Text style={styles.inputLabel}>Quick duration</Text>
              <GroupQuestDurationChips startAt={createStartAt} onChangeEndAt={setCreateEndAt} />
              <Text style={styles.microcopy}>Dates save as your local time. No typing needed.</Text>
              <Text style={styles.inputLabel}>Game settings</Text>
              {Object.entries(MULTIPLAYER_RULE_OPTIONS).map(([ruleId, options]) => (
                <View key={ruleId} style={compactStyles.multiplayerListStack}>
                  <Text style={compactStyles.multiplayerRuleLabel}>{ruleId === "timeControl" ? "Time control" : ruleId === "rated" ? "Rated setting" : "Player color"}</Text>
                  <View style={compactStyles.multiplayerOptionGrid}>
                    {options.map((option) => {
                      const selected = createRules[ruleId] === option;
                      const copy = getMultiplayerRuleOptionCopy(ruleId, option);
                      return (
                        <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected }} style={[compactStyles.multiplayerOptionCard, selected ? compactStyles.multiplayerOptionCardSelected : null]} onPress={() => setCreateRules((current) => ({ ...current, [ruleId]: option }))}>
                          <View style={[compactStyles.multiplayerOptionDot, selected ? compactStyles.multiplayerOptionDotSelected : null]} />
                          <View style={compactStyles.multiplayerOptionCopy}>
                            <Text style={selected ? compactStyles.multiplayerOptionTitleSelected : compactStyles.multiplayerOptionTitle}>{copy.title}</Text>
                            <Text style={compactStyles.multiplayerOptionHelper}>{copy.helper}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
            <View style={compactStyles.multiplayerNativeCard}>
              <Text style={compactStyles.multiplayerCardEyebrow}>Included Side Quests</Text>
              <Text style={compactStyles.multiplayerCardTitle}>Choose up to four.</Text>
              <View style={compactStyles.appRows}>
                {createQuestChoices.map((choice) => (
                  <AppRow
                    key={choice.id}
                    title={choice.title}
                    meta={choice.meta}
                    status={createQuestIds.includes(choice.id) ? "Included" : choice.status}
                    sourceBadge={choice.sourceBadge}
                    imageSource={choice.imageSource}
                    onPress={() => toggleCreateQuestId(choice.id)}
                  />
                ))}
              </View>
            </View>
            {groupQuestActionState.questId === "new" && groupQuestActionState.error ? <Text style={compactStyles.inlineError}>{groupQuestActionState.error}</Text> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Create Multiplayer Side Quest now" style={[compactStyles.detailPrimaryButton, groupQuestActionState.busy && groupQuestActionState.questId === "new" ? compactStyles.disabledAction : null]} disabled={groupQuestActionState.busy && groupQuestActionState.questId === "new"} onPress={() => void createGroupQuest()}>
              <Text style={compactStyles.detailPrimaryButtonText}>{groupQuestActionState.busy && groupQuestActionState.questId === "new" ? "Creating..." : "Create and join"}</Text>
            </Pressable>
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>

      <View style={styles.groupquestsStoryCard} accessibilityLabel="What Multiplayer Side Quests are">
        <View style={styles.groupquestsStoryCopy}>
          <Text style={styles.sectionTitle}>A tiny chess tournament for bad ideas.</Text>
          <Text style={styles.sectionBody}>One player creates the Multiplayer Side Quest, everyone agrees on rules, then SQC checks fresh public games for each player.</Text>
        </View>
        <View style={styles.groupquestsProcessGraphic}>
          <Image source={{ uri: absoluteAssetUrl("/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png") }} style={styles.groupquestsKnightArt} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.groupquestsHowCard} accessibilityLabel="How Multiplayer Side Quests work">
        <View style={styles.sectionHeadMobile}>
          <Text style={styles.sectionTitle}>Create. Invite. Play. Prove.</Text>
        </View>
        <View style={styles.groupquestsHowGrid}>
          {overviewSteps.map((step, index) => (
            <View key={step.title} style={styles.groupquestsHowStep}>
              <Text style={styles.groupquestsHowNumber}>{index + 1}</Text>
              <Text style={styles.groupquestsHowTitle}>{step.title}</Text>
              <Text style={styles.groupquestsHowCopy}>{step.copy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.groupquestsRulesCard} accessibilityLabel="Multiplayer Side Quest completion rules">
        <Text style={styles.eyebrow}>Proof rule</Text>
        <Text style={styles.sectionTitle}>Personal proof and multiplayer proof are different ledgers.</Text>
        <Text style={styles.sectionBody}>Finishing a Side Quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, Multiplayer Side Quest score, and multiplayer celebration.</Text>
      </View>

    </View>
  );
}

function OfficialMultiplayerLeaderboardsScreen({ bootstrap, account, authBridge, onSelectTab, onAccountUpdated }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; authBridge: MobileAuthBridge; onSelectTab: (tab: AppTab) => void; onAccountUpdated: AccountUpdatedCallback }) {
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const currentOfficialGroupQuests = signedInAccount?.officialPublicGroupQuests ?? [];
  const previousOfficialGroupQuests = signedInAccount?.previousOfficialGroupQuests ?? [];
  const officialWeeks = signedInAccount?.officialGroupQuestWeeks ?? [];
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [groupQuestActionState, setGroupQuestActionState] = useState<{ busy: boolean; questId: string | null; message: string | null; error: string | null }>({ busy: false, questId: null, message: null, error: null });
  const allOfficialQuests = [...currentOfficialGroupQuests, ...previousOfficialGroupQuests, ...officialWeeks.flatMap((week) => week.quests)];
  const selectedQuest = selectedQuestId ? allOfficialQuests.find((quest) => quest.id === selectedQuestId) ?? null : null;
  const selectedWeek = selectedWeekId ? officialWeeks.find((week) => week.id === selectedWeekId) ?? null : null;

  async function runGroupQuestAction(groupQuestId: string, action: "join" | "leave" | "refresh" | "update" | "remove-participant", payload?: Record<string, unknown>) {
    if (!authBridge.isSignedIn) {
      showNativeOnlyNotice("Sign in to manage Official Multiplayer Side Quests in the app.");
      return;
    }

    setGroupQuestActionState({ busy: true, questId: groupQuestId, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileGroupQuestAction({ sessionToken, groupQuestId, action, payload });
      await Promise.resolve(onAccountUpdated());
      if (action === "join" || action === "leave" || action === "update" || action === "remove-participant") {
        await waitMs(450);
        await Promise.resolve(onAccountUpdated());
      }
      setGroupQuestActionState({ busy: false, questId: groupQuestId, message: result.message, error: null });
    } catch (caught) {
      setGroupQuestActionState({ busy: false, questId: groupQuestId, message: null, error: caught instanceof Error ? caught.message : "Could not update this Official Multiplayer Side Quest." });
    }
  }

  if (!signedInAccount) {
    return (
      <View style={styles.screenStack}>
        <View style={styles.groupquestsHero}>
          <Text style={styles.groupquestsHeroTitle}>Official Leaderboards.</Text>
          <Text style={styles.groupquestsHeroCopy}>Sign in to see active official weekly leaderboards, final results, and the official archive.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screenStack}>
      <View style={styles.groupquestsHero}>
        <Text style={styles.groupquestsHeroTitle}>Official Leaderboards.</Text>
        <Text style={styles.groupquestsHeroCopy}>Three official Multiplayer Side Quests run every week — easy, medium, and hard. Track the live race, then review final weekly results.</Text>
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Current official Multiplayer Side Quest leaderboards">
        <Text style={styles.eyebrow}>Current week</Text>
        <Text style={styles.sectionTitle}>Active official leaderboards.</Text>
        {currentOfficialGroupQuests.length ? currentOfficialGroupQuests.map((quest) => (
          <Pressable key={quest.id} accessibilityRole="button" accessibilityLabel={`Open current official leaderboard ${cleanMultiplayerTitle(quest.title)}`} style={styles.groupquestsActiveRow} onPress={() => setSelectedQuestId(quest.id)}>
            <Image source={SQC_BLACK_SEAL_ASSET} style={styles.activeMultiplayerSeal} resizeMode="contain" />
            <View style={styles.activeMultiplayerCopy}>
              <Text style={styles.activeMultiplayerTitle}>{cleanMultiplayerTitle(quest.title)}</Text>
              <Text style={styles.activeMultiplayerMeta}>{getOfficialMultiplayerListStatus(quest)} · {getOfficialMultiplayerListMeta(quest)}</Text>
            </View>
          </Pressable>
        )) : <Text style={styles.sectionBody}>No official leaderboards are active right now.</Text>}
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Previous official Multiplayer Side Quest results">
        <Text style={styles.eyebrow}>Previous week</Text>
        <Text style={styles.sectionTitle}>Latest final results.</Text>
        {previousOfficialGroupQuests.length ? previousOfficialGroupQuests.map((quest) => (
          <Pressable key={quest.id} accessibilityRole="button" accessibilityLabel={`Open previous official result ${cleanMultiplayerTitle(quest.title)}`} style={styles.groupquestsActiveRow} onPress={() => setSelectedQuestId(quest.id)}>
            <Image source={SQC_BLACK_SEAL_ASSET} style={styles.activeMultiplayerSeal} resizeMode="contain" />
            <View style={styles.activeMultiplayerCopy}>
              <Text style={styles.activeMultiplayerTitle}>{cleanMultiplayerTitle(quest.title)}</Text>
              <Text style={styles.activeMultiplayerMeta}>Final · {quest.playersLabel ?? "Players pending"} · {quest.leaderboardRows?.[0]?.name ? `Winner: ${quest.leaderboardRows[0].name}` : "Podium pending"}</Text>
            </View>
          </Pressable>
        )) : <Text style={styles.sectionBody}>Final results will appear here after the first official weekly set closes.</Text>}
      </View>

      <View style={styles.groupquestsActiveCard} accessibilityLabel="Official Multiplayer Side Quest weekly archive">
        <Text style={styles.eyebrow}>Archive</Text>
        <Text style={styles.sectionTitle}>Browse older official weeks.</Text>
        {officialWeeks.length ? officialWeeks.map((week) => (
          <Pressable key={week.id} accessibilityRole="button" accessibilityLabel={`Open official results for ${week.label}`} style={styles.groupquestsActiveRow} onPress={() => setSelectedWeekId(week.id)}>
            <Image source={SQC_BLACK_SEAL_ASSET} style={styles.activeMultiplayerSeal} resizeMode="contain" />
            <View style={styles.activeMultiplayerCopy}>
              <Text style={styles.activeMultiplayerTitle}>{week.label}</Text>
              <Text style={styles.activeMultiplayerMeta}>{week.rangeLabel} · {week.quests.length} official result{week.quests.length === 1 ? "" : "s"}</Text>
            </View>
          </Pressable>
        )) : <Text style={styles.sectionBody}>Older weekly official sets will be listed here once they exist.</Text>}
      </View>

      <JoinedMultiplayerQuestModal
        key={selectedQuest?.id ?? "official-leaderboard"}
        visible={Boolean(selectedQuest)}
        quest={selectedQuest}
        challenges={bootstrap.challenges}
        mode={selectedQuest?.joinState === "Joined" ? "joined" : "public"}
        busy={groupQuestActionState.busy && groupQuestActionState.questId === selectedQuest?.id}
        message={groupQuestActionState.questId === selectedQuest?.id ? groupQuestActionState.message : null}
        error={groupQuestActionState.questId === selectedQuest?.id ? groupQuestActionState.error : null}
        onClose={() => setSelectedQuestId(null)}
        onRefresh={() => selectedQuest ? void runGroupQuestAction(selectedQuest.id, "refresh") : undefined}
        onLeave={() => selectedQuest ? void runGroupQuestAction(selectedQuest.id, "leave") : undefined}
        onJoin={() => selectedQuest && selectedQuest.status !== "Finished" ? void runGroupQuestAction(selectedQuest.id, "join") : undefined}
        onUpdate={(payload) => selectedQuest ? void runGroupQuestAction(selectedQuest.id, "update", payload) : undefined}
        onRemoveParticipant={(participantUserId) => selectedQuest ? void runGroupQuestAction(selectedQuest.id, "remove-participant", { participantUserId }) : undefined}
      />

      <Modal visible={Boolean(selectedWeek)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setSelectedWeekId(null)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close official weekly results" style={compactStyles.detailCloseButton} onPress={() => setSelectedWeekId(null)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={compactStyles.multiplayerDetailHero}>
              <Image source={SQC_BLACK_SEAL_ASSET} style={compactStyles.multiplayerDetailSeal} resizeMode="contain" />
              <Text style={compactStyles.multiplayerDetailKicker}>Official weekly archive</Text>
              <Text style={compactStyles.detailTitle}>{selectedWeek?.label}</Text>
              <Text style={compactStyles.detailGoal}>{selectedWeek?.rangeLabel}</Text>
            </View>
            <View style={compactStyles.appRows}>
              {selectedWeek?.quests.map((quest) => (
                <AppRow key={quest.id} title={cleanMultiplayerTitle(quest.title)} meta={`Final · ${quest.playersLabel ?? "Players pending"}`} status={quest.leaderboardRows?.[0]?.rank ?? "Results"} imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => setSelectedQuestId(quest.id)} />
              ))}
            </View>
          </ScrollHintedScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function getChallengesByIds(bootstrap: MobileBootstrap, ids: string[]) {
  return ids
    .map((challengeId) => bootstrap.challenges.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is MobileChallenge => Boolean(challenge));
}

function QuestFilterPanel() {
  return (
    <View style={styles.questFilterPanel} accessibilityLabel="Side Quest filters and sorting">
      <Text style={styles.questFilterTitle}>Find your next Side Quest.</Text>
      <Text style={styles.questFilterHint}>Showing the full live Side Quest deck. Pick one to inspect the rule and start when ready.</Text>
      <View style={styles.questFilterGrid}>
        <FilterField label="Difficulty" value="All" />
        <FilterField label="Status" value="All" />
        <FilterField label="Sort" value="Recommended" />
      </View>
    </View>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.filterField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Text style={styles.filterValue}>{value}</Text>
    </View>
  );
}

function AvailableQuestGrid({ challenges, completedIds, activeQuestId, onSelectChallenge }: { challenges: MobileChallenge[]; completedIds: Set<string>; activeQuestId: string | null; onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void }) {
  return (
    <View style={styles.availableQuestGrid} accessibilityLabel="Available quests">
      {challenges.map((challenge, index) => (
        <ChallengeCardMobile
          key={challenge.id}
          challenge={challenge}
          featured={index === 0}
          completed={completedIds.has(challenge.id)}
          active={activeQuestId === challenge.id}
          onPress={() => onSelectChallenge(challenge.id, "sideQuests")}
        />
      ))}
    </View>
  );
}

function QuestSection({ eyebrow, title, body, challenges, completedIds, activeQuestId, onSelectChallenge }: { eyebrow: string; title: string; body: string; challenges: MobileChallenge[]; completedIds: Set<string>; activeQuestId: string | null; onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void }) {
  return (
    <View style={styles.sideQuestSection}>
      <View style={styles.sectionHeadMobile}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionBody}>{body}</Text>
      <View style={styles.availableQuestGrid}>
        {challenges.map((challenge) => (
          <ChallengeCardMobile
            key={challenge.id}
            challenge={challenge}
            completed={completedIds.has(challenge.id)}
            active={activeQuestId === challenge.id}
            onPress={() => onSelectChallenge(challenge.id, "sideQuests")}
          />
        ))}
      </View>
    </View>
  );
}

function ChallengeCardMobile({ challenge, featured = false, completed = false, active = false, onPress }: { challenge: MobileChallenge; featured?: boolean; completed?: boolean; active?: boolean; onPress: () => void }) {
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} Side Quest`} accessibilityState={{ selected: active }} style={[styles.challengeCardMobile, featured && styles.challengeCardMobileFeatured, active && styles.challengeCardMobileActive, completed && styles.challengeCardMobileCompleted]} onPress={onPress}>
      {active && !completed ? <Text style={styles.activeQuestStampText}>Active Side Quest</Text> : null}
      {completed ? <Text style={styles.completedQuestStampText}>Side Quest completed</Text> : null}
      <View style={styles.questCardMetaMobile}>
        <Text style={[styles.difficultyBadgeMobile, styles[`difficulty${challenge.difficulty}` as keyof typeof styles]]}>{challenge.difficulty}</Text>
        <Text style={styles.questPointsMobile}>Coat of Arms</Text>
      </View>
      <View style={styles.challengeCardTitleRowMobile}>
        <View style={styles.challengeCardBadgeMobile}>
          <Image source={badgeSource} style={styles.challengeCardBadgeImageMobile} resizeMode="contain" />
        </View>
        <View style={styles.challengeCardCopyMobile}>
          <Text style={styles.challengeCardTitleMobile}>{challenge.title}</Text>
          <Text style={styles.challengeCardObjectiveMobile}>{challenge.objective}</Text>
          <Text style={styles.challengeCardHintMobile}>{challenge.openingHint}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function SelectedQuestDetailCard({
  challenge,
  account,
  authBridge,
  onSelectTab,
  onAccountUpdated,
}: {
  challenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: AccountUpdatedCallback;
}) {
  const [actionState, setActionState] = useState<{ busy: boolean; message: string | null; error: string | null }>({ busy: false, message: null, error: null });
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [proofGameReference, setProofGameReference] = useState("");
  const authenticated = isAuthenticatedAccount(account);
  const completed = authenticated ? account.progress.completedChallengeIds.includes(challenge.id) : false;
  const activeQuest = authenticated && account.activeQuest?.id === challenge.id ? account.activeQuest : null;
  const badgeSource = getChallengeCoatImageSource(challenge);
  const latestReceipt = authenticated && account.latestReceipt?.challengeId === challenge.id ? account.latestReceipt : null;
  const latestCheckFailed = isFailedReceipt(latestReceipt);
  const actionTitle = activeQuest ? `${challenge.title} is on the royal docket.` : "Pick this Side Quest.";
  const actionBody = activeQuest
    ? "Play one new eligible public game after starting this quest, then check your latest game for proof."
    : "Choose this ridiculous rule so SQC knows what to judge after your next public game.";

  function confirmLifecycleAction(action: "deactivate" | "reset") {
    Alert.alert(
      action === "deactivate" ? "Deactivate this Side Quest?" : "Reset this completed Side Quest?",
      action === "deactivate"
        ? "This clears the active run, but keeps any completed proof and coats you already earned."
        : "This removes the completed proof, receipt attempts, and coat unlock for this Side Quest so you can run it again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: action === "deactivate" ? "Deactivate" : "Reset", style: action === "reset" ? "destructive" : "default", onPress: () => void runAction(action) },
      ],
    );
  }

  async function runAction(action: "start" | "check" | "submit" | "deactivate" | "reset") {
    if (!authenticated || !authBridge.isSignedIn) {
      setActionState({ busy: false, message: null, error: "Sign in first to save quest progress." });
      return;
    }

    const explicitGameId = normalizeProofGameReference(proofGameReference);
    if (action === "submit" && !explicitGameId) {
      setActionState({ busy: false, message: null, error: "Paste a Lichess game ID or Chess.com game URL first." });
      return;
    }

    setActionState({ busy: true, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileQuestAction({ sessionToken, action, challengeId: challenge.id, gameId: action === "submit" ? explicitGameId : undefined });
      const nextAccount = await Promise.resolve(onAccountUpdated());
      const coercedAccount = coerceAccountResponse(nextAccount);
      const refreshedReceipt = isAuthenticatedAccount(coercedAccount) && coercedAccount.latestReceipt?.challengeId === challenge.id ? coercedAccount.latestReceipt : null;
      setActionState({ busy: false, message: action === "check" || action === "submit" ? getCheckActionMessage(refreshedReceipt) : result.message, error: null });
      if (action === "start") {
        onSelectTab("home");
      }
    } catch (caught) {
      setActionState({ busy: false, message: null, error: caught instanceof Error ? caught.message : "Could not update this Side Quest." });
    }
  }

  async function shareOfficialQuest() {
    const url = `${SQC_WEB_BASE_URL}/challenges/${encodeURIComponent(challenge.id)}`;
    try {
      await Share.share({
        title: `Side Quest Chess: ${challenge.title}`,
        message: `Try “${challenge.title}” in Side Quest Chess. ${url}`,
      });
      setShareStatus("Side Quest share sheet opened.");
    } catch {
      setShareStatus("Could not open sharing here.");
    }
  }

  return (
    <View style={styles.questCard} accessibilityLabel={`${challenge.title} details`}>
      <View style={styles.questCardHeader}>
        <View style={styles.questCardCopy}>
          <Text style={styles.questTitle}>{challenge.title}</Text>
          <Text style={styles.questObjective}>{challenge.objective}</Text>
        </View>
        <View style={styles.badgeImageFrame}><Image source={badgeSource} style={styles.badgeImage} resizeMode="contain" /></View>
      </View>

      <View style={styles.questFlavorCard}>
        <Text style={styles.questFlavor}>{challenge.flavor}</Text>
      </View>

      <View style={styles.questInstructionCard}>
        <Text style={styles.instructionLabel}>What SQC checks</Text>
        <Text style={styles.instructionCopy}>{challenge.instruction}</Text>
        <Text style={styles.openingHint}>{challenge.openingHint}</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Share Side Quest public link" style={styles.secondaryButton} onPress={() => void shareOfficialQuest()}>
        <Text style={styles.secondaryButtonText}>Share public link</Text>
      </Pressable>
      {shareStatus ? <Text style={styles.successCopy}>{shareStatus}</Text> : null}

      {completed ? null : (
        <View style={styles.proofActionCard}>
          <Text style={styles.proofActionTitle}>{actionTitle}</Text>
          <Text style={styles.proofActionBody}>{actionBody}</Text>
          {activeQuest ? (
            <View style={styles.inputStack}>
              <Text style={styles.inputLabel}>Specific proof game</Text>
              <TextInput value={proofGameReference} placeholder="Lichess game ID or Chess.com URL" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" autoCorrect={false} style={styles.textInput} onChangeText={setProofGameReference} />
              <Text style={styles.microcopy}>Optional: paste a finished public game to check that exact proof instead of only the latest game.</Text>
            </View>
          ) : null}
          <View style={[styles.buttonRow, activeQuest ? null : styles.centeredButtonRow]}>
            {activeQuest ? (
              <>
                <Pressable accessibilityRole="button" accessibilityLabel="Check latest game" style={styles.primaryButton} disabled={actionState.busy} onPress={() => void runAction("check")}>
                  <Text style={styles.primaryButtonText}>{actionState.busy ? "Checking..." : "Check latest game"}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Submit specific game proof" style={styles.secondaryButton} disabled={actionState.busy} onPress={() => void runAction("submit")}>
                  <Text style={styles.secondaryButtonText}>Submit game/link</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Deactivate quest" style={styles.secondaryButton} disabled={actionState.busy} onPress={() => confirmLifecycleAction("deactivate")}>
                  <Text style={styles.secondaryButtonText}>Deactivate quest</Text>
                </Pressable>
              </>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Start this Side Quest" style={styles.primaryButton} disabled={actionState.busy} onPress={() => void runAction("start")}>
                <Text style={styles.primaryButtonText}>{actionState.busy ? "Starting..." : "Start this Side Quest"}</Text>
              </Pressable>
            )}

          </View>
          {latestReceipt ? <Text style={isFailedReceipt(latestReceipt) ? styles.errorCopy : styles.successCopy}>{normalizeCheckHeadline(latestReceipt.headline)} · {getReceiptFailureText(latestReceipt) ?? latestReceipt.detail}</Text> : null}
          {latestCheckFailed ? <FailureDiagnosticBoard receipt={latestReceipt} /> : null}
          {!completed && isPendingReceipt(latestReceipt) ? <ActiveQuestNoGameSummary /> : null}
          {actionState.message ? <Text style={actionState.message.toLowerCase().includes("not completed") ? styles.errorCopy : styles.successCopy}>{actionState.message}</Text> : null}
          {actionState.error ? <Text style={styles.errorCopy}>{actionState.error}</Text> : null}
        </View>
      )}
    </View>
  );
}

function CustomSideQuestDetailModal({
  quest,
  visible,
  active,
  completed,
  completedAt,
  latestReceipt,
  onClose,
  onStart,
  onCheck,
  onReset,
  onEdit,
  onDuplicate,
  onDelete,
  onSaveState,
  onViewResult,
  onReport,
  onViewCreator,
  onUseInMultiplayer,
}: {
  quest: CustomLibraryQuest | null;
  visible: boolean;
  active: boolean;
  completed: boolean;
  completedAt: string | null;
  latestReceipt?: MobileAccountState["latestReceipt"] | null;
  onClose: () => void;
  onStart: (questId: string) => Promise<void> | void;
  onCheck?: (questId: string, gameId?: string) => Promise<string | void> | string | void;
  onReset?: (questId: string) => Promise<string | void> | string | void;
  onEdit?: (quest: CustomLibraryQuest) => void;
  onDuplicate?: (quest: CustomLibraryQuest) => Promise<void> | void;
  onDelete?: (questId: string) => Promise<void> | void;
  onSaveState?: (quest: CustomLibraryQuest, next: { lifecycle?: "draft" | "published" | "archived"; visibility?: "private" | "public" }) => Promise<void> | void;
  onViewResult?: () => void;
  onReport?: (quest: CustomLibraryQuest) => void;
  onViewCreator?: (quest: CustomLibraryQuest) => void;
  onUseInMultiplayer?: (quest: CustomLibraryQuest) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [proofBusy, setProofBusy] = useState<"check" | "submit" | "reset" | null>(null);
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofGameReference, setProofGameReference] = useState("");
  const [manageBusy, setManageBusy] = useState<"duplicate" | "delete" | "state" | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  if (!quest) return null;
  const badgeSource = getCustomQuestImageSource(quest.badgeImageUrl);
  const lifecycle = quest.lifecycle ?? "published";
  const canStart = lifecycle === "published";
  const statusLabel = getCustomLifecycleStatus(quest, active ? quest.id : null, completed);
  const ruleDetails = getCustomRuleDetailLines(quest.config, quest.summary);

  async function handleStart() {
    if (!quest || busy || active || completed || !canStart) return;
    setBusy(true);
    try {
      await onStart(quest.id);
    } finally {
      setBusy(false);
    }
  }

  function confirmProofReset() {
    if (!quest || proofBusy) return;
    Alert.alert(
      "Deactivate this custom Side Quest?",
      "This clears the active run and latest active receipt, but keeps any completed proof and custom quest recipe.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Deactivate", onPress: () => void handleProofAction("reset") },
      ],
    );
  }

  async function handleProofAction(action: "check" | "submit" | "reset") {
    if (!quest || proofBusy) return;
    const handler = action === "reset" ? onReset : onCheck;
    if (!handler) return;
    const explicitGameId = normalizeProofGameReference(proofGameReference);
    if (action === "submit" && !explicitGameId) {
      setProofMessage(null);
      setProofError("Paste a Lichess game ID or Chess.com game URL first.");
      return;
    }
    setProofBusy(action);
    setProofMessage(null);
    setProofError(null);
    try {
      const message = action === "reset" ? await handler(quest.id) : await handler(quest.id, action === "submit" ? explicitGameId : undefined);
      setProofMessage(message || (action === "reset" ? "Custom Side Quest deactivated." : "Proof check finished."));
    } catch (caught) {
      setProofError(caught instanceof Error ? caught.message : action === "reset" ? "Could not deactivate this custom Side Quest." : "Could not check this custom Side Quest.");
    } finally {
      setProofBusy(null);
    }
  }

  async function handleDuplicate() {
    if (!quest || !onDuplicate || manageBusy) return;
    setManageBusy("duplicate");
    try {
      await onDuplicate(quest);
    } finally {
      setManageBusy(null);
    }
  }

  function confirmDelete() {
    if (!quest || !onDelete || manageBusy) return;
    Alert.alert(
      "Delete custom Side Quest?",
      active ? "This will remove it from your library and clear it as your active Side Quest." : "This removes it from your custom Side Quest library. Existing Multiplayer Side Quests keep the version they already saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void handleDelete() },
      ],
    );
  }

  async function handleDelete() {
    if (!quest || !onDelete || manageBusy) return;
    setManageBusy("delete");
    try {
      await onDelete(quest.id);
    } finally {
      setManageBusy(null);
    }
  }

  async function handleSaveState(next: { lifecycle?: "draft" | "published" | "archived"; visibility?: "private" | "public" }) {
    if (!quest || !onSaveState || manageBusy) return;
    setManageBusy("state");
    try {
      await onSaveState(quest, next);
    } finally {
      setManageBusy(null);
    }
  }

  async function shareCommunityQuest() {
    if (!quest || quest.visibility !== "public" || lifecycle !== "published") return;
    const url = `${SQC_WEB_BASE_URL}/challenges/community/${encodeURIComponent(quest.id)}`;
    try {
      await Share.share({
        title: `Side Quest Chess: ${quest.name}`,
        message: `Try “${quest.name}”, a public Community Solo Side Quest in Side Quest Chess. ${url}`,
      });
      setShareStatus("Community Solo share sheet opened.");
    } catch {
      setShareStatus("Could not open sharing here.");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={compactStyles.detailScreen}>
        <LinearGradient colors={["#352021", "#171011", colors.bg]} style={StyleSheet.absoluteFill} />
        <View style={compactStyles.detailTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close custom Side Quest detail" style={compactStyles.detailCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
          </Pressable>
        </View>
        <ScrollHintedScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={compactStyles.detailHero}>
            <View style={compactStyles.completedProofCoatFrame}>
              <Image source={badgeSource} style={compactStyles.detailCoatImage} resizeMode="contain" />
              {completed ? <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.completedProofSeal} resizeMode="contain" /> : null}
            </View>
            <Text style={compactStyles.multiplayerDetailKicker}>Custom Side Quest</Text>
            <Text style={compactStyles.detailTitle}>{quest.name}</Text>
            <Text style={compactStyles.detailGoal}>{cleanCustomRuleSummaryText(quest.summary)}</Text>
            <Text style={compactStyles.detailLatestCheck}>{statusLabel} · {getCustomVisibilityLabel(quest.visibility)}{completedAt ? ` · ${formatLatestCheckTime(completedAt)}` : ""}</Text>
          </View>

          <View style={compactStyles.proofScrollCard}>
            <Text style={compactStyles.proofScrollEyebrow}>Challenge</Text>
            <Text style={compactStyles.proofScrollTitle}>What to do</Text>
            <Text style={compactStyles.proofScrollCopy}>{cleanCustomRuleSummaryText(quest.summary)}</Text>
            <View style={compactStyles.proofScrollRule} />
            <Text style={compactStyles.proofScrollMeta}>Play a new public game after picking this Side Quest.</Text>
          </View>

          <View style={compactStyles.proofScrollCard}>
            <Text style={compactStyles.proofScrollEyebrow}>Rule details</Text>
            <Text style={compactStyles.proofScrollTitle}>{ruleDetails.logicLabel}</Text>
            <View style={compactStyles.appRows}>
              {ruleDetails.lines.map((line, index) => (
                <View key={`${quest.id}-rule-${index}`} style={compactStyles.customConditionListRow}>
                  <View style={compactStyles.currentQuestRow}>
                    <View style={compactStyles.coatMarker}>
                      <Text style={compactStyles.customConditionIndex}>{index + 1}</Text>
                    </View>
                    <View style={compactStyles.currentQuestText}>
                      <Text style={compactStyles.currentQuestTitle}>{getCustomConditionLabel(index)}</Text>
                      <Text style={compactStyles.currentQuestMeta}>{line}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View style={compactStyles.proofScrollRule} />
            <Text style={compactStyles.proofScrollMeta}>Only safe rule summaries are shown; raw custom quest config stays hidden.</Text>
          </View>

          <View style={compactStyles.proofScrollCard}>
            <Text style={compactStyles.proofScrollEyebrow}>Visibility</Text>
            <Text style={compactStyles.proofScrollTitle}>{getCustomVisibilityTitle(quest.visibility)}</Text>
            <Text style={compactStyles.proofScrollCopy}>{getCustomVisibilityExplanation(quest.visibility)}</Text>
            <View style={compactStyles.proofScrollRule} />
            <Text style={compactStyles.proofScrollMeta}>{statusLabel} · {canStart ? "Playable in Solo and your hosted Multiplayer Side Quests" : "Publish it before playing"}</Text>
          </View>

          <View style={compactStyles.proofScrollCard}>
            <Text style={compactStyles.proofScrollEyebrow}>Stats</Text>
            <Text style={compactStyles.proofScrollTitle}>Activity so far</Text>
            <Text style={compactStyles.proofScrollCopy}>{getCustomStatsLine(quest.stats)}</Text>
            <View style={compactStyles.proofScrollRule} />
            <Text style={compactStyles.proofScrollMeta}>Stats show your activity with this Side Quest.</Text>
          </View>

          {quest.creatorName ? (
            <View style={compactStyles.proofScrollCard}>
              <Text style={compactStyles.proofScrollEyebrow}>Creator context</Text>
              <Text style={compactStyles.proofScrollTitle}>Made by {quest.creatorName}</Text>
              <Text style={compactStyles.proofScrollCopy}>Open a local creator shelf to browse other public Community Solo Side Quests from this creator.</Text>
              <View style={compactStyles.proofScrollRule} />
              <Text style={compactStyles.proofScrollMeta}>Private drafts and account details stay hidden.</Text>
            </View>
          ) : null}

          {active && !completed ? (
            <View style={styles.proofActionCard}>
              <Text style={styles.proofActionTitle}>{quest.name} is active.</Text>
              <Text style={styles.proofActionBody}>Play one new eligible public game after picking this custom Side Quest, then check your latest game for proof.</Text>
              <View style={styles.inputStack}>
                <Text style={styles.inputLabel}>Specific proof game</Text>
                <TextInput value={proofGameReference} placeholder="Lichess game ID or Chess.com URL" placeholderTextColor="rgba(255,247,232,.42)" autoCapitalize="none" autoCorrect={false} style={styles.textInput} onChangeText={setProofGameReference} />
                <Text style={styles.microcopy}>Optional: paste a finished public game to check this exact custom Side Quest proof.</Text>
              </View>
              <View style={styles.buttonRow}>
                {onCheck ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Check latest game for custom Side Quest" style={styles.primaryButton} disabled={Boolean(proofBusy)} onPress={() => void handleProofAction("check")}>
                    <Text style={styles.primaryButtonText}>{proofBusy === "check" ? "Checking..." : "Check latest game"}</Text>
                  </Pressable>
                ) : null}
                {onCheck ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Submit specific game proof for custom Side Quest" style={styles.secondaryButton} disabled={Boolean(proofBusy)} onPress={() => void handleProofAction("submit")}>
                    <Text style={styles.secondaryButtonText}>{proofBusy === "submit" ? "Checking..." : "Submit game/link"}</Text>
                  </Pressable>
                ) : null}
                {onReset ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Deactivate custom Side Quest" style={styles.secondaryButton} disabled={Boolean(proofBusy)} onPress={confirmProofReset}>
                    <Text style={styles.secondaryButtonText}>{proofBusy === "reset" ? "Deactivating..." : "Deactivate quest"}</Text>
                  </Pressable>
                ) : null}
              </View>
              {latestReceipt ? <Text style={isFailedReceipt(latestReceipt) ? styles.errorCopy : styles.successCopy}>{normalizeCheckHeadline(latestReceipt.headline)} · {getReceiptFailureText(latestReceipt) ?? latestReceipt.detail}</Text> : null}
              {latestReceipt && isFailedReceipt(latestReceipt) ? <FailureDiagnosticBoard receipt={latestReceipt} /> : null}
              {latestReceipt && isPendingReceipt(latestReceipt) ? <ActiveQuestNoGameSummary /> : null}
              {proofMessage ? <Text style={proofMessage.toLowerCase().includes("not completed") ? styles.errorCopy : styles.successCopy}>{proofMessage}</Text> : null}
              {proofError ? <Text style={styles.errorCopy}>{proofError}</Text> : null}
            </View>
          ) : completed && onViewResult ? (
            <Pressable accessibilityRole="button" accessibilityLabel="View custom Side Quest result" style={compactStyles.detailPrimaryButton} onPress={onViewResult}>
              <Text style={compactStyles.detailPrimaryButtonText}>View result</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Pick custom Side Quest" style={[compactStyles.detailPrimaryButton, (busy || !canStart) ? compactStyles.disabledAction : null]} disabled={busy || !canStart} onPress={() => void handleStart()}>
              <Text style={compactStyles.detailPrimaryButtonText}>{busy ? "Picking..." : !canStart ? "Publish to play" : "Pick this Side Quest"}</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" accessibilityLabel="Close custom Side Quest detail" style={compactStyles.detailQuietButton} onPress={onClose}>
            <Text style={compactStyles.detailQuietButtonText}>Back to list</Text>
          </Pressable>
          {onViewCreator && quest.creatorName ? (
            <Pressable accessibilityRole="button" accessibilityLabel="View more by this creator" style={compactStyles.detailSecondaryButton} onPress={() => onViewCreator(quest)}>
              <Text style={compactStyles.detailSecondaryButtonText}>More by {quest.creatorName}</Text>
            </Pressable>
          ) : null}
          {quest.visibility === "public" && lifecycle === "published" ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Share Community Solo Side Quest" style={compactStyles.detailSecondaryButton} onPress={() => void shareCommunityQuest()}>
              <Text style={compactStyles.detailSecondaryButtonText}>Share public link</Text>
            </Pressable>
          ) : null}
          {shareStatus ? <Text style={compactStyles.inlineSuccess}>{shareStatus}</Text> : null}
          {onReport ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Report Community Solo Side Quest" style={compactStyles.detailSecondaryButton} onPress={() => onReport(quest)}>
              <Text style={compactStyles.detailSecondaryButtonText}>Report this Side Quest</Text>
            </Pressable>
          ) : null}
          {onUseInMultiplayer ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Use custom Side Quest in Multiplayer" style={compactStyles.detailSecondaryButton} onPress={() => onUseInMultiplayer(quest)}>
              <Text style={compactStyles.detailSecondaryButtonText}>Use in Multiplayer</Text>
            </Pressable>
          ) : null}
          {onEdit ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Edit custom Side Quest" style={compactStyles.detailSecondaryButton} onPress={() => onEdit(quest)}>
              <Text style={compactStyles.detailSecondaryButtonText}>Edit name & rules</Text>
            </Pressable>
          ) : null}
          {onDuplicate ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Duplicate custom Side Quest" style={compactStyles.detailSecondaryButton} disabled={Boolean(manageBusy)} onPress={() => void handleDuplicate()}>
              <Text style={compactStyles.detailSecondaryButtonText}>{manageBusy === "duplicate" ? "Duplicating..." : "Duplicate"}</Text>
            </Pressable>
          ) : null}
          {onSaveState && lifecycle !== "published" ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Publish custom Side Quest" style={compactStyles.detailSecondaryButton} disabled={Boolean(manageBusy)} onPress={() => void handleSaveState({ lifecycle: "published", visibility: quest.visibility ?? "private" })}>
              <Text style={compactStyles.detailSecondaryButtonText}>{manageBusy === "state" ? "Saving..." : "Publish"}</Text>
            </Pressable>
          ) : null}
          {onSaveState && lifecycle === "published" ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Toggle custom Side Quest visibility" style={compactStyles.detailSecondaryButton} disabled={Boolean(manageBusy)} onPress={() => void handleSaveState({ lifecycle: "published", visibility: quest.visibility === "public" ? "private" : "public" })}>
              <Text style={compactStyles.detailSecondaryButtonText}>{manageBusy === "state" ? "Saving..." : quest.visibility === "public" ? "Make private again" : "Make public / shareable"}</Text>
            </Pressable>
          ) : null}
          {onSaveState && lifecycle !== "archived" ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Archive custom Side Quest" style={compactStyles.detailQuietButton} disabled={Boolean(manageBusy)} onPress={() => void handleSaveState({ lifecycle: "archived", visibility: quest.visibility ?? "private" })}>
              <Text style={compactStyles.detailQuietButtonText}>{manageBusy === "state" ? "Saving..." : "Archive"}</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Delete custom Side Quest" style={compactStyles.detailQuietButton} disabled={Boolean(manageBusy)} onPress={confirmDelete}>
              <Text style={compactStyles.detailQuietButtonText}>{manageBusy === "delete" ? "Deleting..." : "Delete from library"}</Text>
            </Pressable>
          ) : null}
        </ScrollHintedScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CompletedQuestProofCard({
  challenge,
  completedQuest,
  authBridge,
  onAccountUpdated,
}: {
  challenge: MobileChallenge;
  completedQuest: MobileAccountState["completedQuests"][number];
  authBridge: MobileAuthBridge;
  onAccountUpdated: AccountUpdatedCallback;
}) {
  const badgeSource = getChallengeCoatImageSource(challenge);
  const proofHref = completedQuest.proofHref?.trim() || null;
  const proofDetailLines = buildCompletedProofDetailLines(completedQuest, proofHref);
  const shareCopy = `I completed “${challenge.title}” in the Side Quest Chess app. ${completedQuest.badgeName} unlocked.${proofHref ? ` ${proofHref}` : ""}`;
  const [actionState, setActionState] = useState<{ busy: boolean; message: string | null; error: string | null }>({ busy: false, message: null, error: null });
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  async function shareProof() {
    try {
      await Share.share({ title: `Side Quest Chess: ${challenge.title}`, message: shareCopy, ...(proofHref ? { url: proofHref } : {}) });
      setShareStatus(proofHref ? "Proof link share sheet opened." : "Proof share sheet opened.");
    } catch {
      setShareStatus("Could not open sharing here.");
    }
  }

  async function copyProofLink() {
    if (!proofHref) return;
    await Clipboard.setStringAsync(proofHref);
    setShareStatus("Proof link copied.");
  }

  async function openProofLink() {
    if (!proofHref) return;

    try {
      await WebBrowser.openBrowserAsync(proofHref);
      setShareStatus("Proof link opened.");
    } catch {
      setShareStatus("Could not open the proof link here.");
    }
  }

  function confirmReset() {
    Alert.alert(
      "Reset this completed Side Quest?",
      "This removes the completed proof, receipt attempts, and coat unlock for this Side Quest so you can run it again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => void runReset() },
      ],
    );
  }

  async function runReset() {
    if (!authBridge.isSignedIn) {
      setActionState({ busy: false, message: null, error: "Sign in first to reset this Side Quest." });
      return;
    }

    setActionState({ busy: true, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileQuestAction({ sessionToken, action: "reset", challengeId: challenge.id });
      setActionState({ busy: false, message: result.message, error: null });
      onAccountUpdated();
    } catch (caught) {
      setActionState({ busy: false, message: null, error: caught instanceof Error ? caught.message : "Could not reset this Side Quest." });
    }
  }

  return (
    <View style={compactStyles.completedProofScreen} accessibilityLabel={`${challenge.title} completed proof`}>
      <View style={compactStyles.detailHero}>
        <View style={compactStyles.completedProofCoatFrame}>
          <Image source={getChallengeCoatGlowSource(challenge.id)} style={[compactStyles.detailCoatGlowImage, { tintColor: getSafeBadgeColors(challenge).glow }]} resizeMode="contain" />
          <Image source={badgeSource} style={compactStyles.detailCoatImage} resizeMode="contain" />
          <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.completedProofSeal} resizeMode="contain" />
        </View>
        <Text style={compactStyles.completedProofKicker}>Side Quest completed</Text>
        <Text style={compactStyles.detailTitle}>{challenge.title}</Text>
        <Text style={compactStyles.detailGoal}>{challenge.objective}</Text>
        <Text style={compactStyles.detailLatestCheck}>Completed: {formatLatestCheckTime(completedQuest.completedAt)}</Text>
        <Text style={compactStyles.completedProofBadgeName}>Coat of Arms: {completedQuest.badgeName}</Text>
        <View style={compactStyles.completedProofSealBadge}>
          <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.completedProofSealBadgeImage} resizeMode="contain" />
          <Text style={compactStyles.completedProofSealBadgeText}>Verified</Text>
        </View>
      </View>

      <View style={compactStyles.proofScrollCard}>
        <Text style={compactStyles.proofScrollEyebrow}>Victory scroll</Text>
        <Text style={compactStyles.proofScrollTitle}>The clerks accept this proof.</Text>
        <Text style={compactStyles.proofScrollCopy}>{buildMobileVictoryScrollCopy(challenge)}</Text>
        <View style={compactStyles.proofScrollRule} />
        <Text style={compactStyles.proofScrollMeta}>{completedQuest.badgeName} unlocked</Text>
      </View>

      <VictoryProofBoard proof={completedQuest} />

      <View style={compactStyles.proofScrollCard}>
        <Text style={compactStyles.proofScrollEyebrow}>Receipt details</Text>
        <Text style={compactStyles.proofScrollTitle}>Latest verified proof</Text>
        <Text style={compactStyles.proofScrollCopy}>The app keeps the same proof receipt data as your SQC account: provider, game reference, final move, completion time, and canonical proof link when available.</Text>
        <DetailRow label="Game" value={proofDetailLines.game} />
        <DetailRow label="Final move" value={proofDetailLines.move} />
        <DetailRow label="Completed" value={proofDetailLines.completed} />
        <DetailRow label="Public proof" value={proofDetailLines.link} tone={proofHref ? "good" : "default"} />
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="View proof details" style={compactStyles.detailPrimaryButton} onPress={() => Alert.alert("Proof details", proofDetailLines.alert)}>
        <Text style={compactStyles.detailPrimaryButtonText}>Proof details</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Share proof" style={compactStyles.detailSecondaryButton} onPress={() => void shareProof()}>
        <Text style={compactStyles.detailSecondaryButtonText}>{proofHref ? "Share proof link" : "Share proof"}</Text>
      </Pressable>
      {proofHref ? (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel="Open proof link" style={compactStyles.detailSecondaryButton} onPress={() => void openProofLink()}>
            <Text style={compactStyles.detailSecondaryButtonText}>Open proof link</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Copy proof link" style={compactStyles.detailQuietButton} onPress={() => void copyProofLink()}>
            <Text style={compactStyles.detailQuietButtonText}>Copy proof link</Text>
          </Pressable>
        </>
      ) : null}
      {shareStatus ? <Text style={compactStyles.inlineSuccess}>{shareStatus}</Text> : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Reset Side Quest" style={compactStyles.detailQuietButton} disabled={actionState.busy} onPress={confirmReset}>
        <Text style={compactStyles.detailQuietButtonText}>{actionState.busy ? "Resetting..." : "Reset Side Quest"}</Text>
      </Pressable>
      {actionState.message ? <Text style={compactStyles.inlineSuccess}>{actionState.message}</Text> : null}
      {actionState.error ? <Text style={compactStyles.inlineError}>{actionState.error}</Text> : null}
    </View>
  );
}

function buildCompletedProofDetailLines(
  completedQuest: MobileAccountState["completedQuests"][number],
  proofHref: string | null,
) {
  const provider = completedQuest.provider?.trim() || "SQC verifier";
  const game = completedQuest.gameId?.trim() ? `${provider} · ${completedQuest.gameId.trim()}` : provider;
  const move = completedQuest.lastMoveSan?.trim() || completedQuest.lastMoveUci?.trim() || "Final move not attached";
  const completed = formatLatestCheckTime(completedQuest.completedAt);
  const link = proofHref ? "Canonical proof link available" : "No public proof link attached";

  return {
    game,
    move,
    completed,
    link,
    alert: [
      `Quest: ${completedQuest.title}`,
      `Coat of Arms: ${completedQuest.badgeName}`,
      `Game: ${game}`,
      `Final move: ${move}`,
      `Completed: ${completed}`,
      proofHref ? `Proof link: ${proofHref}` : "Proof link: not attached",
    ].join("\n"),
  };
}

function getCustomCoatPreviewUrl(_requirements: Array<Omit<CustomRuleRequirement, "id">>, _seed: string) {
  return CUSTOM_SIDE_QUEST_SINGLE_CREST_PATH;
}

function buildCustomActiveChallenge(
  activeQuest: NonNullable<MobileAccountState["activeQuest"]>,
  customQuest: MobileCustomSideQuest | null,
): MobileChallenge {
  const summary = cleanCustomRuleSummaryText(customQuest?.summary?.trim() || activeQuest.banner?.trim() || "Complete your custom Side Quest rule in a fresh public game.");
  return {
    id: activeQuest.id,
    title: customQuest?.title?.trim() || activeQuest.title,
    objective: summary,
    instruction: summary,
    openingHint: "Custom Side Quest",
    reward: 10,
    category: "Custom",
    difficulty: "Custom",
    completionRate: "Custom",
    flavor: "A personally invented chess errand, waiting for official nonsense paperwork.",
    badge: activeQuest.title,
    proofCallout: summary,
    rules: [summary],
    requirement: { side: "any", result: "custom" },
    badgeIdentity: {
      name: activeQuest.title,
      motif: "Custom Side Quest",
      rarity: "Custom",
      unlockCopy: `${activeQuest.title} completed.`,
      imageUrl: activeQuest.badgeImageUrl,
      colors: { primary: "#f5c86a", secondary: "#8b5a2b", glow: "#f5c86a" },
      heraldry: {
        shield: "Custom",
        charge: "Player-made rule",
        crest: "Side Quest Chess",
        motto: "Verified by mischief",
        meaning: "This coat marks a custom Side Quest attempt.",
        weirdness: "Player-authored nonsense, formally checked.",
      },
    },
  };
}

function buildCustomProofChallenge(
  completedQuest: MobileAccountState["completedQuests"][number],
  customQuest: MobileCustomSideQuest | null,
): MobileChallenge {
  const summary = cleanCustomRuleSummaryText(customQuest?.summary?.trim() || "Complete your custom Side Quest rule in a verified public game.");
  return {
    id: completedQuest.id,
    title: completedQuest.title,
    objective: summary,
    instruction: summary,
    openingHint: "Custom Side Quest",
    reward: completedQuest.reward,
    category: "Custom",
    difficulty: "Custom",
    completionRate: "Custom",
    flavor: "A personally invented chess errand, now accepted by the SQC paperwork office.",
    badge: completedQuest.badgeName,
    proofCallout: summary,
    rules: [summary],
    requirement: { side: "any", result: "custom" },
    badgeIdentity: {
      name: completedQuest.badgeName,
      motif: "Custom Side Quest",
      rarity: "Custom",
      unlockCopy: `${completedQuest.title} completed.`,
      imageUrl: completedQuest.badgeImageUrl,
      colors: { primary: "#f5c86a", secondary: "#8b5a2b", glow: "#f5c86a" },
      heraldry: {
        shield: "Custom",
        charge: "Player-made rule",
        crest: "Side Quest Chess",
        motto: "Verified by mischief",
        meaning: "This coat marks a completed custom Side Quest.",
        weirdness: "Player-authored nonsense, formally stamped.",
      },
    },
  };
}

function buildMobileVictoryScrollCopy(challenge: MobileChallenge) {
  if (challenge.id === "finish-any-game") {
    return "A public chess game was completed. Win, loss, or draw — the paperwork is good enough for a coat of arms.";
  }

  if (challenge.requirement.result === "win") {
    return `${challenge.objective} The bad idea survived contact with reality and still ended in victory.`;
  }

  if (challenge.requirement.result === "draw") {
    return `${challenge.objective} Nobody won, nobody learned, and the scroll department approved it anyway.`;
  }

  if (challenge.requirement.result === "lose") {
    return `${challenge.objective} Losing on these terms still counts as commitment to the bit.`;
  }

  return `${challenge.objective} SQC accepted the proof, so the Coat of Arms is unlocked.`;
}

function getMobileAccountNextStep(account: MobileAccountState) {
  if (!account.chessAccounts.hasAny) {
    return {
      title: "Connect your chess username.",
      copy: "Add a public Lichess or Chess.com username first. SQC never needs your chess-site password.",
      href: "/connect",
      cta: "Connect chess account",
    };
  }

  if (!account.activeQuest) {
    return {
      title: "Pick one side quest.",
      copy: "Choose the ridiculous rule SQC should judge after your next public game.",
      href: "/challenges",
      cta: "Choose a Side Quest",
    };
  }

  if (account.activeQuest.completed) {
    return {
      title: "Your latest side quest is complete.",
      copy: "The coat of arms is unlocked. Open the proof, admire the paperwork, then pick the next bad idea.",
      href: account.activeQuest.proofHref || account.activeQuest.href.replace(getApiBaseUrl(), "") || "/account",
      cta: "View result",
    };
  }

  return {
    title: `${account.activeQuest.title} is on the royal docket - play one new eligible game, then check the proof.`,
    copy: "SQC will inspect your latest public game after this quest started and decide whether the bad idea counts.",
    href: account.activeQuest.href.replace(getApiBaseUrl(), "") || `/challenges/${account.activeQuest.id}`,
    cta: "Open active Side Quest",
  };
}


function AccountShell({
  bootstrap,
  account,
  authBridge,
  onSelectTab,
  onSelectChallenge,
  onAccountUpdated,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectTab: (tab: AppTab) => void;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onAccountUpdated: AccountUpdatedCallback;
}) {
  if (!isAuthenticatedAccount(account)) {
    const signedInButRejected = authBridge.isSignedIn && account?.authenticated === false;
    const primaryLabel = signedInButRejected ? "Sync account" : authBridge.configured ? "Sign in" : "Open sign in";
    const handlePrimaryPress = () => {
      if (signedInButRejected) {
        return onAccountUpdated();
      }

      if (authBridge.startGoogleSignIn) {
        return void authBridge.startGoogleSignIn();
      }
      return showNativeOnlyNotice("Sign-in is unavailable right now. Please try again in a moment.");
    };

    return (
      <View style={styles.screenStack}>
        <View style={styles.accountAuthCopyCard}>
          <CardGradientGlows />
          <Text style={styles.accountAuthTitle}>Sign in, then go make terrible chess decisions.</Text>
          <Text style={styles.accountAuthHeroCopy}>Logging in lets Side Quest Chess remember your profile, public chess usernames, active Side Quest, badges, and proof cards.</Text>
          <View style={styles.authLightweightCopy} accessibilityLabel="Lightweight sign-in notes">
            <Text style={styles.authNote}><Text style={styles.authNoteStrong}>Lightweight by design.</Text> We do not need or ask for any Lichess or Chess.com passwords.</Text>
            <Text style={styles.authNote}>Use a public chess username only. SQC checks public games and stores the minimum needed to remember your quests, proof, and Coat of Arms progress.</Text>
            <Text style={styles.authNote}>You can browse Side Quests before signing in. Sign in when you want SQC to save progress, verify proof, or manage Multiplayer Quests.</Text>
          </View>
        </View>

        <View style={styles.accountAuthFormCard} accessibilityLabel="Sign in form">
          <Text style={styles.eyebrow}>Account</Text>
          <Text style={styles.cardTitle}>{signedInButRejected ? "Finish syncing your account." : "Continue to your account."}</Text>
          <Text style={styles.cardBody}>{signedInButRejected ? "Your sign-in is active, but SQC needs to refresh your account before saving progress." : "Sign in to save progress, verify proof, manage Multiplayer Quests, and keep your Coat of Arms progress synced."}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={primaryLabel} testID="account-primary-sign-in" style={styles.primaryButtonWide} onPress={handlePrimaryPress}>
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Browse Side Quests" style={styles.secondaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
            <Text style={styles.secondaryButtonText}>Browse Side Quests</Text>
          </Pressable>
        </View>

        <MobileAccountStatesCard authBridge={authBridge} account={account} />
      </View>
    );
  }

  const signedInAccount = account;
  const nextStep = getMobileAccountNextStep(signedInAccount);
  const activeChallenge = signedInAccount.activeQuest?.id ? bootstrap.challenges.find((challenge) => challenge.id === signedInAccount.activeQuest?.id) ?? null : null;
  const officialAccountGroupQuestIds = new Set((signedInAccount.officialPublicGroupQuests ?? []).filter((quest) => quest.official || quest.id.startsWith("official-")).map((quest) => quest.id));
  const userCreatedActiveGroupQuests = signedInAccount.activeGroupQuests.filter((quest) => !officialAccountGroupQuestIds.has(quest.id) && !quest.id.startsWith("official-"));

  function handleNextStepPress() {
    if (!signedInAccount.chessAccounts.hasAny) {
      showNativeOnlyNotice("Add a Lichess or Chess.com username on this account page first.");
      return;
    }

    if (!signedInAccount.activeQuest) {
      onSelectTab("sideQuests");
      return;
    }

    if (signedInAccount.activeQuest.id) {
      if (signedInAccount.activeQuest.completed && signedInAccount.activeQuest.proofHref) {
        onSelectChallenge(signedInAccount.activeQuest.id, "sideQuests");
        return;
      }

      onSelectChallenge(signedInAccount.activeQuest.id, "sideQuests");
      return;
    }

    showNativeOnlyNotice("This account action stays inside the app.");
  }
  const activeBadgeUrl = account.activeQuest?.badgeImageUrl ?? (activeChallenge ? getChallengeCoatImageUrl(activeChallenge) : null);

  return (
    <View style={styles.screenStack}>
      <View style={styles.currentMissionCard} accessibilityLabel="Current mission">
        <View style={styles.currentMissionCopy}>
          <Text style={styles.eyebrow}>Current mission</Text>
          <Text style={styles.currentMissionName}>{signedInAccount.profile.displayName}</Text>
          <View style={styles.accountStatusStrip} accessibilityLabel="Connected chess accounts">
            <Text style={signedInAccount.chessAccounts.lichessUsername ? styles.accountStatusConnected : styles.accountStatusMissing}>Lichess: <Text style={styles.accountStatusStrong}>{signedInAccount.chessAccounts.lichessUsername || "not connected"}</Text></Text>
            <Text style={signedInAccount.chessAccounts.chessComUsername ? styles.accountStatusConnected : styles.accountStatusMissing}>Chess.com: <Text style={styles.accountStatusStrong}>{signedInAccount.chessAccounts.chessComUsername || "not connected"}</Text></Text>
          </View>
          <Text style={styles.currentMissionTitle}>{nextStep.title}</Text>
          <Text style={styles.currentMissionBody}>{nextStep.copy}</Text>
          <View style={styles.buttonRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={nextStep.cta} style={styles.primaryButton} onPress={handleNextStepPress}>
              <Text style={styles.primaryButtonText}>{nextStep.cta}</Text>
            </Pressable>
            {signedInAccount.activeQuest?.completed && signedInAccount.activeQuest.id ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Open quest details" style={styles.secondaryButton} onPress={() => onSelectChallenge(signedInAccount.activeQuest?.id ?? "", "sideQuests")}>
                <Text style={styles.secondaryButtonText}>Open quest details</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Browse or create Side Quests" style={styles.secondaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
            <Text style={styles.secondaryButtonText}>Browse / Create Side Quests</Text>
          </Pressable>
          <View style={styles.currentMissionMultiplayer} accessibilityLabel="Active Multiplayer Side Quests">
            <Text style={styles.eyebrow}>Active Multiplayer Side Quests</Text>
            {userCreatedActiveGroupQuests.length ? userCreatedActiveGroupQuests.map((quest) => (
              <Pressable key={quest.id} accessibilityRole="button" accessibilityLabel={`Open ${cleanMultiplayerTitle(quest.title)}`} style={styles.activeMultiplayerRow} onPress={() => onSelectTab("multiplayerSideQuests")}>
                <Image source={{ uri: absoluteAssetUrl("/stamps/sqc-multiplayer-seal.png") }} style={styles.activeMultiplayerSeal} resizeMode="contain" />
                <View style={styles.activeMultiplayerCopy}>
                  <Text style={styles.activeMultiplayerTitle}>{cleanMultiplayerTitle(quest.title)}</Text>
                  <Text style={styles.activeMultiplayerMeta}>{getJoinedMultiplayerListStatus(quest)} · {getJoinedMultiplayerListMeta(quest)}</Text>
                </View>
              </Pressable>
            )) : <Text style={styles.sectionBody}>No active Multiplayer Side Quests yet.</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={userCreatedActiveGroupQuests.length ? "Open active multiplayer quest" : "Open Multiplayer Side Quests"} style={styles.primaryButton} onPress={() => onSelectTab("multiplayerSideQuests")}>
              <Text style={styles.primaryButtonText}>{userCreatedActiveGroupQuests.length ? "Open active multiplayer quest" : "Open Multiplayer Side Quests"}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.currentMissionVisual}>
          {signedInAccount.activeQuest ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Open ${signedInAccount.activeQuest.title} quest page`} style={styles.currentMissionCoat} onPress={() => onSelectChallenge(signedInAccount.activeQuest?.id ?? "", "sideQuests")}>
              {signedInAccount.activeQuest.completed ? <Text style={styles.completedQuestStampText}>Completed quest</Text> : <Text style={styles.activeQuestStampText}>Active quest</Text>}
            {activeBadgeUrl ? <Image source={{ uri: activeBadgeUrl }} style={styles.currentMissionCoatImage} resizeMode="contain" /> : <Text style={styles.badgeFallbackText}>?</Text>}
              <Text style={styles.currentMissionCoatLabel}>{signedInAccount.activeQuest.title}</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Choose a quest" style={styles.currentMissionEmpty} onPress={() => onSelectTab("sideQuests")}>
          <Text style={styles.currentMissionEmptyBadge}>?</Text>
              <Text style={styles.currentMissionCoatLabel}>Choose a quest</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.questLogCollectionCard}>
        <Text style={styles.sectionTitle}>{signedInAccount.completedQuests.length ? "A deeply unnecessary trophy cabinet." : "No completed side quests yet."}</Text>
        <Text style={styles.sectionBody}>{signedInAccount.completedQuests.length ? "Officially impressive. Socially complicated. Please admire responsibly." : "No tiny heraldic paperwork yet. The shame is currently very organized."}</Text>
        <View style={styles.scoreboardRow}>
          <BigScore label="Completed" value={`${signedInAccount.progress.totalCompletedChallenges}`} />
          <BigScore label="Coat of Arms" value={`${signedInAccount.progress.totalCompletedChallenges}`} />
          <BigScore label="Proofs" value={`${signedInAccount.progress.proofReceiptCount}`} />
        </View>
        <CompletedQuestShelf account={signedInAccount} />
      </View>

      <ChessUsernameEditor account={signedInAccount} authBridge={authBridge} onSaved={onAccountUpdated} />
      <QuestProgressStrip completed={signedInAccount.progress.totalCompletedChallenges} total={bootstrap.challenges.length} />
      <AccountNextActionsCard account={signedInAccount} />
      <MobileAccountStatesCard authBridge={authBridge} account={account} />
    </View>
  );
}
function CoatOfArmsScreen({
  bootstrap,
  account,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const earnedIds = new Set(signedInAccount ? signedInAccount.completedQuests.map((quest) => quest.id) : []);
  const liveBadgeChallenges = bootstrap.challenges.filter((challenge) => getChallengeCoatImageUrl(challenge));
  const earnedCount = earnedIds.size;

  return (
    <View style={styles.screenStack}>
      <View style={styles.badgesHeroCard}>
        <CardGradientGlows />
        <Text style={styles.badgesHeroTitle}>Every bad idea deserves a coat of arms.</Text>
        {isAuthenticatedAccount(account) ? (
          <View style={styles.coatShelfCard}>
            <View style={styles.coatShelfHeader}>
              <View style={styles.coatShelfCopy}>
                <Text style={styles.eyebrow}>Your Coat of Arms</Text>
                <Text style={styles.coatShelfTitle}>{earnedCount ? `${earnedCount} unlocked so far.` : "No completed side quests yet."}</Text>
                <Text style={styles.coatShelfBody}>{earnedCount ? "Earned coats stay bright. Locked coats remain visible so the next bad idea is easy to spot." : "Finish one quest and the coat of arms lands here with too much ceremony and not enough dignity."}</Text>
              </View>
              <Text style={earnedCount ? styles.syncedPill : styles.lockedPill}>{earnedCount}/{liveBadgeChallenges.length}</Text>
            </View>
          </View>
        ) : null}
        <View style={styles.liveCoatRoster} accessibilityLabel="Current live Side Quest Chess coats of arms">
          {liveBadgeChallenges.map((challenge) => (
            <LiveCoatRosterItem key={challenge.id} challenge={challenge} earned={earnedIds.has(challenge.id)} onPress={() => onSelectChallenge(challenge.id, "sideQuests")} />
          ))}
        </View>
      </View>

      <View style={styles.badgeMeaningList} accessibilityLabel="Live quest coat of arms meanings">
        {bootstrap.challenges.map((challenge) => (
          <BadgeMeaningCard key={challenge.id} challenge={challenge} earned={earnedIds.has(challenge.id)} onPress={() => onSelectChallenge(challenge.id, "sideQuests")} />
        ))}
      </View>
    </View>
  );
}

function LiveCoatRosterItem({ challenge, earned, onPress }: { challenge: MobileChallenge; earned: boolean; onPress: () => void }) {
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} style={styles.liveCoatRosterItem} onPress={onPress}>
      <View style={[styles.liveCoatBadgeFrame, !earned && styles.liveCoatBadgeFrameLocked]}>
        <Image source={badgeSource} style={[styles.liveCoatBadgeImage, !earned && styles.liveCoatBadgeImageLocked]} resizeMode="contain" />
        {!earned ? <Text style={styles.liveCoatLockedLabel}>Locked</Text> : null}
      </View>
      <Text style={styles.liveCoatRosterTitle} numberOfLines={2}>{challenge.title}</Text>
    </Pressable>
  );
}

function BadgeMeaningCard({ challenge, earned, onPress }: { challenge: MobileChallenge; earned: boolean; onPress: () => void }) {
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} style={styles.badgeMeaningCard} onPress={onPress}>
      <View style={[styles.badgeMeaningArtLink, !earned && styles.badgeMeaningArtLocked]}>
        <Image source={badgeSource} style={[styles.badgeMeaningImage, !earned && styles.badgeMeaningImageLocked]} resizeMode="contain" />
      </View>
      <View style={styles.badgeMeaningCopy}>
        <Text style={styles.badgeMeaningTitle}>{getSafeBadgeIdentity(challenge).name}</Text>
        <View style={styles.badgeMeaningRows}>
          <View style={styles.badgeMeaningRow}>
            <Text style={styles.badgeMeaningTerm}>Shield</Text>
            <Text style={styles.badgeMeaningDefinition}>{getSafeBadgeIdentity(challenge).heraldry.shield}</Text>
          </View>
          <View style={styles.badgeMeaningRow}>
            <Text style={styles.badgeMeaningTerm}>Meaning</Text>
            <Text style={styles.badgeMeaningDefinition}>{getSafeBadgeIdentity(challenge).heraldry.meaning}</Text>
          </View>
          <View style={styles.badgeMeaningRow}>
            <Text style={styles.badgeMeaningTerm}>Side Quest</Text>
            <Text style={styles.badgeMeaningDefinition}>{challenge.title}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function AccountNextActionsCard({ account }: { account: MobileAccountState }) {
  const hasChessAccount = account.chessAccounts.hasAny;
  const activeLabel = account.activeQuest ? account.activeQuest.title : "No active Side Quest";

  return (
    <View style={styles.accountChecklistCard}>
      <Text style={styles.eyebrow}>Next best action</Text>
      <Text style={styles.accountChecklistTitle}>{account.activeQuest ? "Keep the active Side Quest moving." : "Pick a fresh Side Quest on the board."}</Text>
      <View style={styles.checkerFlow}>
        <FlowStep done={hasChessAccount} title="Chess username" body={hasChessAccount ? "At least one chess username is connected to your SQC account." : "Add Lichess or Chess.com here before serious proof runs."} />
        <FlowStep done={Boolean(account.activeQuest)} title="Active quest" body={activeLabel} />
        <FlowStep done={Boolean(account.latestReceipt)} title="Latest receipt" body={account.latestReceipt?.headline ?? "Check a completed public game to create the first proof receipt."} />
      </View>
    </View>
  );
}

function QuestProgressStrip({ completed, total }: { completed: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.round((completed / safeTotal) * 100));

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Side Quest log progress</Text>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.microcopy}>{completed} of {total} coats earned on this account.</Text>
    </View>
  );
}

function CompletedQuestShelf({ account }: { account: MobileAccountState }) {
  if (account.completedQuests.length === 0) {
    return (
      <View style={styles.noticeStrip}>
        <Text style={styles.noticeIcon}>♜</Text>
        <Text style={styles.noticeCopy}>No completed Coat of Arms yet. Finish one Side Quest and this turns into a mobile trophy shelf.</Text>
      </View>
    );
  }

  return (
    <View style={styles.trophyShelf}>
      <Text style={styles.eyebrow}>Recent Coat of Arms</Text>
      {account.completedQuests.slice(0, 3).map((quest) => (
        <View key={quest.id} style={styles.trophyRow}>
          <View style={styles.trophyBadge}>{quest.badgeImageUrl ? <Image source={{ uri: absoluteAssetUrl(quest.badgeImageUrl) }} style={styles.trophyImage} resizeMode="contain" /> : <Text style={styles.trophyGlyph}>♛</Text>}</View>
          <View style={styles.trophyCopy}>
            <Text style={styles.trophyTitle}>{cleanMultiplayerTitle(quest.title)}</Text>
            <Text style={styles.trophyMeta}>{quest.badgeName} unlocked</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ChessUsernameEditor({
  account,
  authBridge,
  onSaved,
}: {
  account: MobileAccountState;
  authBridge: MobileAuthBridge;
  onSaved: () => void;
}) {
  const [runnerDisplayName, setRunnerDisplayName] = useState(account.profile.displayName ?? "");
  const [runnerBio, setRunnerBio] = useState(account.profile.bio ?? "");
  const [lichessUsername, setLichessUsername] = useState(account.chessAccounts.lichessUsername ?? "");
  const [chessComUsername, setChessComUsername] = useState(account.chessAccounts.chessComUsername ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRunnerDisplayName(account.profile.displayName ?? "");
    setRunnerBio(account.profile.bio ?? "");
    setLichessUsername(account.chessAccounts.lichessUsername ?? "");
    setChessComUsername(account.chessAccounts.chessComUsername ?? "");
  }, [account.chessAccounts.chessComUsername, account.chessAccounts.lichessUsername, account.profile.bio, account.profile.displayName]);

  async function saveUsernames() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const sessionToken = authBridge.isSignedIn ? await authBridge.getSessionToken() : null;
      const result = await updateMobileChessUsernames({ sessionToken, runnerDisplayName, runnerBio, lichessUsername, chessComUsername });
      setMessage(result.message || "Profile saved.");
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save chess usernames.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.usernameEditorCard}>
      <Text style={styles.eyebrow}>Profile details</Text>
      <Text style={styles.usernameEditorTitle}>Edit profile and chess usernames</Text>
      <Text style={styles.usernameEditorBody}>Save your public SQC name, brag line, and chess usernames from the app. Website and mobile stay in sync.</Text>
      <View style={styles.inputStack}>
        <Text style={styles.inputLabel}>Display name</Text>
        <TextInput
          value={runnerDisplayName}
          placeholder="e.g. Andreas"
          placeholderTextColor="rgba(255,247,232,.42)"
          maxLength={60}
          style={styles.textInput}
          onChangeText={setRunnerDisplayName}
        />
        <Text style={styles.inputLabel}>Brag line</Text>
        <TextInput
          multiline
          value={runnerBio}
          placeholder="Trying to win while doing deeply unreasonable things."
          placeholderTextColor="rgba(255,247,232,.42)"
          maxLength={180}
          style={[styles.textInput, styles.multilineInput]}
          onChangeText={setRunnerBio}
        />
        <Text style={styles.inputLabel}>Lichess username</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={lichessUsername}
          placeholder="e.g. and72nor"
          placeholderTextColor="rgba(255,247,232,.42)"
          style={styles.textInput}
          onChangeText={setLichessUsername}
        />
        <Text style={styles.inputLabel}>Chess.com username</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={chessComUsername}
          placeholder="optional"
          placeholderTextColor="rgba(255,247,232,.42)"
          style={styles.textInput}
          onChangeText={setChessComUsername}
        />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Save chess usernames" testID="mobile-save-chess-usernames" style={styles.primaryButton} disabled={saving || !authBridge.isSignedIn} onPress={() => void saveUsernames()}>
        <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save usernames"}</Text>
      </Pressable>
      {!authBridge.isSignedIn ? <Text style={styles.microcopy}>Sign in first to enable native account edits.</Text> : null}
      {message ? <Text style={styles.successCopy}>{message}</Text> : null}
      {error ? <Text style={styles.errorCopy}>{error}</Text> : null}
    </View>
  );
}

function MobileAccountStatesCard({ authBridge, account }: { authBridge: MobileAuthBridge; account: MobileAccountResponse | null }) {
  const authenticated = isAuthenticatedAccount(account);
  const backendAccepted = authenticated ? "Progress sync is active" : authBridge.isSignedIn ? "Tap Sync account to refresh your profile" : "Sign in to save progress";

  return (
    <View style={styles.stateBoardCard}>
      <Text style={styles.eyebrow}>Account sync</Text>
      <Text style={styles.stateBoardTitle}>Your progress stays connected.</Text>
      <Text style={styles.stateBoardBody}>SQC keeps browsing available and syncs progress after sign-in.</Text>
      <View style={styles.stateTimeline}>
        <FlowStep done title="Browse quests" body="Quest goals, rewards, and Coat of Arms previews are available before sign-in." />
        <FlowStep done={authBridge.configured} title="Account sign-in" body={authBridge.configured ? "Sign in to save progress and proof." : "Sign-in is temporarily unavailable."} />
        <FlowStep done={authenticated} title="Progress sync" body={backendAccepted} />
      </View>
    </View>
  );
}

function BigScore({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bigScore}>
      <Text style={styles.bigScoreValue}>{value}</Text>
      <Text style={styles.bigScoreLabel}>{label}</Text>
    </View>
  );
}

function FlowStep({ title, body, done = false }: { title: string; body: string; done?: boolean }) {
  return (
    <View style={[styles.flowStep, done && styles.flowStepDone]}>
      <Text style={styles.flowCheck}>{done ? "✓" : "○"}</Text>
      <View style={styles.flowCopy}>
        <Text style={styles.flowTitle}>{title}</Text>
        <Text style={styles.flowBody}>{body}</Text>
      </View>
    </View>
  );
}


function getDevTrackerPreviewAccount(account: MobileAccountResponse | null, bootstrap: MobileBootstrap): MobileAccountResponse | null {
  if (!__DEV__ || isAuthenticatedAccount(account)) return account;

  const active = bootstrap.challenges.find((challenge) => challenge.id === "queen-never-heard-of-her") ?? bootstrap.challenges[0] ?? null;
  const completed = bootstrap.challenges.filter((challenge) => challenge.id !== active?.id).slice(0, 2);

  return {
    apiVersion: 1,
    authenticated: true,
    generatedAt: new Date().toISOString(),
    profile: {
      displayName: "Andreas",
      bio: "SQC app review account",
      imageUrl: null,
      email: "andreas.nordenadler@gmail.com",
      lastSignInAt: new Date().toISOString(),
    },
    chessAccounts: {
      lichessUsername: "and72nor",
      chessComUsername: "and72nor",
      hasAny: true,
    },
    progress: {
      completedChallengeIds: completed.map((challenge) => challenge.id),
      totalCompletedChallenges: completed.length,
      totalRewardPoints: completed.reduce((sum, challenge) => sum + challenge.reward, 0),
      proofReceiptCount: completed.length,
    },
    activeQuest: active
      ? {
          id: active.id,
          title: active.title,
          status: "active",
          startedAt: new Date().toISOString(),
          verifiedAt: null,
          completed: false,
          banner: "Waiting for latest-game proof",
          href: `/challenges/${active.id}`,
          proofHref: null,
          badgeImageUrl: getSafeBadgeIdentity(active).imageUrl,
        }
      : null,
    activeGroupQuests: [
      {
        id: "review-room",
        title: "Friday Night Bad Ideas",
        status: "Live",
        copy: "2 players · 2d left · #2",
        href: "/groupquests/review-room",
        playersLabel: "2 players",
        timeLeftLabel: "2d left",
        positionLabel: "#2",
        pointsLabel: "",
        verifiedLabel: "2 / 4",
        questTitles: ["Queen? Never Heard of Her", "Knightmare Mode", "Rookless Rampage", "One Bishop to Rule Them All"],
        completedQuestTitles: ["Queen? Never Heard of Her", "Knightmare Mode"],
        ruleRows: [
          { label: "Games allowed", value: "Lichess or Chess.com" },
          { label: "Variant", value: "Standard chess only" },
          { label: "Proof", value: "Fresh public games inside this window" },
          { label: "Winner", value: "First to complete all included Side Quests wins. If nobody finishes, best completion progress at the deadline wins." },
        ],
        leaderboardRows: [
          { rank: "#1", name: "SAM", provider: "lichess · and72nor", points: "3/4", verified: "3/4 verified", note: "Joined this Multiplayer Side Quest" },
          { rank: "#2", name: "Andreas", provider: "lichess · and72nor", points: "2/4", verified: "2/4 verified", note: "You" },
        ],
      },
    ],
    officialPublicGroupQuests: [
      {
        id: "official-preview-knights",
        title: "First Blood: Knights Before Coffee",
        status: "Join",
        copy: "8 players · 18h left",
        href: "/groupquests/official-preview-knights",
        playersLabel: "8 players",
        timeLeftLabel: "18h left",
        joinState: "Join",
        questTitles: ["Knights Before Coffee", "Early King Walk"],
        ruleRows: [
          { label: "Games allowed", value: "Lichess or Chess.com" },
          { label: "Variant", value: "Standard chess only" },
          { label: "Proof", value: "Fresh public games inside this window" },
          { label: "Winner", value: "Best completion progress when time expires." },
        ],
        leaderboardRows: [
          { rank: "#1", name: "Mira", provider: "lichess · miragambit", points: "1/2", verified: "1/2 verified", note: "Joined this Multiplayer Side Quest" },
          { rank: "#2", name: "Jon", provider: "chess.com · jonforks", points: "0/2", verified: "0/2 verified", note: "Joined this Multiplayer Side Quest" },
        ],
      },
      {
        id: "official-preview-no-castle",
        title: "No Castle Club Night",
        status: "Joined",
        copy: "14 players · 2d left · #4",
        href: "/groupquests/official-preview-no-castle?accepted=1",
        playersLabel: "14 players",
        timeLeftLabel: "2d left",
        positionLabel: "#4",
        joinState: "Joined",
        pointsLabel: "",
        verifiedLabel: "1 / 2",
        questTitles: ["No Castle Club", "Early King Walk"],
        completedQuestTitles: ["Early King Walk"],
        ruleRows: [
          { label: "Games allowed", value: "Lichess or Chess.com" },
          { label: "Variant", value: "Standard chess only" },
          { label: "Proof", value: "Fresh public games inside this window" },
          { label: "Winner", value: "Best completion progress when time expires." },
        ],
        leaderboardRows: [
          { rank: "#1", name: "Greta", provider: "lichess · gretafork", points: "2/2", verified: "2/2 verified", note: "Joined this Multiplayer Side Quest" },
          { rank: "#4", name: "Andreas", provider: "lichess · and72nor", points: "1/2", verified: "1/2 verified", note: "You" },
        ],
      },
      {
        id: "official-preview-queenless",
        title: "Queenless Gremlin Cup",
        status: "Join",
        copy: "5 players · 4d left",
        href: "/groupquests/official-preview-queenless",
        playersLabel: "5 players",
        timeLeftLabel: "4d left",
        joinState: "Join",
        questTitles: ["Queen? Never Heard of Her", "The Blunder Gambit"],
        ruleRows: [
          { label: "Games allowed", value: "Lichess or Chess.com" },
          { label: "Variant", value: "Standard chess only" },
          { label: "Proof", value: "Fresh public games inside this window" },
          { label: "Winner", value: "Best completion progress when time expires." },
        ],
        leaderboardRows: [
          { rank: "#1", name: "Nils", provider: "lichess · nilsgremlin", points: "1/2", verified: "1/2 verified", note: "Joined this Multiplayer Side Quest" },
          { rank: "#2", name: "Sasha", provider: "chess.com · sashaqueenless", points: "0/2", verified: "0/2 verified", note: "Joined this Multiplayer Side Quest" },
        ],
      },
    ],
    completedQuests: completed.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      reward: challenge.reward,
      badgeName: getSafeBadgeIdentity(challenge).name,
      completedAt: new Date().toISOString(),
      href: `/challenges/${challenge.id}`,
      proofHref: `/proof/preview-${challenge.id}`,
      badgeImageUrl: getSafeBadgeIdentity(challenge).imageUrl,
    })),
    multiplayerTrophies: [
      {
        id: "review-room-gold",
        title: "Friday Night Bad Ideas",
        placement: "Gold",
        rankLabel: "1st place",
        completedAt: new Date().toISOString(),
        href: "/groupquests/review-room?accepted=1",
      },
    ],
    latestReceipt: null,
  };
}


function coerceAccountResponse(value: void | MobileAccountResponse | null): MobileAccountResponse | null {
  return value && typeof value === "object" && "authenticated" in value ? value : null;
}

function isAuthenticatedAccount(account: MobileAccountResponse | null): account is MobileAccountState {
  return Boolean(account?.authenticated);
}

function getChallengeCoatImageSource(challenge: MobileChallenge): ImageSourcePropType {
  const imageUrl = getSafeBadgeIdentity(challenge).imageUrl ?? CHALLENGE_COAT_IMAGE_PATHS[challenge.id] ?? null;
  if (imageUrl?.includes("/badges/custom/")) return getCustomQuestImageSource(imageUrl);
  return CHALLENGE_COAT_IMAGE_ASSETS[challenge.id] ?? { uri: getChallengeCoatImageUrl(challenge) ?? absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") };
}

function getChallengeCoatImageUrl(challenge: MobileChallenge) {
  const imageUrl = getSafeBadgeIdentity(challenge).imageUrl ?? CHALLENGE_COAT_IMAGE_PATHS[challenge.id];
  return imageUrl ? absoluteAssetUrl(imageUrl) : null;
}

function absoluteAssetUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${getApiBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

function formatComingSoonDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

function showNativeOnlyNotice(message: string) {
  Alert.alert("Staying in the app", message);
}

function openProofReceipt(_proofHref: string | null) {
  Alert.alert("Proof details", "This result is confirmed and stored in the app. Native proof-detail screens are used instead of opening an external page.");
}

const colors = {
  bg: "#060507",
  paper: "#fff7e8",
  muted: "#c7bda9",
  gold: "#f5c86a",
  green: "#60f0af",
  red: "#ff7a66",
  panel: "rgba(255,247,232,.08)",
  panelStrong: "rgba(255,247,232,.12)",
  stroke: "rgba(255,247,232,.14)",
};

function colorWithAlpha(value: string | undefined, alpha: number): string {
  if (!value) return `rgba(245,200,106,${alpha})`;

  const hex = value.trim().match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    const numeric = Number.parseInt(hex[1], 16);
    const red = (numeric >> 16) & 255;
    const green = (numeric >> 8) & 255;
    const blue = numeric & 255;
    return `rgba(${red},${green},${blue},${alpha})`;
  }

  const rgba = value.trim().match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgba) return `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${alpha})`;

  return value;
}

const compactStyles = StyleSheet.create({

  celebrationBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 18, backgroundColor: "rgba(3,2,4,.88)" },
  celebrationGlow: { position: "absolute", width: 420, height: 420, borderRadius: 210, opacity: .95 },
  celebrationCard: { width: "100%", maxWidth: 430, borderRadius: 32, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(10,8,11,.96)", padding: 20, alignItems: "center", gap: 8, overflow: "hidden" },
  celebrationKicker: { color: colors.gold, fontSize: 11, lineHeight: 14, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  celebrationHeadline: { color: colors.paper, fontSize: 27, lineHeight: 31, fontWeight: "900", letterSpacing: -.65, textAlign: "center" },
  celebrationSubline: { color: colors.muted, fontSize: 14, lineHeight: 19, fontWeight: "800", textAlign: "center" },
  celebrationCoatFrame: { width: 218, height: 198, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 2 },
  celebrationCoatGlow: { position: "absolute", width: 218, height: 190, opacity: .92 },
  celebrationCoat: { width: 154, height: 154, zIndex: 2 },
  celebrationSeal: { position: "absolute", width: 86, height: 86, right: 18, bottom: 10, zIndex: 4, transform: [{ rotate: "-10deg" }] },
  celebrationParticles: { position: "absolute", width: 230, height: 200, zIndex: 3 },
  celebrationParticle: { position: "absolute", fontSize: 26, fontWeight: "900", textShadowColor: "rgba(245,200,106,.22)", textShadowRadius: 12 },
  celebrationTitle: { color: colors.paper, fontSize: 20, lineHeight: 24, fontWeight: "900", letterSpacing: -.35, textAlign: "center" },
  celebrationBadge: { color: colors.gold, fontSize: 13, lineHeight: 17, fontWeight: "900", textAlign: "center" },
  celebrationFlavor: { color: colors.paper, opacity: .84, fontSize: 13, lineHeight: 18, fontWeight: "700", textAlign: "center", paddingHorizontal: 6 },
  celebrationMeta: { color: colors.green, fontSize: 12, lineHeight: 16, fontWeight: "800", textAlign: "center" },
  celebrationCloseButton: { position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,247,232,.10)" },
  stack: { gap: 8 },
  freshShell: { gap: 12 },
  freshHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 2, paddingTop: 0 },
  freshHeaderCentered: { flexDirection: "column", justifyContent: "center", gap: 6, paddingHorizontal: 12 },
  centerText: { textAlign: "center" },
  identityBlock: { flex: 1, minWidth: 0, alignItems: "center", gap: 4 },
  freshTitle: { color: colors.paper, fontSize: 24, lineHeight: 28, fontWeight: "900", letterSpacing: -.65 },
  freshSubtle: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 2 },
  identityLine: { alignItems: "center", gap: 4, minWidth: 0, maxWidth: "100%" },
  identityName: { color: colors.paper, fontSize: 17, lineHeight: 21, fontWeight: "900", letterSpacing: -.25, textAlign: "center" },
  identityAccountsLine: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: 7, rowGap: 3 },
  identityAccount: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, maxWidth: "48%" },
  identityPlatform: { overflow: "hidden", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, fontSize: 8, lineHeight: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: .25 },
  identityPlatformLichess: { color: colors.green, backgroundColor: "rgba(96,240,175,.1)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  identityPlatformChessCom: { color: "#76a9ff", backgroundColor: "rgba(118,169,255,.1)", borderWidth: 1, borderColor: "rgba(118,169,255,.18)" },
  identityUsername: { color: colors.paper, fontSize: 12, lineHeight: 15, fontWeight: "900" },
  accountDot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "rgba(245,200,106,.16)", borderWidth: 1, borderColor: "rgba(245,200,106,.24)" },
  accountAvatarImage: { width: "100%", height: "100%", borderRadius: 19 },
  accountDotText: { color: colors.gold, fontSize: 16, fontWeight: "900" },
  homeMenuButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,5,7,.58)", borderWidth: 1, borderColor: "rgba(255,247,232,.16)" },
  homeMenuButtonActive: { backgroundColor: "rgba(245,200,106,.18)", borderColor: "rgba(245,200,106,.28)" },
  homeMenuSpacer: { width: 40, height: 40 },
  homeMenuOverlay: { flex: 1, backgroundColor: "rgba(14,10,7,.018)", justifyContent: "flex-start", alignItems: "stretch", paddingTop: 112, paddingHorizontal: 18 },
  homeMenuBackdrop: { ...StyleSheet.absoluteFillObject },
  homeMenuPanel: { alignSelf: "flex-start", width: 162, marginLeft: 2, gap: 2, paddingVertical: 4, paddingHorizontal: 4, borderRadius: 13, backgroundColor: "rgba(78,54,33,.93)", borderWidth: 1, borderColor: "rgba(245,200,106,.16)", shadowColor: "#000", shadowOpacity: .10, shadowRadius: 7, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  homeMenuItems: { gap: 2 },
  homeMenuItem: { minHeight: 30, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: "transparent" },
  homeMenuItemText: { flex: 1, color: colors.paper, fontSize: 11.5, lineHeight: 15, fontWeight: "900" },
  readinessRow: { flexDirection: "row", gap: 8 },
  readinessChip: { flex: 1, gap: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: "rgba(96,240,175,.1)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  readinessChipMissing: { backgroundColor: "rgba(245,200,106,.12)", borderColor: "rgba(245,200,106,.22)" },
  readinessLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .7 },
  readinessValue: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  blockerPanel: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(255,122,102,.12)", borderWidth: 1, borderColor: "rgba(255,122,102,.28)" },
  blockerTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  blockerCopy: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  freshPanel: { gap: 10, padding: 12, borderRadius: 20, backgroundColor: "rgba(255,255,255,.075)", borderWidth: 1, borderColor: "rgba(255,255,255,.12)" },
  activeSoloPill: { alignSelf: "center", alignItems: "center", justifyContent: "center", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "rgba(245,200,106,.10)", borderWidth: 1, borderColor: "rgba(245,200,106,.24)", marginTop: 0, marginBottom: 1 },
  activeSoloPillText: { color: colors.gold, fontSize: 10, lineHeight: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  activeSoloSection: { position: "relative", gap: 8, marginTop: 132, padding: 13, paddingTop: 24, borderRadius: 24, backgroundColor: "rgba(255,247,232,.078)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  activeMultiplayerSection: { position: "relative", gap: 8, marginTop: 70, padding: 13, paddingTop: 24, borderRadius: 24, backgroundColor: "rgba(255,247,232,.064)", borderWidth: 1, borderColor: "rgba(255,247,232,.14)" },
  activeMultiplayerSummary: { gap: 10, alignItems: "center" },
  multiplayerHeroMarker: { position: "absolute", top: -116, alignSelf: "center", width: 112, height: 112, alignItems: "center", justifyContent: "center", overflow: "visible", zIndex: 7 },
  multiplayerHeroSeal: { width: 100, height: 100 },
  activeMultiplayerList: { overflow: "hidden", borderRadius: 18, backgroundColor: "rgba(13,11,14,.78)", borderWidth: 1, borderColor: "rgba(255,255,255,.09)" },
  trophyCabinetSection: { position: "relative", gap: 8, marginTop: 100, padding: 13, paddingTop: 24, borderRadius: 24, backgroundColor: "rgba(255,247,232,.064)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  trophyHeroMarker: { position: "absolute", top: -118, alignSelf: "center", width: 126, height: 126, alignItems: "center", justifyContent: "center", overflow: "visible", zIndex: 7 },
  trophyHeroCoat: { width: 112, height: 126 },
  activeSoloRefreshRow: { position: "absolute", top: 8, right: 8, zIndex: 8, flexDirection: "row", justifyContent: "flex-end" },
  activeSoloSummary: { gap: 10, alignItems: "center" },
  freshPanelCentered: { gap: 10, alignItems: "center", paddingHorizontal: 12 }, 
  freshGuestCoatWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 4 },
  freshGuestCoat: { width: 132, height: 148 },
  emptyQuestPanel: { gap: 12, padding: 13, borderRadius: 24, backgroundColor: "rgba(255,247,232,.078)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  emptyQuestHeroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyQuestCoat: { width: 82, height: 82 },
  emptyMultiplayerPanel: { gap: 12, padding: 13, borderRadius: 24, backgroundColor: "rgba(255,247,232,.072)", borderWidth: 1, borderColor: "rgba(255,247,232,.14)" },
  emptyMultiplayerSeal: { width: 52, height: 52, borderRadius: 26 },
  emptyMultiplayerActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 },
  emptyMultiplayerCreateButton: { alignSelf: "center" },
  panelHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerIconButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.24)" },
  currentStatusRow: { flexDirection: "row", justifyContent: "flex-end" },
  freshSectionTitle: { color: colors.paper, fontSize: 15, fontWeight: "900", letterSpacing: -.15 },
  freshBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  currentQuestRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  currentQuestHero: { alignItems: "center", justifyContent: "center", gap: 2, paddingTop: 0, paddingBottom: 0 },
  coatHeroMarker: { position: "absolute", top: -152, alignSelf: "center", width: 151, height: 151, alignItems: "center", justifyContent: "center", overflow: "visible", zIndex: 7 },
  coatHeroGlowImage: { position: "absolute", width: 170, height: 170, opacity: .62, transform: [{ translateY: 3 }] },
  coatHeroImage: { width: 139, height: 152 },
  coatHeroSeal: { position: "absolute", width: 42, height: 42, right: 6, bottom: 4, zIndex: 4, transform: [{ rotate: "-10deg" }] },
  currentQuestHeroTitle: { maxWidth: 286, color: colors.paper, fontSize: 20, lineHeight: 23, fontWeight: "900", letterSpacing: -.55, textAlign: "center", marginTop: 0 },
  coatMarker: { width: 62, height: 70, alignItems: "center", justifyContent: "center", overflow: "visible" },
  coatMarkerGlowImage: { position: "absolute", width: 78, height: 88, opacity: .74, transform: [{ translateY: 4 }] },
  coatMarkerImage: { width: 56, height: 64 },
  coatMarkerSeal: { position: "absolute", width: 32, height: 32, right: -4, bottom: -3, zIndex: 4, transform: [{ rotate: "-10deg" }] },
  currentQuestText: { flex: 1, minWidth: 0, gap: 3 },
  currentQuestTitle: { color: colors.paper, fontSize: 19, lineHeight: 22, fontWeight: "900", letterSpacing: -.35 },
  currentQuestMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  currentQuestMetaStrong: { color: colors.gold, fontWeight: "900" },
  currentQuestMetaDanger: { color: "#ff6f6f", fontWeight: "900" },
  currentQuestMetaGood: { color: "#60f0af", fontWeight: "900" },
  currentQuestSupport: { color: colors.paper, opacity: .82, fontSize: 12, lineHeight: 15, fontWeight: "800" },
  currentQuestMetaStack: { gap: 4, paddingTop: 1 },
  proofCheckMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", maxWidth: "100%" },
  proofCheckMetaText: { flexShrink: 1 },
  actionRowTight: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryAction: { alignSelf: "flex-start", alignItems: "center", justifyContent: "center", paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.gold },
  primaryActionCentered: { alignSelf: "center" },
  primaryActionText: { color: "#111", fontSize: 13, fontWeight: "900" },
  activeSoloActions: { gap: 7, paddingTop: 2 },
  soloPrimaryAction: { width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.gold },
  soloSecondaryAction: { width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 9, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,.045)", borderWidth: 1, borderColor: "rgba(255,247,232,.11)" },
  soloSecondaryActionText: { color: "rgba(255,247,232,.86)", fontSize: 12, fontWeight: "900" },
  refreshAction: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.gold },
  secondaryAction: { alignSelf: "flex-start", alignItems: "center", justifyContent: "center", paddingVertical: 9, paddingHorizontal: 13, borderRadius: 999, backgroundColor: "rgba(255,255,255,.08)", borderWidth: 1, borderColor: "rgba(255,255,255,.13)" },
  secondaryActionText: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  appSection: { gap: 6 },
  sectionAction: { color: "rgba(245,200,106,.78)", fontSize: 12, fontWeight: "900" },
  appRows: { overflow: "hidden", borderRadius: 18, backgroundColor: "rgba(13,11,14,.78)", borderWidth: 1, borderColor: "rgba(255,255,255,.09)" },
  homeFeatureCard: { minHeight: 90, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.065)", backgroundColor: "rgba(245,200,106,.032)" },
  homeFeatureImageFrame: { width: 58, height: 62, alignItems: "center", justifyContent: "center", overflow: "visible" },
  homeFeatureGlowImage: { position: "absolute", width: 74, height: 82, opacity: .54, transform: [{ translateY: 3 }] },
  homeFeatureCoatImage: { width: 51, height: 58 },
  homeFeatureSealImage: { width: 52, height: 52, borderRadius: 26 },
  homeFeatureCopy: { flex: 1, minWidth: 0, gap: 3 },
  homeFeatureEyebrow: { color: colors.gold, fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: .7 },
  homeFeatureTitle: { color: colors.paper, fontSize: 15, lineHeight: 19, fontWeight: "900", letterSpacing: -.25 },
  homeFeatureBody: { color: "rgba(199,189,169,.82)", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  homeFeatureMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 2 },
  homeFeatureMeta: { overflow: "hidden", color: "rgba(255,247,232,.82)", fontSize: 9, lineHeight: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: .42, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(255,247,232,.065)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  appRow: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.065)" },
  rowCoatFrame: { width: 32, height: 36, alignItems: "center", justifyContent: "center", overflow: "visible" },
  rowCoatGlowImage: { position: "absolute", width: 44, height: 48, opacity: .62, transform: [{ translateY: 3 }] },
  rowCoatImage: { width: 30, height: 34 },
  rowCoatImageDim: { opacity: .52 },
  rowSealImage: { width: 31, height: 31, borderRadius: 15.5 },
  rowCompletedSealBackdrop: { position: "absolute", width: 22, height: 22, right: -6, bottom: -5, borderRadius: 999, backgroundColor: "#a81717", transform: [{ scaleX: 1.08 }, { scaleY: 1.02 }] },
  rowCompletedSeal: { position: "absolute", width: 18, height: 18, right: -4, bottom: -3 },
  rowStatusSealImage: { width: 35, height: 35, marginLeft: 6 },
  appRowText: { flex: 1, minWidth: 0, gap: 2 },
  appRowTitle: { color: colors.paper, fontSize: 14, fontWeight: "800", flexShrink: 1 },
  appRowMeta: { color: colors.muted, fontSize: 12 },
  sourceBadge: { alignSelf: "flex-start", overflow: "hidden", color: colors.gold, fontSize: 9, lineHeight: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: .65, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: "rgba(245,200,106,.12)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  communitySubTabs: { flexDirection: "row", gap: 8, padding: 4, borderRadius: 18, backgroundColor: "rgba(255,247,232,.055)", borderWidth: 1, borderColor: "rgba(255,247,232,.09)" },
  communitySubTab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 38, borderRadius: 14 },
  communitySubTabActive: { backgroundColor: "rgba(96,240,175,.16)", borderWidth: 1, borderColor: "rgba(96,240,175,.3)" },
  communitySubTabText: { color: "rgba(255,247,232,.62)", fontSize: 12, lineHeight: 15, fontWeight: "900" },
  communitySubTabTextActive: { color: colors.green },
  communityBrowsePanel: { gap: 8, padding: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,.045)", borderWidth: 1, borderColor: "rgba(255,255,255,.09)" },
  communitySearchBox: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,247,232,.12)" },
  communitySearchInput: { flex: 1, minWidth: 0, color: colors.paper, fontSize: 14, lineHeight: 18, fontWeight: "800", paddingVertical: Platform.OS === "ios" ? 10 : 6 },
  communityChipRow: { gap: 7, paddingRight: 4 },
  communityChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,247,232,.055)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  communityChipActive: { backgroundColor: "rgba(96,240,175,.16)", borderColor: "rgba(96,240,175,.34)" },
  communityChipText: { color: "rgba(255,247,232,.68)", fontSize: 11, lineHeight: 14, fontWeight: "900" },
  communityChipTextActive: { color: colors.green },
  communityControlsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  communityControlsStack: { gap: 8, alignItems: "flex-start" },
  communitySortRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  communitySortLabel: { color: "rgba(255,247,232,.52)", fontSize: 11, lineHeight: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: .7 },
  communitySortButton: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,247,232,.045)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  communitySortButtonActive: { backgroundColor: "rgba(245,200,106,.14)", borderColor: "rgba(245,200,106,.28)" },
  communitySortText: { color: "rgba(255,247,232,.62)", fontSize: 10, lineHeight: 13, fontWeight: "900" },
  communitySortTextActive: { color: colors.gold },
  communitySortCompact: { flexShrink: 0, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(245,200,106,.12)", borderWidth: 1, borderColor: "rgba(245,200,106,.24)" },
  communitySortCompactText: { color: colors.gold, fontSize: 11, lineHeight: 14, fontWeight: "900" },
  communityEmptyPanel: { gap: 5, padding: 12, borderRadius: 18, backgroundColor: "rgba(255,255,255,.055)", borderWidth: 1, borderColor: "rgba(255,255,255,.1)" },
  communityEmptyTitle: { color: colors.paper, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  communityEmptyCopy: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  appRowStatus: { maxWidth: 88, color: "rgba(245,200,106,.86)", fontSize: 10, fontWeight: "900", textAlign: "right", textTransform: "uppercase", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(255,247,232,.065)" },
  appRowStatusJoined: { color: colors.green },
  appRowStatusGreen: { backgroundColor: "#60f0af", color: "#111" },
  appRowStatusGold: { backgroundColor: "#f5c86a", color: "#111" },
  appRowStatusOrange: { backgroundColor: "#e87922", color: "#111" },
  appRowStatusDanger: { backgroundColor: "#ff7a66", color: "#111" },
  appRowStatusAbsurd: { backgroundColor: "#08070a", color: "#ff7a66", borderWidth: 1, borderColor: "rgba(255,122,102,.55)" },
  helpSupportRow: { gap: 4, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.07)" },
  helpSupportThread: { gap: 8, padding: 10, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  helpSupportMessageBubble: { alignSelf: "flex-end", maxWidth: "92%", gap: 4, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 16, backgroundColor: "rgba(245,200,106,.12)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  helpSupportAdminBubble: { alignSelf: "flex-start", backgroundColor: "rgba(96,240,175,.1)", borderColor: "rgba(96,240,175,.24)" },
  helpSupportMessageMeta: { color: colors.gold, fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: .5 },
  helpSupportBody: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  sideQuestListEmblemWrap: { alignItems: "center", justifyContent: "center", paddingTop: 8, paddingBottom: 6 },
  sideQuestListEmblem: { width: 82, height: 92 },
  detailScreen: { flex: 1, backgroundColor: colors.bg },
  detailTopBar: { position: "absolute", top: 54, right: 16, zIndex: 50, minHeight: 40, paddingHorizontal: 0, paddingTop: 0, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
  detailCloseButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,5,7,.72)", borderWidth: 1, borderColor: "rgba(255,247,232,.24)", shadowColor: "#000", shadowOpacity: .25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  detailContent: { paddingTop: 104, paddingHorizontal: 16, paddingBottom: 104, gap: 8 },
  detailHero: { alignItems: "center", gap: 5, paddingTop: 0, paddingBottom: 2 },
  completedProofScreen: { gap: 10 },
  trophyProofStack: { gap: 8 },
  completedProofCoatFrame: { width: 124, height: 136, alignItems: "center", justifyContent: "center", overflow: "visible" },
  completedProofSeal: { position: "absolute", right: 6, bottom: 4, width: 44, height: 44 },
  completedProofSealBadge: { marginTop: 10, alignItems: "center", justifyContent: "center", gap: 4 },
  completedProofSealBadgeImage: { width: 72, height: 72 },
  completedProofSealBadgeText: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.1 },
  completedProofKicker: { color: colors.green, fontSize: 11, lineHeight: 14, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: .8 },
  completedProofBadgeName: { color: colors.paper, opacity: .88, fontSize: 12, lineHeight: 16, fontWeight: "900", textAlign: "center" },
  proofScrollCard: { gap: 6, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "rgba(255,247,232,.92)", shadowColor: "#000", shadowOpacity: .26, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  proofScrollEyebrow: { color: "#7f1d1d", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .9, textAlign: "center" },
  proofScrollTitle: { color: "#20130c", fontSize: 18, lineHeight: 22, fontWeight: "900", textAlign: "center", letterSpacing: -.4 },
  proofScrollCopy: { color: "#4a2b1c", fontSize: 12, lineHeight: 17, fontWeight: "700", textAlign: "center" },
  proofScrollRule: { height: 1, marginVertical: 4, backgroundColor: "rgba(127,29,29,.2)" },
  proofScrollMeta: { color: "#7f1d1d", fontSize: 12, lineHeight: 16, fontWeight: "900", textAlign: "center" },
  proofImageHint: { color: "rgba(199,189,169,.72)", fontSize: 11, lineHeight: 15, fontWeight: "800", textAlign: "center", marginTop: -4 },
  multiplayerDetailHero: { alignItems: "center", gap: 5, paddingTop: 0, paddingBottom: 1 },
  multiplayerDetailSeal: { width: 116, height: 116, borderRadius: 58 },
  multiplayerRuleQuestCoat: { width: 94, height: 104 },
  multiplayerDetailKicker: { color: colors.green, fontSize: 10, lineHeight: 14, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: .8 },
  multiplayerScoreGrid: { flexDirection: "row", gap: 8 },
  multiplayerScoreTile: { flex: 1, gap: 3, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 15, backgroundColor: "rgba(255,247,232,.08)", borderWidth: 1, borderColor: "rgba(255,247,232,.12)" },
  multiplayerScoreLabel: { color: colors.muted, fontSize: 10, lineHeight: 13, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: .45 },
  multiplayerScoreValue: { color: colors.paper, fontSize: 13, lineHeight: 17, fontWeight: "900", textAlign: "center" },
  multiplayerNativeCard: { gap: 8, padding: 11, borderRadius: 19, backgroundColor: "rgba(255,247,232,.085)", borderWidth: 1, borderColor: "rgba(255,247,232,.14)" },
  multiplayerOptionGrid: { gap: 7 },
  customPieceChoiceGroup: { gap: 7 },
  customPieceChoiceGroupSelected: { gap: 7, padding: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(245,200,106,.2)", backgroundColor: "rgba(245,200,106,.055)" },
  customPieceSubchoicePanel: { gap: 7, marginLeft: 18, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: "rgba(245,200,106,.35)" },
  customPieceSubchoiceLabel: { color: "rgba(245,200,106,.82)", fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: .45 },
  customCoatPreviewRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 18, backgroundColor: "rgba(245,200,106,.09)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  customCoatPreviewImage: { width: 74, height: 74 },
  customCoatPreviewCopy: { flex: 1, gap: 4 },
  customTimingChoiceCard: { flexDirection: "column", alignItems: "stretch", gap: 8 },
  customTimingChoiceHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  customTimingNestedInput: { gap: 5, marginLeft: 24, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: "rgba(245,200,106,.35)" },
  customConditionListRow: { gap: 9, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(0,0,0,.16)" },
  customConditionIndex: { color: colors.gold, fontSize: 16, lineHeight: 20, fontWeight: "900", textAlign: "center" },
  multiplayerOptionCard: { flexDirection: "row", alignItems: "center", gap: 9, minHeight: 52, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(0,0,0,.16)" },
  multiplayerOptionCardSelected: { borderColor: "rgba(245,200,106,.48)", backgroundColor: "rgba(245,200,106,.13)" },
  multiplayerOptionDot: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: "rgba(255,247,232,.32)", backgroundColor: "rgba(0,0,0,.24)" },
  multiplayerOptionDotSelected: { borderColor: colors.gold, backgroundColor: colors.gold },
  multiplayerOptionCopy: { flex: 1, gap: 1 },
  multiplayerOptionTitle: { color: colors.paper, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  multiplayerOptionTitleSelected: { color: colors.gold, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  multiplayerOptionHelper: { color: "rgba(255,247,232,.62)", fontSize: 11, lineHeight: 15, fontWeight: "800" },
  multiplayerCardEyebrow: { color: colors.green, fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: .9, textAlign: "center" },
  multiplayerCardTitle: { color: colors.paper, fontSize: 18, lineHeight: 22, fontWeight: "900", textAlign: "center", letterSpacing: -.4 },
  multiplayerListStack: { gap: 7 },
  multiplayerQuestRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 13, backgroundColor: "rgba(0,0,0,.16)" },
  multiplayerQuestCoat: { width: 34, height: 38 },
  multiplayerQuestTitle: { flex: 1, color: colors.paper, fontSize: 13, lineHeight: 17, fontWeight: "900" },
  multiplayerRuleRow: { gap: 3, paddingVertical: 8, paddingHorizontal: 9, borderRadius: 13, backgroundColor: "rgba(0,0,0,.14)" },
  multiplayerRuleLabel: { color: "rgba(255,247,232,.76)", fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: .45 },
  multiplayerRuleValue: { color: colors.paper, fontSize: 12, lineHeight: 16, fontWeight: "800" },
  multiplayerInlineAction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  multiplayerLeaderboardAppRow: { alignItems: "flex-start", paddingVertical: 10 },
  multiplayerRankBadge: { width: 42, minHeight: 42, alignItems: "center", justifyContent: "center" },
  multiplayerRankBadgeText: { color: colors.gold, fontSize: 22, lineHeight: 26, fontWeight: "900", letterSpacing: -.5 },
  multiplayerLeaderboardRow: { flexDirection: "row", gap: 10, padding: 10, borderRadius: 14, backgroundColor: "rgba(0,0,0,.16)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  multiplayerRank: { width: 34, color: colors.gold, fontSize: 18, lineHeight: 22, fontWeight: "900", textAlign: "center" },
  multiplayerLeaderboardCopy: { flex: 1, gap: 2 },
  multiplayerLeaderboardTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  multiplayerLeaderboardName: { flex: 1, color: colors.paper, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  multiplayerLeaderboardPoints: { color: colors.gold, fontSize: 12, lineHeight: 16, fontWeight: "900" },
  multiplayerProgressTrack: { height: 8, overflow: "hidden", borderRadius: 999, backgroundColor: "rgba(255,247,232,.16)", borderWidth: 1, borderColor: "rgba(255,247,232,.12)" },
  multiplayerProgressFill: { height: "100%", borderRadius: 999, backgroundColor: colors.green },
  multiplayerFooterActions: { alignItems: "center", gap: 8, paddingTop: 2 },
  pullRefreshHintInline: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 3 },
  detailCoatFrame: { width: 104, height: 112, alignItems: "center", justifyContent: "center", overflow: "visible" },
  detailCoatGlowImage: { position: "absolute", width: 136, height: 148, opacity: .7, transform: [{ translateY: 7 }] },
  detailCoatImage: { width: 94, height: 104 },
  detailEyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .85 },
  detailTitle: { color: colors.paper, fontSize: 25, lineHeight: 28, fontWeight: "900", textAlign: "center", letterSpacing: -1.05 },
  detailGoal: { maxWidth: 318, color: colors.muted, fontSize: 13, lineHeight: 17, fontWeight: "700", textAlign: "center" },
  detailHint: { color: "rgba(199,189,169,.72)", fontSize: 10, lineHeight: 13, fontWeight: "800", textAlign: "center" },
  detailLatestCheck: { color: colors.gold, fontSize: 12, lineHeight: 16, fontWeight: "900", textAlign: "center" },
  detailPanel: { overflow: "hidden", borderRadius: 16, backgroundColor: "rgba(255,247,232,.075)", borderWidth: 1, borderColor: "rgba(255,247,232,.11)" },
  detailPanelStrong: { gap: 6, padding: 10, borderRadius: 17, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  proofReadyHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  proofReadySealFrame: { width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,.18)" },
  proofReadySealImage: { width: 46, height: 46 },
  proofReadyCopyBlock: { flex: 1, minWidth: 0, gap: 3 },
  currentFailurePanel: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8, paddingVertical: 4, paddingHorizontal: 2, backgroundColor: "transparent", borderWidth: 0, borderColor: "transparent" },
  currentProofInlinePanel: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, paddingHorizontal: 2, paddingVertical: 4 },
  currentEmptyBoardPanel: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, paddingHorizontal: 2, paddingVertical: 4 },
  currentFailureMiniBoardFrame: { width: 86, height: 86, flexShrink: 0, padding: 4, borderRadius: 15, backgroundColor: "rgba(18,14,13,.94)", borderWidth: 1, borderColor: "rgba(245,200,106,.4)", shadowColor: "#000", shadowOpacity: .18, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  currentProofMiniBoardFrame: { width: 112, height: 112, flexShrink: 0, padding: 0, borderRadius: 13, backgroundColor: "transparent", borderWidth: 0 },
  currentFailureMiniBoard: { width: 148, height: 148, flexShrink: 0, flexDirection: "row", flexWrap: "wrap", overflow: "hidden", borderRadius: 13, borderWidth: 0 },
  currentProofIntegratedBoard: { width: 148, height: 148, flexShrink: 0, flexDirection: "row", flexWrap: "wrap", overflow: "hidden", borderRadius: 13, borderWidth: 0 },
  currentFailureMiniSquare: { width: "12.5%", height: "12.5%", alignItems: "center", justifyContent: "center", position: "relative" },
  currentFailureMiniHighlightRing: { position: "absolute", left: 1, right: 1, top: 1, bottom: 1, borderRadius: 3, borderWidth: 1.5, borderColor: "#79e6ff", backgroundColor: "rgba(255,210,78,.28)" },
  currentFailureMiniPiece: { fontSize: 15, lineHeight: 17, fontWeight: "900" },
  emptyBoardSquareLight: { backgroundColor: "rgba(230,201,147,.38)" },
  emptyBoardSquareDark: { backgroundColor: "rgba(127,79,49,.52)" },
  currentFailureCopyBlock: { flex: 1, minWidth: 0, gap: 4 },
  currentProofTextBlock: { flex: 1, minWidth: 0, gap: 4, alignItems: "flex-start" },
  currentFailureTitle: { color: "rgba(245,200,106,.95)", fontSize: 11, lineHeight: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: .6 },
  currentFailureCopy: { color: "rgba(255,247,232,.84)", fontSize: 12, lineHeight: 16, fontWeight: "800", textAlign: "left" },
  currentProofMiniPiece: { fontSize: 15, lineHeight: 17, fontWeight: "900", textAlign: "center" },
  currentProofMiniSquareHighlight: { borderWidth: 1, borderColor: "rgba(84,226,151,.76)" },
  currentProofMiniHighlightDot: { position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: "rgba(84,226,151,.24)", borderWidth: 1, borderColor: "rgba(84,226,151,.55)" },
  currentEmptyBoardTitle: { color: "rgba(245,200,106,.9)", fontSize: 11, lineHeight: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: .6 },
  currentEmptyBoardCopy: { color: colors.muted, fontSize: 12, lineHeight: 16, fontWeight: "800", textAlign: "left" },
  failureBoardPanel: { gap: 12, padding: 13, borderRadius: 24, backgroundColor: "rgba(46,31,26,.82)", borderWidth: 1, borderColor: "rgba(245,200,106,.34)", shadowColor: "#000", shadowOpacity: .24, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  failureBoardHeader: { gap: 3, paddingHorizontal: 2 },
  failureBoardKicker: { color: "rgba(245,200,106,.94)", fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.15 },
  failureBoardMove: { color: colors.paper, fontSize: 17, lineHeight: 22, fontWeight: "900", letterSpacing: -.35 },
  failureBoardSubhead: { color: "rgba(224,211,188,.78)", fontSize: 11, lineHeight: 15, fontWeight: "800" },
  failureBoardFrame: { gap: 8, padding: 8, borderRadius: 21, backgroundColor: "rgba(18,14,13,.92)", borderWidth: 1, borderColor: "rgba(245,200,106,.38)" },
  failureBoardInnerFrame: { padding: 5, borderRadius: 16, backgroundColor: "rgba(151,98,54,.35)", borderWidth: 1, borderColor: "rgba(255,247,232,.14)" },
  failureBoard: { width: "100%", aspectRatio: 1, flexDirection: "row", flexWrap: "wrap", overflow: "hidden", borderRadius: 11, borderWidth: 1, borderColor: "rgba(28,19,16,.86)" },
  failureBoardSquare: { width: "12.5%", height: "12.5%", alignItems: "center", justifyContent: "center", position: "relative" },
  failureBoardSquareLight: { backgroundColor: "#f0d29b" },
  failureBoardSquareDark: { backgroundColor: "#815034" },
  failureBoardSquareHighlight: { backgroundColor: "#d6a23a" },
  failureBoardHighlightRing: { position: "absolute", left: 4, right: 4, top: 4, bottom: 4, borderRadius: 7, borderWidth: 2.5, borderColor: "#79e6ff", backgroundColor: "rgba(255,235,105,.2)" },
  failureBoardRankLabel: { position: "absolute", left: 2, top: 1, color: "rgba(35,24,18,.58)", fontSize: 8, lineHeight: 10, fontWeight: "900" },
  failureBoardFileLabel: { position: "absolute", right: 2, bottom: 0, color: "rgba(35,24,18,.58)", fontSize: 8, lineHeight: 10, fontWeight: "900", textTransform: "uppercase" },
  failureBoardPiece: { fontSize: 28, lineHeight: 32, fontWeight: "900", textShadowColor: "rgba(0,0,0,.26)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1.5 },
  failureBoardPieceWhite: { color: "#fff5df" },
  failureBoardPieceBlack: { color: "#1c120e" },
  failureBoardLegendRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingBottom: 1 },
  failureBoardLegendSwatch: { width: 18, height: 10, borderRadius: 4, borderWidth: 2, borderColor: "#79e6ff", backgroundColor: "rgba(255,210,78,.48)" },
  failureBoardLegendText: { color: "rgba(224,211,188,.78)", fontSize: 10, lineHeight: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: .55 },
  failureBoardUnavailable: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, backgroundColor: "rgba(24,18,16,.7)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  failureBoardUnavailableCopyBlock: { flex: 1, gap: 3 },
  failureBoardUnavailableTitle: { color: colors.paper, fontSize: 13, lineHeight: 17, fontWeight: "900" },
  failureBoardUnavailableCopy: { color: colors.muted, fontSize: 11, lineHeight: 15, fontWeight: "800" },
  failureBoardCopy: { color: "rgba(224,211,188,.9)", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  detailPanelTitle: { color: colors.paper, fontSize: 15, fontWeight: "900", letterSpacing: -.2 },
  detailPanelCopy: { color: colors.muted, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  proofStepList: { gap: 8, marginTop: 2 },
  proofStepRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  proofStepBadge: { width: 22, height: 22, borderRadius: 11, overflow: "hidden", textAlign: "center", lineHeight: 22, color: colors.gold, backgroundColor: "rgba(245,200,106,.12)", borderWidth: 1, borderColor: "rgba(245,200,106,.32)", fontSize: 11, fontWeight: "900" },
  proofStepText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 16, fontWeight: "800" },
  detailRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,247,232,.07)" },
  detailRowLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .55 },
  detailRowValue: { flex: 1, color: colors.paper, fontSize: 13, lineHeight: 16, fontWeight: "900", textAlign: "right" },
  detailRowValueGood: { color: colors.green },
  detailPrimaryButton: { alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.gold },
  detailPrimaryButtonDisabled: { opacity: .62 },
  disabledAction: { opacity: .62 },
  detailPrimaryButtonText: { color: "#111", fontSize: 14, fontWeight: "900" },
  detailActionStack: { gap: 8, alignItems: "center" },
  detailInlineRefresh: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 1, opacity: .78 },
  detailInlineRefreshText: { color: colors.muted, fontSize: 11, lineHeight: 14, fontWeight: "800", textAlign: "center" },
  detailSecondaryButton: { alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(255,247,232,.09)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  detailSecondaryButtonText: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  detailQuietButton: { alignItems: "center", paddingVertical: 4 },
  detailQuietButtonText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  coatLightbox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(6,5,7,.82)" },
  coatLightboxCard: { alignItems: "center", justifyContent: "center", gap: 12, width: "100%", minHeight: 420, borderRadius: 32, backgroundColor: "rgba(255,247,232,.06)", borderWidth: 1, borderColor: "rgba(255,247,232,.12)", overflow: "visible" },
  coatLightboxGlow: { position: "absolute", width: 330, height: 360, opacity: .78 },
  coatLightboxImage: { width: 238, height: 268 },
  coatLightboxTitle: { color: colors.paper, fontSize: 18, lineHeight: 23, fontWeight: "900", textAlign: "center" },
  pullRefreshHint: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 7, paddingBottom: 9, opacity: .64 },
  pullRefreshHintText: { color: colors.muted, fontSize: 11, lineHeight: 14, fontWeight: "800" },
  sideQuestBrandTabs: { flexDirection: "row", alignItems: "stretch", gap: 10, marginTop: 2, marginBottom: 6 },
  sideQuestBrandTab: { flex: 1, minHeight: 62, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, paddingVertical: 12, borderRadius: 22, borderWidth: 1.5, shadowColor: "#000", shadowOpacity: .14, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  sideQuestBrandTabOfficial: { borderColor: "rgba(245,200,106,.3)", backgroundColor: "rgba(245,200,106,.08)" },
  sideQuestBrandTabOfficialActive: { borderColor: "rgba(245,200,106,.62)", backgroundColor: "rgba(245,200,106,.18)" },
  sideQuestBrandTabCommunity: { borderColor: "rgba(96,240,175,.28)", backgroundColor: "rgba(96,240,175,.065)" },
  sideQuestBrandTabCommunityActive: { borderColor: "rgba(96,240,175,.52)", backgroundColor: "rgba(96,240,175,.15)" },
  sideQuestBrandTabText: { color: "rgba(255,247,232,.62)", fontSize: 12, lineHeight: 15, fontWeight: "900", textAlign: "center" },
  sideQuestBrandTabOfficialTextActive: { color: colors.gold },
  sideQuestBrandTabCommunityTextActive: { color: colors.green },
  sideQuestCatalogRows: { overflow: "hidden", borderRadius: 18, backgroundColor: "rgba(13,11,14,.78)", borderWidth: 1, borderColor: "rgba(255,255,255,.09)" },
  browseTopBar: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 4, paddingTop: 6 },
  browseTopBarLabel: { color: colors.paper, fontSize: 14, fontWeight: "900", letterSpacing: -.2, flexShrink: 1 },
  topNavPanel: { padding: 6, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.09)", backgroundColor: "rgba(0,0,0,.18)" },
  topNavHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topNavMeta: { color: "rgba(255,247,232,.58)", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: .7 },
  topNavRail: { flexDirection: "row", gap: 5 },
  topNavChip: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,247,232,.07)", backgroundColor: "rgba(255,247,232,.045)" },
  topNavChipActive: { backgroundColor: colors.paper, borderColor: colors.paper },
  topNavChipText: { color: colors.muted, fontSize: 9, fontWeight: "900", textAlign: "center" },
  topNavChipTextActive: { color: "#171119" },
  heroPanel: { gap: 10, padding: 13, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(255,247,232,.075)" },
  headerPanel: { gap: 5, padding: 12, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(0,0,0,.2)" },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  accountHeaderActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  accountCloseButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,5,7,.55)", borderWidth: 1, borderColor: "rgba(255,247,232,.2)" },
  accountIdentityCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  accountIdentityAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "rgba(245,200,106,.16)", borderWidth: 1, borderColor: "rgba(245,200,106,.28)" },
  accountIdentityAvatarImage: { width: "100%", height: "100%", borderRadius: 32 },
  accountIdentityAvatarText: { color: colors.gold, fontSize: 24, fontWeight: "900" },
  accountIdentityCopy: { flex: 1, minWidth: 0, gap: 3 },
  accountNameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 8, rowGap: 4 },
  accountNameTitle: { flexShrink: 1, maxWidth: "100%" },
  accountInfoText: { color: colors.muted, fontSize: 12, lineHeight: 16, fontWeight: "800" },
  logoutButton: { alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,122,102,.36)", backgroundColor: "rgba(255,122,102,.1)" },
  logoutButtonText: { color: colors.red, fontSize: 13, fontWeight: "900" },
  kicker: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.1 },
  heroTitle: { color: colors.paper, fontSize: 27, lineHeight: 29, fontWeight: "900", letterSpacing: -1 },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  micro: { color: "rgba(255,247,232,.64)", fontSize: 12, lineHeight: 16 },
  livePill: { overflow: "hidden", color: colors.green, fontSize: 11, fontWeight: "900", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(96,240,175,.12)", borderWidth: 1, borderColor: "rgba(96,240,175,.28)" },
  metricGrid: { flexDirection: "row", gap: 7 },
  metricBox: { flex: 1, padding: 9, borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  metricValue: { color: colors.paper, fontSize: 20, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: .7 },
  actionRow: { flexDirection: "row", gap: 8 },
  goldButton: { alignItems: "center", justifyContent: "center", paddingVertical: 13, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.gold },
  goldButtonSmall: { alignSelf: "flex-start", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,.14)" },
  goldButtonText: { color: colors.paper, fontWeight: "800", fontSize: 12 },
  darkButtonSmall: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 11, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.14)", backgroundColor: "rgba(0,0,0,.22)" },
  darkButtonText: { color: colors.paper, fontWeight: "900", fontSize: 13 },
  scorePanel: { gap: 4, padding: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(0,0,0,.2)" },
  statsPanel: { gap: 9, padding: 10 },
  panelTitle: { color: colors.paper, fontSize: 18, fontWeight: "900", letterSpacing: -.4 },
  statusRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 15, backgroundColor: "rgba(255,247,232,.055)" },
  questRow: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 15, backgroundColor: "rgba(255,247,232,.055)" },
  rowLabel: { width: 72, color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  rowMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  chevron: { color: "rgba(255,247,232,.46)", fontSize: 28, fontWeight: "300" },
  segmentBar: { flexDirection: "row", gap: 6, padding: 4, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  segmentButton: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 14 },
  segmentButtonActive: { backgroundColor: colors.paper },
  segmentText: { color: colors.muted, fontSize: 12, fontWeight: "900", textTransform: "capitalize" },
  segmentTextActive: { color: "#171119" },
  emptyText: { color: colors.muted, fontSize: 13, padding: 12 },
  questIcon: { width: 42, height: 48 },
  questIconDim: { opacity: .52 },
  questPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(245,200,106,.14)", borderWidth: 1, borderColor: "rgba(245,200,106,.28)" },
  questPillText: { color: colors.gold, fontSize: 11, fontWeight: "900" },
  coatBoardCloseRow: { minHeight: 40, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingTop: 2, paddingBottom: 0 },
  coatBoardCloseButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,5,7,.64)", borderWidth: 1, borderColor: "rgba(255,247,232,.18)" },
  coatBoardHeroEmblemWrap: { alignItems: "center", justifyContent: "center", paddingTop: 0, paddingBottom: 8 },
  coatBoardHeroEmblem: { width: 164, height: 184 },
  coatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  coatTile: { width: "31.8%", gap: 5, alignItems: "center", padding: 8, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(255,247,232,.055)" },
  coatTileImage: { width: 62, height: 72 },
  coatTileLocked: { opacity: .35 },
  coatTileTitle: { minHeight: 30, color: colors.paper, fontSize: 11, lineHeight: 14, textAlign: "center", fontWeight: "800" },
  earnedText: { color: colors.green, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  lockedText: { color: colors.gold, fontSize: 10, fontWeight: "900" },
  todayFeed: { gap: 10 },
  sportsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4, paddingTop: 2, paddingBottom: 2 },
  sportsBrand: { color: colors.paper, fontSize: 22, lineHeight: 26, fontWeight: "900", letterSpacing: -.6 },
  sportsContextPill: { overflow: "hidden", color: colors.gold, fontSize: 11, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(245,200,106,.14)" },
  sportsTabs: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: "rgba(255,255,255,.075)" },
  sportsTab: { color: "rgba(255,247,232,.48)", fontSize: 12, fontWeight: "900" },
  sportsTabActive: { color: colors.paper },
  feedSection: { gap: 4 },
  feedSectionTitle: { color: colors.paper, fontSize: 13, fontWeight: "800", paddingHorizontal: 3 },
  feedRows: { gap: 1, overflow: "hidden", borderRadius: 14, backgroundColor: "rgba(255,255,255,.075)" },
  feedRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 10, paddingRight: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "rgba(255,247,232,.06)" },
  feedRowCopy: { flex: 1, minWidth: 0 },
  feedRowTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  feedRowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  feedRowStatus: { maxWidth: 90, color: colors.paper, fontSize: 11, fontWeight: "800", textAlign: "right", textTransform: "uppercase", opacity: .86 },
  liveBoardPanel: { gap: 8, padding: 9, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(0,0,0,.2)" },
  liveBoardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  boardTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -.7 },
  refreshPill: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.14)", backgroundColor: "rgba(255,247,232,.06)" },
  refreshPillText: { color: colors.paper, fontSize: 11, fontWeight: "900" },
  matchCard: { position: "relative", overflow: "hidden", gap: 7, padding: 9, borderRadius: 14, backgroundColor: "rgba(255,255,255,.075)" },
  currentSideQuestPressable: { flexDirection: "row", alignItems: "center", gap: 9 },
  currentCoatFrame: { width: 46, height: 52, alignItems: "center", justifyContent: "center", overflow: "visible" },
  currentCoatHaloLarge: { position: "absolute", width: 46, height: 34, borderRadius: 23, backgroundColor: "rgba(255,255,255,.28)", transform: [{ scaleX: 1.08 }], shadowColor: "#fff7e8", shadowOpacity: .36, shadowRadius: 10, elevation: 3 },
  currentCoatHaloSmall: { position: "absolute", width: 34, height: 26, borderRadius: 17, backgroundColor: "rgba(245,200,106,.12)", shadowColor: colors.gold, shadowOpacity: .22, shadowRadius: 8, elevation: 4 },
  currentCoatImage: { width: 42, height: 48 },
  currentCoatFallback: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  currentSideQuestCopy: { flex: 1, minWidth: 0, gap: 5 },
  matchCardTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  matchLeague: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: .55 },
  statusPill: { overflow: "hidden", color: colors.gold, fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(245,200,106,.14)" },
  statusPillGood: { color: colors.paper, backgroundColor: "rgba(96,240,175,.18)" },
  matchMainRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  matchSideBlock: { flex: 1, minWidth: 0, gap: 2 },
  matchSideLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  matchSideTitle: { color: colors.paper, fontSize: 14, lineHeight: 18, fontWeight: "800", letterSpacing: -.15 },
  matchSideMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  matchDivider: { color: "rgba(255,247,232,.48)", fontSize: 30, fontWeight: "300" },
  matchFooterRow: { flexDirection: "row", gap: 6 },
  currentQuestActionRow: { flexDirection: "row", gap: 8 },
  completedSealImage: { position: "absolute", right: 10, bottom: 8, width: 74, height: 74, opacity: .92, transform: [{ rotate: "-8deg" }] },
  inlineSuccess: { color: colors.green, fontSize: 12, lineHeight: 16, fontWeight: "800", textAlign: "center", alignSelf: "center" },
  inlineError: { color: "#ffb4b4", fontSize: 12, lineHeight: 16, fontWeight: "800", textAlign: "center", alignSelf: "stretch" },
  miniStat: { flex: 1, padding: 8, borderRadius: 13, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  miniStatValue: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  miniStatLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: .5 },
  tablePanel: { gap: 1, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.22)" },
  tableHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 6, backgroundColor: "rgba(255,247,232,.04)" },
  tableHeaderCell: { width: 54, color: "rgba(255,247,232,.48)", fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: .3, textAlign: "right" },
  tableRow: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(255,247,232,.07)" },
  tableNameCell: { flex: 1.5, minWidth: 0 },
  tableRowLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  tableRowTitle: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  tableCell: { width: 54, color: colors.muted, fontSize: 11, fontWeight: "800", textAlign: "right" },
  pathPanel: { gap: 4, padding: 7, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.09)", backgroundColor: "rgba(0,0,0,.18)" },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: "transparent" },
  appGradientFrame: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  appGradientLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  appWatermarkFrame: { position: "absolute", left: -118, top: 104, width: 620, height: 620, opacity: 0.025 },
  appWatermarkImage: { width: "100%", height: "100%" },
  content: { gap: 7, padding: 10, paddingTop: 10, paddingBottom: 86 },
  scrollHintFrame: { flex: 1 },
  scrollHintLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  scrollHintPill: { position: "absolute", right: 10, minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(255,247,232,.055)", opacity: 0.56 },
  screenStack: { gap: 7 },
  heroCard: {
    overflow: "hidden",
    gap: 14,
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(245,200,106,.3)",
    backgroundColor: "#171119",
  },
  heroGlowOne: { position: "absolute", right: -80, top: -70, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(245,200,106,.18)" },
  heroGlowTwo: { position: "absolute", left: -70, bottom: -90, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(151,70,255,.18)" },
  cardGradientFrame: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 1 },
  cardGradientLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  homeHeroCard: { overflow: "hidden", gap: 11, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  homeHeroTitle: { color: colors.paper, fontSize: 30, fontWeight: "900", letterSpacing: -1.1, lineHeight: 32 },
  homeHeroBody: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  homeHeroActions: { gap: 9 },
  homeRitualStrip: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: "rgba(245,200,106,.2)", backgroundColor: "rgba(0,0,0,.18)" },
  homeRitualStep: { color: colors.paper, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  homeRitualArrow: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  buttonEmphasis: { fontWeight: "900" },
  whereBeginCard: { gap: 9, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  heroismChoiceList: { gap: 10 },
  heroismChoiceCard: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(0,0,0,.18)" },
  heroismBadgeFrame: { width: 58, height: 66, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  heroismBadgeImage: { width: 52, height: 60 },
  heroismChoiceCopy: { flex: 1, gap: 3 },
  heroismChoiceLabel: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  heroismChoiceSmall: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  heroismChoiceCta: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  heroismCustomPath: { color: colors.gold, fontSize: 14, fontWeight: "900", textDecorationLine: "underline" },
  multiplayerCalloutCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  homeStatusCard: { gap: 9, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  sideQuestHubHero: { overflow: "hidden", gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  sideQuestHubTitle: { color: colors.paper, fontSize: 29, fontWeight: "900", letterSpacing: -0.4, lineHeight: 31 },
  sideQuestHubCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  soloBrowseHero: { overflow: "hidden", gap: 12, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 15, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.065)" },
  soloBrowseHeroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  soloBrowseHeroCopy: { flex: 1, gap: 7 },
  soloBrowseHeroTitle: { color: colors.paper, fontSize: 30, fontWeight: "900", letterSpacing: -1.0, lineHeight: 32 },
  soloBrowseHeroText: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: "700" },
  soloBrowseHeroCoat: { width: 86, height: 86 },
  soloBrowseStatsRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  soloBrowseStat: { overflow: "hidden", color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.65, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(245,200,106,.22)", backgroundColor: "rgba(245,200,106,.08)" },
  soloDeckHeader: { gap: 6, paddingHorizontal: 2 },
  sideQuestModeGrid: { gap: 8 },
  sideQuestModeCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupModeCard: { borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  groupquestsHero: { gap: 8, marginHorizontal: -12, paddingLeft: 16, paddingRight: 62, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHeroHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  groupquestsHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.7, lineHeight: 37 },
  groupquestsHeroTitleWithClose: { flex: 1 },
  screenCloseButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,247,232,.16)", backgroundColor: "rgba(0,0,0,.26)" },
  floatingScreenCloseButton: { position: "absolute", top: 54, right: 16, zIndex: 50, width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(10,8,10,.74)", shadowColor: "#000", shadowOpacity: 0.26, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  groupquestsHeroCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  multiplayerLobbyHero: { alignItems: "center", gap: 7, marginHorizontal: -12, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  multiplayerLobbyHeroGraphic: { width: 172, height: 132 },
  multiplayerLobbyHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.5, lineHeight: 37, textAlign: "center" },
  multiplayerLobbyStatsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  multiplayerLobbyStatCard: { flexBasis: "48%", flexGrow: 1, gap: 3, paddingVertical: 11, paddingHorizontal: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(245,200,106,.22)", backgroundColor: "rgba(245,200,106,.075)" },
  multiplayerLobbyStatValue: { color: colors.paper, fontSize: 24, lineHeight: 27, fontWeight: "900", textAlign: "center" },
  multiplayerLobbyStatLabel: { color: colors.gold, fontSize: 11, lineHeight: 14, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: .7 },
  multiplayerLobbyTabs: { flexDirection: "row", flexWrap: "wrap", gap: 7, padding: 6, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(0,0,0,.16)" },
  multiplayerLobbyTab: { flexBasis: "48%", flexGrow: 1, minHeight: 39, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 17, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(255,247,232,.045)" },
  multiplayerLobbyTabActive: { borderColor: "rgba(96,240,175,.58)", backgroundColor: "rgba(96,240,175,.16)" },
  multiplayerLobbyTabText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  multiplayerLobbyTabTextActive: { color: colors.paper },
  multiplayerLobbyTabCount: { color: "rgba(255,247,232,.56)", fontSize: 12, fontWeight: "900" },
  multiplayerLobbyEmptyCard: { gap: 10, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(0,0,0,.16)" },
  groupquestsStoryCard: { gap: 16, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsStoryCopy: { gap: 10 },
  groupquestsProcessGraphic: { alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "rgba(0,0,0,.16)", overflow: "hidden" },
  groupquestsKnightArt: { width: "100%", height: 230 },
  groupquestsLoggedOutActions: { gap: 12 },
  groupquestsActiveCard: { gap: 8, padding: 11, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.28)", backgroundColor: "rgba(96,240,175,.085)" },
  groupquestsActiveRow: { flexDirection: "row", gap: 9, alignItems: "center", padding: 9, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  groupquestsActionCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHowCard: { gap: 14, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHowGrid: { gap: 10 },
  groupquestsHowStep: { gap: 5, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  groupquestsHowNumber: { color: colors.gold, fontSize: 22, fontWeight: "900" },
  groupquestsHowTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  groupquestsHowCopy: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  groupquestsRulesCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  sideQuestModeTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.6, lineHeight: 22 },
  sideQuestModeCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  modeInlineCue: { alignSelf: "flex-start", overflow: "hidden", color: colors.gold, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.65, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(245,200,106,.22)", backgroundColor: "rgba(245,200,106,.08)" },
  questFilterPanel: { gap: 9, padding: 11, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  questFilterTitle: { color: colors.paper, fontSize: 24, fontWeight: "900", letterSpacing: -0.9 },
  questFilterHint: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  questFilterGrid: { gap: 10 },
  filterField: { gap: 5 },
  filterLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  filterValue: { color: "rgba(255,247,232,.62)", fontSize: 15, fontWeight: "900", paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.14)" },
  filterResetButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", opacity: 0.62 },
  filterResetText: { color: colors.muted, fontWeight: "900" },
  browseSummaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  browseRefineButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minWidth: 86, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(0,0,0,.2)" },
  browseRefineButtonText: { color: colors.paper, fontSize: 12, fontWeight: "900" },
  browseControlsPanel: { gap: 9, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(0,0,0,.16)" },
  browseFilterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  browseFilterChip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 38, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.15)", backgroundColor: "rgba(0,0,0,.18)" },
  browseFilterChipWide: { flexBasis: "48%", flexGrow: 1 },
  browseSortChip: { flexBasis: "31%", flexGrow: 1 },
  browseFilterChipActive: { borderColor: "rgba(96,240,175,.72)", backgroundColor: "rgba(96,240,175,.16)" },
  browseFilterChipText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  browseFilterChipTextActive: { color: colors.paper },
  browseFilterChipCount: { color: "rgba(255,247,232,.56)", fontSize: 12, fontWeight: "900" },
  availableQuestGrid: { gap: 8 },
  sideQuestSection: { gap: 8, padding: 11, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  sectionHeadMobile: { gap: 6 },
  challengeCardMobile: { gap: 9, padding: 12, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  challengeCardMobileFeatured: { borderColor: "rgba(245,200,106,.42)", backgroundColor: "rgba(245,200,106,.1)" },
  challengeCardMobileActive: { borderColor: "rgba(96,240,175,.5)", backgroundColor: "rgba(96,240,175,.1)" },
  challengeCardMobileCompleted: { borderColor: "rgba(245,200,106,.35)" },
  activeQuestStampText: { alignSelf: "flex-start", overflow: "hidden", color: "#17120c", backgroundColor: colors.green, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  completedQuestStampText: { alignSelf: "flex-start", overflow: "hidden", color: "#17120c", backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  questCardMetaMobile: { flexDirection: "row", alignItems: "center", gap: 8 },
  questPointsMobile: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  difficultyBadgeMobile: { overflow: "hidden", color: colors.paper, fontSize: 11, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,247,232,.1)" },
  difficultyEasy: { backgroundColor: "rgba(96,240,175,.18)", color: colors.green },
  difficultyMedium: { backgroundColor: "rgba(245,200,106,.16)", color: colors.gold },
  difficultyHard: { backgroundColor: "rgba(255,160,92,.18)", color: "#ffa05c" },
  difficultyBrutal: { backgroundColor: "rgba(255,122,102,.18)", color: colors.red },
  difficultyAbsurd: { backgroundColor: "rgba(255,95,159,.2)", color: "#ff8cc0" },
  challengeCardTitleRowMobile: { flexDirection: "row", gap: 8, alignItems: "center" },
  challengeCardBadgeMobile: { width: 66, alignItems: "center", justifyContent: "center" },
  challengeCardBadgeImageMobile: { width: 62, height: 70 },
  challengeCardCopyMobile: { flex: 1, gap: 5 },
  challengeCardTitleMobile: { color: colors.paper, fontSize: 20, lineHeight: 22, fontWeight: "900", letterSpacing: -0.8 },
  challengeCardObjectiveMobile: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  challengeCardHintMobile: { color: colors.gold, fontSize: 13, lineHeight: 18, fontStyle: "italic", fontWeight: "800" },
  badgesHeroCard: { overflow: "hidden", gap: 11, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  badgesHeroTitle: { color: colors.paper, fontSize: 29, fontWeight: "900", letterSpacing: -0.4, lineHeight: 31, textAlign: "center" },
  liveCoatRoster: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  liveCoatRosterItem: { width: "30%", minWidth: 84, alignItems: "center", gap: 2, paddingVertical: 2 },
  liveCoatBadgeFrame: { width: 60, height: 64, alignItems: "center", justifyContent: "center" },
  liveCoatBadgeFrameLocked: { opacity: 0.5 },
  liveCoatBadgeImage: { width: 58, height: 58 },
  liveCoatBadgeImageLocked: { opacity: 0.34 },
  liveCoatLockedLabel: { position: "absolute", bottom: 2, overflow: "hidden", color: colors.paper, fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(0,0,0,.58)", borderWidth: 1, borderColor: "rgba(255,247,232,.16)" },
  liveCoatRosterTitle: { color: colors.paper, fontSize: 10, fontWeight: "900", lineHeight: 11, textAlign: "center" },
  badgeMeaningList: { gap: 7 },
  badgeMeaningCard: { flexDirection: "row", gap: 8, padding: 9, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  badgeMeaningArtLink: { width: 64, alignItems: "center", justifyContent: "center" },
  badgeMeaningArtLocked: {},
  badgeMeaningImage: { width: 58, height: 66 },
  badgeMeaningImageLocked: { opacity: 0.74 },
  badgeMeaningCopy: { flex: 1, gap: 6 },
  badgeMeaningTitle: { color: colors.paper, fontSize: 18, lineHeight: 20, fontWeight: "900", letterSpacing: -0.7 },
  badgeMeaningRows: { gap: 4 },
  badgeMeaningRow: { gap: 2 },
  badgeMeaningTerm: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  badgeMeaningDefinition: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  appRitualCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  appRitualSteps: { gap: 9 },
  navBrandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoMark: { width: 38, height: 38, borderRadius: 13 },
  navBrandCopy: { flex: 1 },
  navKicker: { color: colors.paper, fontWeight: "900", fontSize: 15, letterSpacing: -0.2 },
  navSub: { color: colors.muted, fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  navSubPill: { overflow: "hidden", color: "#17120c", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold },
  buildPill: { maxWidth: 128, color: "#17120c", fontSize: 9, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold, overflow: "hidden" },
  heroMainRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  heroCopyBlock: { flex: 1, gap: 7 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: colors.paper, fontSize: 28, fontWeight: "900", letterSpacing: -1.7, lineHeight: 29 },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  heroBadgeFrame: { width: 88, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 26, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.26)" },
  heroBadgeFrameCompact: { width: 68, height: 78, alignItems: "center", justifyContent: "center", borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.26)" },
  heroBadgeImage: { width: 82, height: 96 },
  heroBadgeImageCompact: { width: 62, height: 72 },
  heroBadgeGlyph: { color: colors.gold, fontSize: 54, fontWeight: "900" },
  heroStatsRow: { flexDirection: "row", gap: 8 },
  miniStat: { flex: 1, gap: 3, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.26)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  miniStatLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  miniStatValue: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  loadingCard: { alignItems: "center", gap: 12, padding: 24 },
  catalogStateBanner: { gap: 5, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.09)" },
  catalogStateTitle: { color: colors.gold, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  catalogStateCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  muted: { color: colors.muted },
  offlineCard: { gap: 12, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.09)" },
  offlineHeaderRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  offlineIcon: { width: 36, height: 36, textAlign: "center", textAlignVertical: "center", borderRadius: 18, overflow: "hidden", color: colors.green, fontSize: 22, backgroundColor: "rgba(0,0,0,.22)" },
  offlineHeaderCopy: { flex: 1, gap: 4 },
  offlineTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  offlineCopy: { color: colors.muted, lineHeight: 20 },
  errorCopy: { color: "#ffd6cf", lineHeight: 20, textAlign: "center", alignSelf: "stretch" },
  primaryButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.gold },
  centeredPrimaryButton: { alignSelf: "center", minHeight: 42, justifyContent: "center", alignItems: "center", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonText: { color: "#17120c", fontWeight: "900" },
  secondaryButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(255,247,232,.08)" },
  secondaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(255,247,232,.08)" },
  disabledActionButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(245,200,106,.16)", backgroundColor: "rgba(245,200,106,.07)", opacity: 0.74 },
  disabledActionButtonText: { color: "rgba(245,200,106,.72)", fontWeight: "900" },
  disabledSecondaryButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(255,247,232,.045)", opacity: 0.68 },
  disabledWideButton: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(255,247,232,.045)", opacity: 0.68 },
  disabledSecondaryButtonText: { color: "rgba(255,247,232,.62)", fontWeight: "900" },
  secondaryButtonText: { color: colors.paper, fontWeight: "900" },
  quickStartCard: { gap: 13, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(255,247,232,.08)" },
  quickStartTopRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  quickStartCopy: { flex: 1, gap: 5 },
  quickStartTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -1, lineHeight: 25 },
  quickStartBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  quickScoreRail: { width: 76, gap: 2, alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 20, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  quickScoreValue: { color: colors.gold, fontSize: 26, fontWeight: "900", lineHeight: 28 },
  quickScoreValueSmall: { color: colors.green, fontSize: 18, fontWeight: "900", marginTop: 5, lineHeight: 20 },
  quickScoreLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6 },
  quickActionStack: { gap: 9 },
  questFlowStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  questFlowStep: { flex: 1, color: colors.paper, fontSize: 12, fontWeight: "900", textAlign: "center" },
  questFlowArrow: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  accountModeStrip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  accountModeDot: { color: colors.green, fontSize: 10 },
  accountModeCopy: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  parityDockCard: { gap: 13, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(151,70,255,.34)", backgroundColor: "rgba(151,70,255,.1)" },
  parityDockHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  parityDockHeaderCopy: { flex: 1, gap: 5 },
  parityDockTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -0.9, lineHeight: 24 },
  parityDockBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  parityModePill: { overflow: "hidden", color: "#120a20", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.gold },
  parityRouteGrid: { gap: 9 },
  parityRouteButton: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.2)" },
  parityRouteIcon: { width: 34, height: 34, textAlign: "center", textAlignVertical: "center", borderRadius: 17, overflow: "hidden", color: colors.gold, fontSize: 20, backgroundColor: "rgba(255,247,232,.08)" },
  parityRouteCopy: { flex: 1, gap: 2 },
  parityRouteTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  parityRouteBody: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  paritySafetyStrip: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  firstRunCard: { gap: 12, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.14)" },
  firstRunTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  firstRunSteps: { gap: 9 },
  bottomNavBar: { flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 6, borderTopWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(16,13,11,.94)" },
  bottomNavItem: { position: "relative", overflow: "hidden", flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.045)", backgroundColor: "rgba(255,247,232,.035)" },
  bottomNavItemActive: { borderColor: "rgba(245,200,106,.58)", backgroundColor: "rgba(245,200,106,.14)" },
  bottomNavActiveDot: { width: 14, height: 2, borderRadius: 999, backgroundColor: colors.gold, marginTop: 1 },
  bottomNavIconFrame: { width: 24, height: 22, alignItems: "center", justifyContent: "center", transform: [{ translateY: 0 }] },
  bottomNavIconFrameActive: { transform: [{ translateY: 0 }] },
  bottomNavLogoImage: { width: 34, height: 34, borderRadius: 9 },
  bottomNavSideQuestImage: { width: 31, height: 31 },
  bottomNavCoatImage: { width: 28, height: 28 },
  bottomNavLoggedInBadge: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "rgba(96,240,175,.45)", backgroundColor: "rgba(96,240,175,.1)" },
  bottomNavLoggedInBadgeActive: { borderColor: "rgba(245,200,106,.86)", backgroundColor: colors.gold },
  bottomNavText: { color: "#e8dcc3", fontSize: 9, lineHeight: 11, fontWeight: "900", textAlign: "center" },
  bottomNavTextActive: { color: colors.paper },
  tabRail: { gap: 8, paddingRight: 18 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke, backgroundColor: "rgba(255,247,232,.055)" },
  tabPillActive: { borderColor: "rgba(245,200,106,.78)", backgroundColor: "rgba(245,200,106,.16)" },
  tabIcon: { color: colors.muted, fontWeight: "900" },
  tabText: { color: colors.muted, fontWeight: "900" },
  tabTextActive: { color: colors.paper },
  sectionHeader: { gap: 6, paddingHorizontal: 2 },
  sectionTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  sectionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  questListCard: { overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 26, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questListCardActive: { borderColor: "rgba(245,200,106,.72)", backgroundColor: "rgba(245,200,106,.13)", shadowColor: colors.gold, shadowOpacity: 0.28, shadowRadius: 18, elevation: 3 },
  selectedCornerPill: { position: "absolute", top: 0, right: 0, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, borderBottomLeftRadius: 14, color: "#17120c", backgroundColor: colors.gold, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 },
  questNumberPill: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(0,0,0,.3)" },
  questNumber: { color: colors.gold, fontWeight: "900", fontSize: 12 },
  questListCopy: { flex: 1, gap: 4 },
  questListMode: { color: colors.green, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  questListTitle: { color: colors.paper, fontSize: 19, lineHeight: 21, fontWeight: "900", letterSpacing: -0.7 },
  questListObjective: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  questListReward: { color: colors.gold, fontSize: 12, fontWeight: "800" },
  questMetaRow: { gap: 6, alignItems: "flex-start" },
  rarityPill: { overflow: "hidden", alignSelf: "flex-start", color: colors.paper, fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,247,232,.1)" },
  questListBadgeFrame: { width: 68, height: 78, alignItems: "center", justifyContent: "center" },
  questListBadge: { width: 68, height: 78 },
  questListGlyph: { color: colors.gold, fontSize: 32 },
  questCard: { gap: 16, padding: 18, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questCardHeader: { flexDirection: "row", gap: 14, alignItems: "center" },
  questCardCopy: { flex: 1, gap: 8 },
  questTitle: { color: colors.paper, fontSize: 32, fontWeight: "900", letterSpacing: -1.6, lineHeight: 32 },
  questObjective: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  badgeImageFrame: { width: 112, height: 128, alignItems: "center", justifyContent: "center" },
  badgeImage: { width: 112, height: 128 },
  completedSealLargeBackdrop: { position: "absolute", width: 52, height: 52, right: -4, bottom: -2, borderRadius: 999, backgroundColor: "#a81717", transform: [{ scaleX: 1.08 }, { scaleY: 1.02 }] },
  completedSealLarge: { position: "absolute", width: 44, height: 44, right: 0, bottom: 2 },
  badgeFallbackText: { color: colors.gold, fontSize: 34, fontWeight: "900" },
  questFlavorCard: { padding: 14, borderRadius: 20, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  questFlavor: { color: colors.paper, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  questInstructionCard: { gap: 6, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  instructionLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  instructionCopy: { color: colors.paper, fontSize: 15, fontWeight: "800", lineHeight: 22 },
  openingHint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  catalogQuickStats: { flexDirection: "row", gap: 10 },
  factGrid: { gap: 8 },
  fact: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,247,232,.075)" },
  factLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  factValue: { color: colors.paper, fontSize: 14, fontWeight: "800" },
  rulesTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  rule: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  authCard: { gap: 9, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.09)" },
  accountAuthCopyCard: { overflow: "hidden", gap: 10, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  accountAuthTitle: { color: colors.paper, fontSize: 31, fontWeight: "900", letterSpacing: -1.35, lineHeight: 35 },
  accountAuthHeroCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  authLightweightCopy: { gap: 10, padding: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(255,247,232,.055)" },
  authNote: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  authNoteStrong: { color: colors.paper, fontWeight: "900" },
  accountAuthFormCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  currentMissionCard: { gap: 7, marginHorizontal: -10, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  currentMissionCopy: { gap: 6 },
  currentMissionName: { color: colors.paper, fontSize: 27, fontWeight: "900", letterSpacing: -1.5, lineHeight: 29 },
  accountStatusStrip: { gap: 4, padding: 9, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  accountStatusConnected: { color: colors.green, fontSize: 12, fontWeight: "800" },
  accountStatusMissing: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  accountStatusStrong: { color: colors.paper, fontWeight: "900" },
  currentMissionTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -1, lineHeight: 22 },
  currentMissionBody: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  currentMissionMultiplayer: { gap: 5, padding: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(96,240,175,.2)", backgroundColor: "rgba(96,240,175,.07)" },
  activeMultiplayerRow: { flexDirection: "row", gap: 10, alignItems: "center", padding: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  activeMultiplayerSeal: { width: 36, height: 36 },
  activeMultiplayerCopy: { flex: 1, gap: 2 },
  activeMultiplayerTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  activeMultiplayerMeta: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  currentMissionVisual: { alignItems: "center" },
  currentMissionCoat: { width: "100%", gap: 5, alignItems: "center", padding: 8, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.2)" },
  currentMissionCoatImage: { width: 96, height: 108 },
  currentMissionCoatLabel: { color: colors.paper, fontSize: 15, fontWeight: "900", textAlign: "center" },
  currentMissionEmpty: { width: "100%", gap: 10, alignItems: "center", padding: 18, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(0,0,0,.18)" },
  currentMissionEmptyBadge: { width: 72, height: 72, textAlign: "center", textAlignVertical: "center", borderRadius: 36, overflow: "hidden", color: colors.gold, fontSize: 38, fontWeight: "900", backgroundColor: "rgba(255,247,232,.08)" },
  questLogCollectionCard: { gap: 6, marginHorizontal: -10, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  readinessCard: { gap: 10, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.075)" },
  readinessTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  readinessBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  panelCard: { gap: 9, padding: 12, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  cardTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  cardBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  scoreboardRow: { flexDirection: "row", gap: 5 },
  bigScore: { flex: 1, alignItems: "center", gap: 1, padding: 6, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)" },
  bigScoreValue: { color: colors.gold, fontSize: 21, fontWeight: "900" },
  bigScoreLabel: { color: colors.paper, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  noticeStrip: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  noticeIcon: { fontSize: 18 },
  noticeCopy: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },

  actionPlanCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  actionPlanTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  actionPlanSteps: { gap: 9 },
  requirementPairRow: { flexDirection: "row", gap: 9 },
  requirementPill: { flex: 1, gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(245,200,106,.16)" },
  requirementLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  requirementValue: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  mobileQuestActionCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(245,200,106,.09)", borderWidth: 1, borderColor: "rgba(245,200,106,.26)" },
  mobileQuestActionTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  mobileQuestActionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  proofPrepCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(151,70,255,.11)", borderWidth: 1, borderColor: "rgba(151,70,255,.28)" },
  proofPrepTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  accountChecklistCard: { gap: 6, padding: 9, borderRadius: 24, backgroundColor: "rgba(255,247,232,.08)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  accountChecklistTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  heraldryCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(151,70,255,.11)", borderWidth: 1, borderColor: "rgba(151,70,255,.28)" },
  heraldryHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  heraldryGlyph: { width: 46, height: 46, textAlign: "center", textAlignVertical: "center", color: colors.gold, fontSize: 26, fontWeight: "900", borderRadius: 23, backgroundColor: "rgba(0,0,0,.24)", overflow: "hidden" },
  heraldryHeaderCopy: { flex: 1, gap: 3 },
  heraldryTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.6 },
  heraldryMotto: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  progressCard: { gap: 9, padding: 14, borderRadius: 20, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(96,240,175,.2)" },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  progressPercent: { color: colors.green, fontSize: 15, fontWeight: "900" },
  progressTrack: { overflow: "hidden", height: 10, borderRadius: 999, backgroundColor: "rgba(255,247,232,.085)" },
  progressFill: { height: 10, borderRadius: 999, backgroundColor: colors.green },
  usernameEditorCard: { gap: 6, padding: 9, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.24)" },
  usernameEditorTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  usernameEditorBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  inputStack: { gap: 7 },
  inputLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  textInput: { color: colors.paper, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.15)", backgroundColor: "rgba(0,0,0,.22)", fontSize: 15, fontWeight: "800" },
  multilineInput: { minHeight: 88, textAlignVertical: "top" },
  textAreaInput: { minHeight: 92, textAlignVertical: "top" },
  dateTimeControl: { gap: 7 },
  dateTimePanel: { gap: 9, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.14)", backgroundColor: "rgba(0,0,0,.2)" },
  dateTimeNativeGrid: { flexDirection: "row", gap: 8 },
  dateTimeNativeButton: { flex: 1, gap: 5, minHeight: 64, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.16)", backgroundColor: "rgba(255,247,232,.08)" },
  dateTimeNativeKicker: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  dateTimeNativeValue: { color: colors.paper, fontSize: 16, fontWeight: "900", letterSpacing: -0.2 },
  dateTimeNativeHint: { color: colors.muted, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  durationChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, padding: 9, borderRadius: 16, borderWidth: 1, borderColor: "rgba(245,200,106,.22)", backgroundColor: "rgba(245,200,106,.075)" },
  dateTimeChip: { alignItems: "center", justifyContent: "center", minHeight: 34, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.16)", backgroundColor: "rgba(255,247,232,.08)" },
  dateTimeChipText: { color: colors.paper, fontSize: 12, fontWeight: "900" },
  successCopy: { color: colors.green, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  momentumCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  momentumIcon: { width: 38, height: 38, textAlign: "center", textAlignVertical: "center", borderRadius: 19, overflow: "hidden", fontSize: 22, backgroundColor: "rgba(0,0,0,.2)" },
  momentumCopy: { flex: 1, gap: 3 },
  momentumTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  momentumBody: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  trophyShelf: { gap: 6, padding: 9, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  trophyRow: { flexDirection: "row", gap: 7, alignItems: "center" },
  trophyBadge: { width: 38, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)" },
  trophyImage: { width: 34, height: 40 },
  trophyGlyph: { color: colors.gold, fontSize: 22 },
  trophyCopy: { flex: 1, gap: 2 },
  trophyTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  trophyMeta: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  stateBoardCard: { gap: 6, padding: 9, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  stateBoardTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  stateBoardBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  stateTimeline: { gap: 9 },
  statusRibbon: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  statusRibbonIcon: { fontSize: 27 },
  statusRibbonCopy: { flex: 1, gap: 3 },
  statusRibbonTitle: { color: colors.paper, fontSize: 17, fontWeight: "900", textTransform: "uppercase" },
  statusRibbonBody: { color: colors.muted, lineHeight: 19 },
  checkerFlow: { gap: 10 },
  flowStep: { flexDirection: "row", gap: 7, padding: 7, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  flowStepDone: { borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.08)" },
  flowCheck: { color: colors.green, fontSize: 17, fontWeight: "900" },
  flowCopy: { flex: 1, gap: 3 },
  flowTitle: { color: colors.paper, fontWeight: "900", fontSize: 15 },
  flowBody: { color: colors.muted, lineHeight: 19 },
  confidenceCard: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(255,247,232,.055)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  confidenceIcon: { width: 40, height: 40, textAlign: "center", textAlignVertical: "center", borderRadius: 20, overflow: "hidden", fontSize: 22, backgroundColor: "rgba(0,0,0,.22)" },
  confidenceCopy: { flex: 1, gap: 3 },
  confidenceTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  confidenceBody: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  proofScrollCard: { gap: 13, padding: 20, paddingTop: 50, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.38)", backgroundColor: "rgba(255,247,232,.1)" },
  proofSeal: { position: "absolute", top: 14, right: 16, width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, backgroundColor: "#9e1d24", borderWidth: 2, borderColor: "rgba(255,255,255,.28)" },
  proofSealText: { color: "#ffe3b3", fontWeight: "900", fontSize: 13 },
  coatHeroFrame: { alignSelf: "center", width: 188, height: 212, alignItems: "center", justifyContent: "center", borderRadius: 42, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(0,0,0,.24)", shadowColor: colors.gold, shadowOpacity: 0.24, shadowRadius: 18, elevation: 4 },
  coatHeroImage: { width: 216, height: 246 },
  proofPreviewBadgeFrame: { alignSelf: "center", width: 138, height: 154, alignItems: "center", justifyContent: "center", borderRadius: 34, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.2)" },
  proofPreviewBadge: { width: 124, height: 142 },
  proofPreviewGlyph: { color: colors.gold, fontSize: 52, fontWeight: "900" },
  proofTitle: { color: colors.paper, fontSize: 31, lineHeight: 33, letterSpacing: -1.4, fontWeight: "900" },
  proofSubtitle: { color: colors.gold, fontSize: 16, fontWeight: "900" },
  proofBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  coatLoreCard: { gap: 11, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: "rgba(151,70,255,.28)", backgroundColor: "rgba(151,70,255,.1)" },
  coatLoreTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7 },
  coatLoreRows: { gap: 8 },
  coatShelfCard: { gap: 12, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.085)" },
  coatShelfHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  coatShelfCopy: { flex: 1, gap: 4 },
  coatShelfTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7 },
  coatShelfBody: { color: colors.muted, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  lockedPill: { overflow: "hidden", color: colors.paper, fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,247,232,.13)" },
  syncedPill: { overflow: "hidden", color: "#07110d", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.green },
  coatShelfPreviewRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  coatShelfTile: { width: "48%", minWidth: 132, flexGrow: 1, gap: 7, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.2)" },
  coatShelfTileLocked: { opacity: 0.78, borderColor: "rgba(245,200,106,.18)" },
  coatShelfBadgeFrame: { alignSelf: "center", width: 78, height: 88, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(0,0,0,.24)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  coatShelfBadgeImage: { width: 72, height: 82 },
  coatShelfTileTitle: { color: colors.paper, fontSize: 14, lineHeight: 17, fontWeight: "900", textAlign: "center" },
  coatShelfTileSubtitle: { color: colors.muted, fontSize: 11, lineHeight: 15, fontWeight: "800", textAlign: "center" },
  proofActionCard: { gap: 10, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.26)", backgroundColor: "rgba(245,200,106,.085)" },
  proofActionTitle: { color: colors.paper, fontSize: 19, fontWeight: "900", letterSpacing: -0.6 },
  proofActionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  centeredButtonRow: { justifyContent: "center" },
  handoffCard: { gap: 11, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.075)" },
  handoffCopy: { gap: 4 },
  handoffTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  handoffBody: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  handoffButton: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.green },
  handoffButtonText: { color: "#07110d", fontWeight: "900" },
  syncCard: { gap: 8, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  syncTitle: { color: colors.paper, fontSize: 20, fontWeight: "900" },
  syncCopy: { color: colors.muted, lineHeight: 21 },
  microcopy: { color: "rgba(199,189,169,.76)", fontSize: 11 },
});
