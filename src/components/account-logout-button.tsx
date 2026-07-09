"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function AccountLogoutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <button type="button" className="sqc-logout-button">Log out</button>
    </SignOutButton>
  );
}
