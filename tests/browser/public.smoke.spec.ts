import { expect, test } from "@playwright/test";

async function expectHealthyNavigation(page: import("@playwright/test").Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `${path} should return a document response`).not.toBeNull();
  expect(response!.status(), `${path} should not return an HTTP error`).toBeLessThan(400);
}

test("signed-out homepage exposes the two public browsing paths and auth entry", async ({ page }) => {
  await expectHealthyNavigation(page, "/");

  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Solo Side Quests" })).toHaveAttribute("href", "/side-quests");
  await expect(page.getByRole("link", { name: "Browse Multiplayer Side Quests" })).toHaveAttribute("href", "/multiplayer");
  await expect(page.getByRole("link", { name: "Choose sign-in method" })).toHaveAttribute("href", "/sign-in");
});

test("solo catalog is publicly browseable", async ({ page }) => {
  await expectHealthyNavigation(page, "/solo");

  await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Any Game Counts/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Queen\? Never Heard of Her/ })).toBeVisible();
});

test("multiplayer catalog is publicly browseable", async ({ page }) => {
  await expectHealthyNavigation(page, "/multiplayer");

  await expect(page.getByRole("heading", { name: "Official Multiplayer Side Quests" })).toBeVisible();
  await expect(page.getByText(/official/, { exact: true }).first()).toBeVisible();
});

test("auth entry renders without requiring credentials", async ({ page }) => {
  await expectHealthyNavigation(page, "/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in, then go make terrible chess decisions." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sign in form" })).toBeVisible();
});

test("public challenge share route keeps rules and sign-in boundary available", async ({ page }) => {
  await expectHealthyNavigation(page, "/challenges/finish-any-game");

  await expect(page.getByRole("heading", { name: "Any Game Counts", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Share public link" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
    "href",
    "/sign-in?redirect_url=/challenges/finish-any-game",
  );
});
