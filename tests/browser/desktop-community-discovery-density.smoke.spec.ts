import { expect, test } from "@playwright/test";

test("desktop Community discovery keeps a result above the fold with a compact catalog switch", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto("/community-side-quests", { waitUntil: "domcontentloaded" });

  const catalogSwitch = page.getByLabel("Current screen");
  const officialTab = catalogSwitch.getByRole("link", { name: "Official Side Quests", exact: true });
  const communityTab = catalogSwitch.getByRole("link", { name: "Community Side Quests", exact: true });
  const persistentCommunityLink = page.getByRole("navigation", { name: "Desktop shortcuts" }).getByRole("link", { name: "Community Side Quests", exact: true });
  const firstResult = page.locator(".sqc-community-results-layout .sqc-app-row").first();

  await expect(persistentCommunityLink).toBeVisible();
  await expect(persistentCommunityLink).toHaveAttribute("href", "/community-side-quests");
  await expect(persistentCommunityLink).toHaveAttribute("aria-current", "page");
  const header = page.locator(".sqc-desktop-header");
  const headerItems = page.locator(".sqc-desktop-brand, .sqc-desktop-shortcuts a, .sqc-desktop-menu > summary, .sqc-desktop-sign-in");
  const [headerBox, itemBoxes] = await Promise.all([
    header.boundingBox(),
    headerItems.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    })),
  ]);
  expect(headerBox).not.toBeNull();
  for (const item of itemBoxes) {
    expect(item.left).toBeGreaterThanOrEqual(headerBox!.x);
    expect(item.right).toBeLessThanOrEqual(headerBox!.x + headerBox!.width + 1);
  }
  for (let index = 1; index < itemBoxes.length; index += 1) {
    expect(itemBoxes[index].left, `header item ${index} must not overlap its predecessor`).toBeGreaterThanOrEqual(itemBoxes[index - 1].right - 1);
  }
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
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Community Side Quests", exact: true }).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
