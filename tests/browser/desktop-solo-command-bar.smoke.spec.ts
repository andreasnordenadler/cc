import { expect, test } from "@playwright/test";

test.describe("Official Solo desktop command bar", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`keeps catalog context and search available while scrolling at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

      const commandBar = page.locator(".sqc-solo-command-bar");
      const search = page.getByRole("search");
      await expect(commandBar).toBeVisible();
      await expect(search).toBeVisible();
      await expect(commandBar).toHaveCSS("position", "sticky");

      await page.evaluate(() => window.scrollTo(0, 1100));
      await expect.poll(async () => Math.round((await commandBar.boundingBox())?.y ?? -1)).toBe(88);
      const difficultyRail = page.getByRole("navigation", { name: "Jump to quest difficulty" });
      await expect.poll(async () => {
        const commandBox = await commandBar.boundingBox();
        const railBox = await difficultyRail.boundingBox();
        return Boolean(commandBox && railBox && railBox.y >= commandBox.y + commandBox.height);
      }).toBe(true);
      await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
      await expect(search.getByRole("searchbox", { name: "Find an official Side Quest" })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }

  test("preserves the established responsive mobile composition below the desktop boundary", async ({ page }) => {
    await page.setViewportSize({ width: 1179, height: 900 });
    await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".sqc-solo-command-bar")).toHaveCSS("display", "contents");
    await expect(page.getByRole("search")).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test("keeps the Android-style mobile catalog unchanged", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".sqc-solo-command-bar")).toHaveCSS("display", "contents");
    await expect(page.getByRole("search")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
});
