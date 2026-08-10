import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Side Quest Chess — Coming soon",
  description: "Ordinary chess ends here. Side Quest Chess is opening soon.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Side Quest Chess — Coming soon",
    description: "Ordinary chess ends here. Side Quest Chess is opening soon.",
    url: "/",
    siteName: "Side Quest Chess",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Side Quest Chess — Coming soon",
    description: "Ordinary chess ends here. Side Quest Chess is opening soon.",
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Side Quest Chess home">
          <span className={styles.brandMark} aria-hidden="true">♞</span>
          <span>Side Quest Chess</span>
        </Link>
        <span className={styles.status}>Coming soon</span>
      </header>

      <section className={styles.hero} aria-labelledby="coming-soon-title">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>A new kind of chess challenge</p>
          <h1 id="coming-soon-title">
            Every game deserves
            <span>a side quest.</span>
          </h1>
          <p className={styles.lede}>
            Turn ordinary chess games into ridiculous missions worth remembering.
            Pick the quest. Play the game. Bring proof.
          </p>
          <div className={styles.note}>
            <span aria-hidden="true" />
            The first quests are being prepared
          </div>
        </div>

        <div className={styles.crestStage}>
          <div className={styles.crestHalo} aria-hidden="true" />
          <Image
            className={styles.crest}
            src="/mobile-source/sqc-coat-of-arms.png"
            alt="Side Quest Chess coat of arms"
            width={1280}
            height={1280}
            priority
            sizes="(max-width: 760px) 76vw, 48vw"
          />
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© Crowdler AB</span>
        <nav aria-label="Legal and support">
          <Link href="/privacy">Privacy</Link>
          <Link href="/support">Support</Link>
        </nav>
      </footer>
    </main>
  );
}
