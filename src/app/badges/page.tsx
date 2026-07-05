import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ProofTime from "@/components/proof-time";
import { ProofPositionMiniBoard } from "@/components/proof-position-board";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { getChallengeAttempts, getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function CoatOfArmsPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const liveBadgeChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image);
  const earnedLiveBadgeCount = liveBadgeChallenges.filter((challenge) => completedSet.has(challenge.id)).length;
  const proofReceiptCount = getChallengeAttempts(metadata).filter((attempt) => attempt.status === "passed").length;
  const completedProofBoards = CHALLENGES.map((challenge) => {
    const latestProof = getLatestPassedAttempt(metadata, challenge.id);
    if (!latestProof?.finalPositionFen) return null;
    return { challenge, latestProof };
  }).filter(Boolean);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="trophy" />

      <div className="content-wrap app-parity-account app-parity-trophy">
        <section className="mission-card trophy-app-hero" aria-label="Trophy Cabinet">
          <div className="trophy-app-hero-art" aria-hidden="true">
            <Image src="/sqc-logo-v11.png" alt="" width={172} height={172} />
          </div>
          <div className="section-head">
            <div>
              <span className="eyebrow">Trophy Cabinet</span>
              <h1>{userId ? "Your Coat of Arms" : "No Coat of Arms yet"}</h1>
              <p>
                {userId
                  ? "Completed Side Quests, proof boards, and saved receipts."
                  : "Complete a Side Quest to unlock your first trophy."}
              </p>
            </div>
            <Link href={userId ? "/account" : "/sign-in"} className="button primary">
              {userId ? "Open Trophy Cabinet" : "Sign in to save coats"}
            </Link>
          </div>
          <div className="grid lean-status-grid" aria-label="Coat of Arms progress summary">
            <Fact label="Earned coats" value={`${earnedLiveBadgeCount}/${liveBadgeChallenges.length}`} />
            <Fact label="Proof receipts" value={userId ? `${proofReceiptCount}` : "Saved after sign-in"} />
            <Fact label="Trophy Cabinet" value={userId ? `${earnedLiveBadgeCount}/${liveBadgeChallenges.length}` : "Start any quest"} />
          </div>
        </section>

        <section className="mission-card app-trophy-row-panel" aria-label="Live Side Quest coats">
          <div className="section-head">
            <div>
              <span className="eyebrow">Side Quest coats</span>
              <h2>Live trophies</h2>
            </div>
            <Link href="/solo" className="button secondary">
              Browse Solo Side Quests
            </Link>
          </div>
          <div className="app-row-list" aria-label="Current live Side Quest Chess coats of arms">
            {liveBadgeChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="app-proof-row" aria-label={`Open ${challenge.title} quest`}>
                <ChallengeBadge challenge={challenge} presentation="art" earned={completedSet.has(challenge.id)} />
                <span>
                  <small>{completedSet.has(challenge.id) ? "In your Trophy Cabinet" : "Ready to earn"}</small>
                  <strong>{challenge.title}</strong>
                  <em>{challenge.objective}</em>
                </span>
                <b>{challenge.difficulty}</b>
              </Link>
            ))}
          </div>
        </section>

        {userId && completedProofBoards.length ? (
          <section className="mission-card trophy-proof-board-section app-trophy-row-panel" aria-label="Verified Trophy Cabinet chess boards">
            <div className="section-head">
              <div>
                <span className="eyebrow">SQC proof boards</span>
                <h2>Verified boards</h2>
              </div>
              <Link href="/account" className="button secondary">Open Account Trophy Cabinet</Link>
            </div>
            <div className="app-row-list trophy-proof-board-grid">
              {completedProofBoards.map((item) => {
                if (!item) return null;
                const { challenge, latestProof } = item;
                return (
                  <Link href={`/challenges/${challenge.id}`} className="trophy-proof-board-card app-proof-row proof-board-row" key={challenge.id}>
                    <ChallengeBadge challenge={challenge} presentation="art" earned />
                    <span>
                      <small>Completed proof</small>
                      <strong>{challenge.title}</strong>
                      <em>
                        {latestProof.lastMoveSan || latestProof.lastMoveUci ? `Final move ${latestProof.lastMoveSan ?? latestProof.lastMoveUci} · ` : null}
                        <ProofTime value={latestProof.completedGameAt ?? latestProof.checkedAt} />
                      </em>
                      <ProofPositionMiniBoard
                        fen={latestProof.finalPositionFen}
                        lastMoveUci={latestProof.lastMoveUci}
                        label={`${challenge.title} Trophy Cabinet proof chess board`}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function getLatestPassedAttempt(metadata: UserMetadataRecord, challengeId: string) {
  return getChallengeAttempts(metadata, challengeId)
    .filter((attempt) => attempt.status === "passed")
    .at(-1) ?? null;
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
