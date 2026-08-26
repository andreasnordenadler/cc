import { expect, test } from "@playwright/test";

const desktopWidths = [1180, 1440, 1600, 1920] as const;

test("desktop Solo masthead keeps a stable two-line hierarchy as the canvas widens", async ({ page }) => {
  await page.setViewportSize({ width: desktopWidths[0], height: 900 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  const headline = page.getByRole("heading", {
    name: "Choose the rule that will ruin your next perfectly normal game.",
  });
  const paragraph = page.locator(".sqc-desktop-catalog-intro p");
  const firstShelf = page.locator(".sqc-solo-difficulty-grid").first();
  let previousShelfTop = Number.POSITIVE_INFINITY;

  for (const width of desktopWidths) {
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : 900 });

    const geometry = await headline.evaluate((element) => {
      const styles = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        lineCount: rect.height / Number.parseFloat(styles.lineHeight),
        width: rect.width,
      };
    });
    const paragraphBox = await paragraph.boundingBox();
    const tabsBox = await page.locator(".sqc-solo-brand-tabs").boundingBox();
    const shelfBox = await firstShelf.boundingBox();

    if (width >= 1440) {
      expect(geometry.lineCount, `${width}px headline line count`).toBeLessThanOrEqual(2.05);
      expect(geometry.width, `${width}px headline should use the available desktop canvas`).toBeGreaterThanOrEqual(890);
      expect(paragraphBox?.width, `${width}px supporting copy should retain a readable measure`).toBeGreaterThanOrEqual(650);
      expect(paragraphBox, `${width}px supporting copy`).not.toBeNull();
      expect(tabsBox, `${width}px catalog tabs`).not.toBeNull();
      expect(paragraphBox!.x + paragraphBox!.width, `${width}px supporting copy should not run under catalog tabs`).toBeLessThanOrEqual(tabsBox!.x - 16);
    } else {
      expect(geometry.width, `${width}px boundary headline should fill the available desktop column`).toBeGreaterThanOrEqual(780);
    }
    expect(shelfBox, `${width}px first difficulty shelf`).not.toBeNull();
    expect(shelfBox!.y, `${width}px catalog should not drop by another text row as the viewport widens`).toBeLessThanOrEqual(previousShelfTop + 8);
    previousShelfTop = shelfBox!.y;
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  }
});

test("mobile Solo keeps the existing app masthead without desktop overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".sqc-desktop-catalog-intro")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Official Side Quests" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
