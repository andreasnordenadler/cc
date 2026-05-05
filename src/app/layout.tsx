import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sidequestchess.com"),
  title: "Side Quest Chess — Chess side quests",
  description: "Chess, but with stupidly hard side quests. Pick a ridiculous quest, play real games, and prove it worked.",
};

const clerkAppearance = {
  options: {
    logoImageUrl: "/sqc-logo-v11.png",
    logoLinkUrl: "/",
    logoPlacement: "inside" as const,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#f5c86a",
    colorBackground: "#fffaf0",
    colorText: "#17120c",
    colorTextSecondary: "#6f6250",
    borderRadius: "18px",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontFamilyButtons: "var(--font-geist-sans), system-ui, sans-serif",
  },
  elements: {
    logoImage: {
      width: "64px",
      height: "64px",
      objectFit: "contain",
    },
    cardBox: {
      borderRadius: "24px",
      boxShadow: "0 32px 90px rgba(0,0,0,.34)",
    },
    headerTitle: {
      letterSpacing: "-0.04em",
      fontWeight: "950",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #2a251f, #08070a)",
      color: "#fff7dc",
      fontWeight: "950",
      boxShadow: "0 10px 22px rgba(0,0,0,.18)",
    },
    footerActionLink: {
      color: "#8b5cf6",
      fontWeight: "900",
    },
  },
};

const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Side Quest Chess",
      subtitle: "Save your quest progress, badges, proof receipts, and chess usernames.",
      actionText: "New to SQC?",
      actionLink: "Create your runner profile",
    },
  },
  signUp: {
    start: {
      title: "Create your SQC runner profile",
      subtitle: "Sign up once, then add your public Lichess or Chess.com username.",
      actionText: "Already have a runner profile?",
      actionLink: "Sign in",
    },
  },
  socialButtonsBlockButton: "Continue with {{provider|titleize}}",
  formFieldLabel__emailAddress: "Email address",
  formFieldInputPlaceholder__emailAddress: "you@example.com",
  formButtonPrimary: "Continue",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
