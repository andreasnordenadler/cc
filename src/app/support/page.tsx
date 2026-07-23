import type { Metadata } from "next";
import MobileAppWebShell, { MobileSupportScreen } from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getActiveChallenge, getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";
import { getSupportMessages } from "@/lib/analytics";
import { CHALLENGES } from "@/lib/challenges";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import { listPublicGroupQuests, listUserRelatedGroupQuests } from "@/lib/groupquests";
import { buildSupportReportContext, buildWebSupportAccountContext, loadWebSupportGroupQuestContext } from "@/lib/web-support-diagnostics";

export const metadata: Metadata = {
  title: "Help & Support — Side Quest Chess",
  description: "Help and support notes for Side Quest Chess proof, account setup, and Multiplayer Side Quests.",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const reportContext = buildSupportReportContext(await searchParams);
  const user = await currentUser();
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadataRecord = user?.privateMetadata && typeof user.privateMetadata === "object"
    ? user.privateMetadata as UserMetadataRecord
    : {};
  const supportMessages = getSupportMessages(privateMetadataRecord);
  const displayName = user
    ? getPreferredRunnerName(metadataRecord, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const lichessUsername = getLichessUsername(metadataRecord);
  const chessComUsername = getChessComUsername(metadataRecord);
  const activeChallenge = getActiveChallenge(metadataRecord);
  const privateCustomSideQuests = getCustomSideQuests(privateMetadataRecord);
  const customSideQuests = privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadataRecord);
  const activeSoloQuestTitle = activeChallenge
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id)?.title
      ?? customSideQuests.find((quest) => quest.id === activeChallenge.id)?.title
      ?? activeChallenge.id
    : null;
  const groupQuestContext = user
    ? await loadWebSupportGroupQuestContext({
        loadRelatedGroupQuests: async () => listUserRelatedGroupQuests(await clerkClient(), user.id),
        loadPublicGroupQuests: async () => listPublicGroupQuests(await clerkClient()),
      })
    : { relatedGroupQuests: [], publicGroupQuests: [] };
  const accountContext = user
    ? buildWebSupportAccountContext({
        displayName,
        lichessUsername,
        chessComUsername,
        activeSoloQuestTitle,
        relatedGroupQuests: groupQuestContext.relatedGroupQuests,
        publicGroupQuests: groupQuestContext.publicGroupQuests,
        userId: user.id,
      })
    : null;

  return (
    <MobileAppWebShell
      activeTab="account"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={lichessUsername}
      chessComUsername={chessComUsername}
      modalPresentation
      theme={{
        backgroundTop: "#352021",
        backgroundMid: "#171011",
        glow: "rgba(255, 122, 102, .16)",
        accent: "rgba(255, 122, 102, .1)",
      }}
    >
      <MobileSupportScreen
        signedIn={Boolean(user)}
        accountContext={accountContext}
        reportContext={reportContext}
        supportMessages={supportMessages.map((message) => ({
          id: message.id,
          at: message.at,
          message: message.message,
          source: message.source ?? null,
        }))}
      />
    </MobileAppWebShell>
  );
}
