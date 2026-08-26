import { expect, test } from "@playwright/test";

test("desktop Solo difficulty rail identifies the shelf currently in view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  const rail = page.getByRole("navigation", { name: "Jump to quest difficulty" });
  const easy = rail.getByRole("link", { name: /^Easy/ });
  const hard = rail.getByRole("link", { name: /^Hard/ });

  await expect(rail).toBeVisible();
  await expect(easy).toHaveAttribute("aria-current", "location");
  await expect(hard).not.toHaveAttribute("aria-current", "location");

  await hard.click();
  await expect(page).toHaveURL(/#solo-difficulty-hard$/);
  await expect(hard).toHaveAttribute("aria-current", "location");
  await expect(easy).not.toHaveAttribute("aria-current", "location");

  const hardHeading = page.getByRole("heading", { name: "Hard", exact: true });
  await expect(hardHeading).toBeInViewport();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("desktop Solo difficulty rail follows scrolling through the final shelf", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  const rail = page.getByRole("navigation", { name: "Jump to quest difficulty" });
  const easy = rail.getByRole("link", { name: /^Easy/ });
  const absurd = rail.getByRole("link", { name: /^Absurd/ });

  await expect(easy).toHaveAttribute("aria-current", "location");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(absurd).toHaveAttribute("aria-current", "location");
  await expect(easy).not.toHaveAttribute("aria-current", "location");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(easy).toHaveAttribute("aria-current", "location");
  await expect(absurd).not.toHaveAttribute("aria-current", "location");
});

test("desktop Solo difficulty rail follows a direct shelf hash", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/side-quests#solo-difficulty-hard", { waitUntil: "domcontentloaded" });

  const rail = page.getByRole("navigation", { name: "Jump to quest difficulty" });
  const easy = rail.getByRole("link", { name: /^Easy/ });
  const hard = rail.getByRole("link", { name: /^Hard/ });

  await expect(hard).toHaveAttribute("aria-current", "location");
  await expect(easy).not.toHaveAttribute("aria-current", "location");
  await expect(page.getByRole("heading", { name: "Hard", exact: true })).toBeInViewport();
});

test("mobile Solo keeps the Android catalog composition without the desktop orientation rail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("navigation", { name: "Jump to quest difficulty" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Official Side Quests" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("Solo difficulty orientation uses the established desktop boundary", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  const rail = page.getByRole("navigation", { name: "Jump to quest difficulty" });
  await expect(rail).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(rail).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
