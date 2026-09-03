import type { Metadata } from "next";
import NotFound from "./not-found";
import "./globals.css";
import "./mobile-web.css";

export const metadata: Metadata = {
  title: "Page not found — Side Quest Chess",
  description: "Return to the live Side Quest Chess boards.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFound />
      </body>
    </html>
  );
}