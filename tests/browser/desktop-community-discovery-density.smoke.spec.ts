import { expect, test } from "@playwright/test";

test("desktop Community discovery keeps a result above the fold with a compact catalog switch", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/community-side-quests", { waitUntil: "domcontentloaded" });

  const officialTab = page.getByRole("link", { name: "Official Side Quests", exact: true });
  const communityTab = page.getByRole("link", { name: "Community Side Quests", exact: true });
  const firstResult = page.locator(".sqc-community-results-layout .sqc-app-row").first();

  await expect(firstResult).toBeVisible();
  const [officialBox, communityBox, resultBox] = await Promise.all([
    officialTab.boundingBox(),
    communityTab.boundingBox(),
    firstResult.boundingBox(),
  ]);

  expect(officialBox).not.toBeNull();
  expect(communityBox).not.toBeNull();
  expect(resultBox).not.toBeNull();
  expect(Math.abs(officialBox!.y - communityBox!.y), "the desktop catalog switch should be one compact row").toBeLessThanOrEqual(1);
  expect(resultBox!.y, "the first real Community result should begin above the 900px fold").toBeLessThanOrEqual(560);
  expect(resultBox!.y + Math.min(resultBox!.height, 220), "a useful portion of the first result should remain visible").toBeLessThanOrEqual(900);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("mobile Community discovery retains the established stacked app composition", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/community-side-quests", { waitUntil: "domcontentloaded" });

  const officialTab = page.getByRole("link", { name: "Official Side Quests", exact: true });
  const communityTab = page.getByRole("link", { name: "Community Side Quests", exact: true });
  const [officialBox, communityBox] = await Promise.all([officialTab.boundingBox(), communityTab.boundingBox()]);

  expect(officialBox).not.toBeNull();
  expect(communityBox).not.toBeNull();
  expect(communityBox!.x).toBeGreaterThan(officialBox!.x);
  await expect(page.locator(".sqc-desktop-community-intro")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Community Side Quests", exact: true }).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
