"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

type AuthActionButtonsProps = {
  variant?: "nav" | "connect";
};

export default function AuthActionButtons({ variant = "nav" }: AuthActionButtonsProps) {
  if (variant === "connect") {
    return (
      <SignInButton mode="modal" fallbackRedirectUrl="/profile">
        <button type="button" className="button primary">Sign in to add usernames</button>
      </SignInButton>
    );
  }

  return (
    <>
      <SignInButton mode="modal" fallbackRedirectUrl="/account">
        <button type="button" className="button secondary">Sign in</button>
      </SignInButton>
      <SignUpButton mode="modal" fallbackRedirectUrl="/connect">
        <button type="button" className="button primary">Connect</button>
      </SignUpButton>
    </>
  );
}
