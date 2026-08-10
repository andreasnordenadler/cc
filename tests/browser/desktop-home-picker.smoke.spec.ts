import { expect, test } from "@playwright/test";

test("desktop Home offers Android-equivalent heroism paths and a working random choice", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const workspace = page.locator(".sqc-desktop-quest-shelf");
  await expect(workspace.getByRole("heading", { name: "How heroic are you feeling today?" })).toBeVisible();
  await expect(workspace.locator(".sqc-desktop-path-card")).toHaveCount(3);
  await expect(workspace.getByRole("link", { name: /Start with Knights Before Coffee/ })).toHaveAttribute("href", "/challenges/knights-before-coffee");
  await expect(workspace.getByRole("link", { name: /Try No Castle Club/ })).toHaveAttribute("href", "/challenges/no-castle-club");
  await expect(workspace.getByRole("link", { name: /Lose the queen, win anyway/ })).toHaveAttribute("href", "/challenges/queen-never-heard-of-her");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  const randomButton = workspace.getByRole("button", { name: "Surprise me with a random Solo Side Quest" });
  await randomButton.focus();
  await expect(randomButton).toBeFocused();
  await expect(randomButton).toHaveCSS("outline-style", "solid");
  await randomButton.press("Enter");
  await expect(page).toHaveURL(/\/challenges\/back-rank-goblin$/);
});

test("desktop Home switches composition exactly at the established boundary", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".sqc-app-only")).toBeVisible();
  await expect(page.locator(".sqc-desktop-quest-shelf")).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.locator(".sqc-app-only")).toBeHidden();
  await expect(page.locator(".sqc-desktop-quest-shelf")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("mobile Home retains the app composition without the desktop quest picker", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".sqc-app-only")).toBeVisible();
  await expect(page.locator(".sqc-desktop-quest-shelf")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
});
