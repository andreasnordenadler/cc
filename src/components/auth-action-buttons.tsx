"use client";

import { SignInButton } from "@clerk/nextjs";

type AuthActionButtonsProps = {
  variant?: "nav" | "connect" | "home";
};

export default function AuthActionButtons({ variant = "nav" }: AuthActionButtonsProps) {
  if (variant === "connect") {
    return (
      <SignInButton mode="modal" fallbackRedirectUrl="/profile">
        <button type="button" className="button primary">Sign in to add usernames</button>
      </SignInButton>
    );
  }

  if (variant === "home") {
    return (
      <SignInButton mode="modal" fallbackRedirectUrl="/account">
        <button type="button" className="button primary">Sign in</button>
      </SignInButton>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl="/account">
      <button type="button" className="button primary">Sign in</button>
    </SignInButton>
  );
}
