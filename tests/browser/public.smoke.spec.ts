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

test("signed-out shell exposes a visible guest menu without a top hamburger", async ({ page }) => {
  await expectHealthyNavigation(page, "/");

  await expect(page.getByLabel("Open main menu")).toHaveCount(0);
  const menu = page.getByRole("navigation", { name: "Guest menu" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(menu.getByRole("link", { name: "Solo" })).toHaveAttribute("href", "/side-quests");
  await expect(menu.getByRole("link", { name: "Multiplayer" })).toHaveAttribute("href", "/multiplayer");
  await expect(menu.getByRole("link", { name: "Help & Support" })).toHaveAttribute("href", "/support");
  await expect(menu.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  await expect(menu.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
  await expect(menu.getByRole("link", { name: "Trophy Cabinet" })).toHaveCount(0);
});

test("help redirects canonically to support", async ({ page }) => {
  await expectHealthyNavigation(page, "/help");

  await expect(page).toHaveURL(/\/support$/);
  await expect(page.getByRole("heading", { name: "How can we help?" })).toBeVisible();
});

test("signed-out support clearly requires an account before messaging", async ({ page }) => {
  await expectHealthyNavigation(page, "/support");

  const report = page.getByRole("region", { name: "Report a problem" });
  await expect(report.getByText("Support messages require a signed-in SQC account.")).toBeVisible();
  await expect(report.getByRole("link", { name: "Sign in to message support" })).toHaveAttribute(
    "href",
    "/sign-in?redirect_url=/support",
  );
  await expect(report.getByRole("button", { name: "Send support message" })).toHaveCount(0);
});

test("account sign-in hero stays bounded on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/sign-in");

  const heading = page.getByRole("heading", { name: "Sign in, then go make terrible chess decisions." });
  await expect(heading).toBeVisible();
  const fontSize = await heading.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeLessThanOrEqual(40);
  await expect(page.getByRole("region", { name: "Sign in form" })).toBeInViewport();
});

test("solo catalog is publicly browseable", async ({ page }) => {
  await expectHealthyNavigation(page, "/solo");

  await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Any Game Counts", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Queen? Never Heard of Her", exact: true })).toBeVisible();
});

test("multiplayer catalog is publicly browseable", async ({ page }) => {
  await expectHealthyNavigation(page, "/multiplayer");

  await expect(page.getByRole("heading", { name: "Official Multiplayer Side Quests" })).toBeVisible();
  await expect(page.getByText(/official/, { exact: true }).first()).toBeVisible();
});

test("privacy policy is public, dedicated, and links to privacy support", async ({ page }) => {
  await expectHealthyNavigation(page, "/privacy");

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Information SQC handles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chess game verification" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact privacy support" })).toHaveAttribute(
    "href",
    "mailto:andreas.nordenadler@gmail.com?subject=Side%20Quest%20Chess%20privacy%20request",
  );
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
  await expect(page.getByLabel("Current screen").getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
    "href",
    "/sign-in?redirect_url=/challenges/finish-any-game",
  );
});
