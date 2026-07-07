import type { Metadata } from "next";
import SupportPage from "../support/page";

export const metadata: Metadata = {
  title: "Help & Support - Side Quest Chess",
  description:
    "The mobile-app Help & Support companion route for Side Quest Chess proof, account, Solo, Multiplayer, and data questions.",
  openGraph: {
    title: "Help & Support - Side Quest Chess",
    description:
      "Open the app-style Help & Support screen for Side Quest Chess proof, account, Solo, Multiplayer, and data questions.",
    url: "/help-support",
  },
};

export default SupportPage;
