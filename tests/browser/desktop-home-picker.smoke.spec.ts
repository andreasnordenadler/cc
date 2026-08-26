import { expect, test } from "@playwright/test";

test("desktop Home turns the featured quest into a keyboard-ready launch board", async ({ page }) => {
  for (const width of [1180, 1440, 1920]) {
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const board = page.locator(".sqc-desktop-featured-quest");
    const alternatives = page.getByRole("navigation", { name: "More recommended Solo Side Quests" });
    await expect(board).toBeVisible();
    await expect(alternatives.getByRole("link")).toHaveCount(2);
    await expect(alternatives.getByRole("link", { name: /Bishop Field Trip/ })).toHaveAttribute("href", "/challenges/bishop-field-trip");
    await expect(alternatives.getByRole("link", { name: /Early King Walk/ })).toHaveAttribute("href", "/challenges/early-king-walk");
    await expect.poll(() => board.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

    const primary = page.locator(".sqc-desktop-featured-primary");
    await primary.focus();
    await expect(primary).toBeFocused();
    await expect(primary).toHaveCSS("outline-style", "solid");
  }
});

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

test("wide desktop Home grows continuously into the expanded route canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1679, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".sqc-desktop-guest")).toHaveCSS("width", "1320px");
  await expect(page.locator(".sqc-desktop-header")).toHaveCSS("width", "1320px");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator(".sqc-desktop-guest")).toHaveCSS("width", "1600px");
  await expect(page.locator(".sqc-desktop-header")).toHaveCSS("width", "1600px");
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

test("desktop Home uses one side-by-side command deck while mobile keeps the original flow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const commandDeck = page.locator(".sqc-desktop-command-deck");
  const ritual = page.locator(".sqc-desktop-loop");
  const picker = page.locator(".sqc-desktop-quest-shelf");
  await expect(commandDeck).toHaveCSS("display", "grid");
  await expect.poll(async () => {
    const [ritualBox, pickerBox] = await Promise.all([ritual.boundingBox(), picker.boundingBox()]);
    return Boolean(ritualBox && pickerBox && Math.abs(ritualBox.y - pickerBox.y) < 1 && pickerBox.x > ritualBox.x + ritualBox.width);
  }).toBe(true);
  await expect(picker.locator(".sqc-desktop-path-card")).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(commandDeck).toHaveCSS("display", "contents");
  await expect(ritual).toBeHidden();
  await expect(picker).toBeHidden();
  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
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
