import { expect, test, type Page } from "@playwright/test";

const noHorizontalOverflow = async (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

test("mobile homepage matches the signed-out app hierarchy", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);

  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Solo Side Quests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Multiplayer Side Quests" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open main menu" })).toHaveCount(0);
  await expect(page.locator(".sqc-mobile-web")).toHaveClass(/signed-out/);

  const [soloBox, multiplayerBox] = await Promise.all([
    page.getByRole("link", { name: "Browse Solo Side Quests" }).boundingBox(),
    page.getByRole("link", { name: "Browse Multiplayer Side Quests" }).boundingBox(),
  ]);
  expect(soloBox).not.toBeNull();
  expect(multiplayerBox).not.toBeNull();
  expect(multiplayerBox!.y).toBeGreaterThan(soloBox!.y + soloBox!.height - 1);
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test("mobile solo catalog matches the app catalog hierarchy", async ({ page }) => {
  const response = await page.goto("/side-quests", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);

  await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Any Game Counts/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Close screen" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open main menu" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Switch to Community Side Quests" })).toHaveAttribute("data-icon", "swap-horizontal");

  const easy = page.getByText("Easy", { exact: true }).first();
  await expect(easy).toHaveCSS("background-color", "rgb(96, 240, 175)");
  await expect(easy).toHaveCSS("color", "rgb(10, 18, 14)");
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test("multiplayer catalog opens Official by default and Community stays app-styled", async ({ page }) => {
  await page.goto("/multiplayer-side-quests", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab", { name: "Official Side Quests" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Official Multiplayer Side Quests" })).toBeVisible();
  await expect(page.getByText("3 official", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open main menu" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Community Side Quests" }).click();
  await expect(page).toHaveURL(/tab=community/);
  await expect(page.getByRole("tab", { name: "Community Side Quests" })).toHaveAttribute("aria-selected", "true");
  const controls = page.locator("select, button");
  const count = await controls.count();
  for (let index = 0; index < count; index += 1) {
    await expect(controls.nth(index)).not.toHaveCSS("background-color", "rgb(255, 255, 255)");
  }
  expect(await noHorizontalOverflow(page)).toBe(true);
});
