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

test("wide desktop Home grows into a deliberate 1440px canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1679, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".sqc-desktop-guest")).toHaveCSS("width", "1200px");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator(".sqc-desktop-guest")).toHaveCSS("width", "1440px");
  await expect(page.locator(".sqc-desktop-header")).toHaveCSS("width", "1440px");
  await expect(page.locator(".sqc-desktop-featured-quest")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("desktop Home headline keeps a stable editorial rhythm as the canvas widens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const headline = page.getByRole("heading", { name: "Your next chess game needs a terrible side plot." });
  const lineCount = await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return element.getBoundingClientRect().height / Number.parseFloat(styles.lineHeight);
  });
  expect(lineCount).toBeLessThanOrEqual(3.05);
  await expect(page.locator(".sqc-desktop-hero")).toHaveCSS("min-height", "610px");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1920, height: 1080 });
  const wideLineCount = await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return element.getBoundingClientRect().height / Number.parseFloat(styles.lineHeight);
  });
  expect(wideLineCount).toBeLessThanOrEqual(3.05);
});

test("desktop Home ritual link reveals the complete section below sticky navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByRole("link", { name: "Inspect the ritual" }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(page.getByText("The official procedure", { exact: true })).toBeVisible();

  await expect.poll(async () => page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".sqc-desktop-header-shell");
    const target = document.querySelector<HTMLElement>("#how-it-works");
    if (!header || !target) return false;
    return target.getBoundingClientRect().top >= header.getBoundingClientRect().bottom + 20;
  })).toBe(true);
});

test("mobile Home retains the app composition without the desktop quest picker", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".sqc-app-only")).toBeVisible();
  await expect(page.locator(".sqc-desktop-quest-shelf")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
});
