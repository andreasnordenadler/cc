import { expect, test } from "@playwright/test";

async function openLongestPublicCommunitySideQuest(page: import("@playwright/test").Page) {
  await page.goto("/community-side-quests", { waitUntil: "domcontentloaded" });
  const rows = page.locator(".sqc-community-catalog-section .sqc-app-row");
  await expect(rows.first()).toBeVisible();
  const loadMore = page.getByRole("button", { name: "Load more" });
  for (let pageIndex = 0; pageIndex < 20 && await loadMore.isVisible(); pageIndex += 1) {
    const previousCount = await rows.count();
    await loadMore.click();
    await expect.poll(() => rows.count()).toBeGreaterThan(previousCount);
  }
  await expect(loadMore).toBeHidden();

  const candidates = await rows.evaluateAll((elements) => {
    return elements.map((element) => ({
      title: element.querySelector(".sqc-row-title-line strong")?.textContent?.trim() ?? "",
      href: element.querySelector<HTMLAnchorElement>('a[href^="/challenges/community/"]')?.getAttribute("href") ?? "",
    })).filter((candidate) => candidate.title && candidate.href);
  });
  const longest = candidates.sort((left, right) => right.title.length - left.title.length)[0];
  expect(longest?.href).toBeTruthy();
  await page.goto(longest.href, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".sqc-community-detail-screen")).toBeVisible();
}

test("wide Community Solo detail uses the desktop canvas without inflating the title", async ({ page }) => {
  await page.setViewportSize({ width: 1679, height: 900 });
  await openLongestPublicCommunitySideQuest(page);

  const detail = page.locator(".sqc-community-detail-screen");
  const title = detail.locator("h1");
  const likeControl = detail.locator(".sqc-community-detail-hero .sqc-like-pill");
  const readingPanel = detail.locator(".sqc-community-reading-panel");
  const taskRail = detail.locator(".sqc-community-task-rail");

  const titleLines = async () => title.evaluate((element) => {
    const styles = getComputedStyle(element);
    return element.getBoundingClientRect().height / Number.parseFloat(styles.lineHeight);
  });
  const geometry = async () => page.evaluate(() => {
    const width = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().width ?? 0;
    return {
      screen: width(".sqc-screen"),
      detail: width(".sqc-community-detail-screen"),
      reading: width(".sqc-community-reading-panel"),
      rail: width(".sqc-community-task-rail"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  const beforeBoundaryTitleLines = await titleLines();
  const beforeBoundaryGeometry = await geometry();
  expect(beforeBoundaryGeometry.screen).toBeCloseTo(1240, 0);
  expect(beforeBoundaryGeometry.rail).toBeLessThan(440);
  expect(beforeBoundaryGeometry.overflow).toBe(0);

  await page.setViewportSize({ width: 1680, height: 900 });
  const boundaryGeometry = await geometry();
  expect(boundaryGeometry.screen).toBeCloseTo(1600, 0);
  expect(boundaryGeometry.detail).toBeCloseTo(1600, 0);
  expect(boundaryGeometry.reading).toBeGreaterThanOrEqual(1000);
  expect(boundaryGeometry.rail).toBeCloseTo(440, 0);
  expect(await titleLines()).toBeLessThanOrEqual(beforeBoundaryTitleLines + 0.05);
  expect(boundaryGeometry.overflow).toBe(0);

  await expect(likeControl).toBeVisible();
  const titleBox = await title.boundingBox();
  const likeBox = await likeControl.boundingBox();
  expect(titleBox).not.toBeNull();
  expect(likeBox).not.toBeNull();
  expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(likeBox!.x + 1);
  await likeControl.focus();
  await expect(likeControl).toBeFocused();

  await page.setViewportSize({ width: 1920, height: 1080 });
  const wideGeometry = await geometry();
  expect(wideGeometry.screen).toBeCloseTo(1600, 0);
  expect(wideGeometry.detail).toBeCloseTo(1600, 0);
  expect(wideGeometry.reading).toBeGreaterThanOrEqual(1000);
  expect(wideGeometry.rail).toBeCloseTo(440, 0);
  expect(await titleLines()).toBeLessThanOrEqual(beforeBoundaryTitleLines + 0.05);
  expect(wideGeometry.overflow).toBe(0);
  await expect(readingPanel).toBeVisible();
  await expect(taskRail).toBeVisible();
});

test("mobile Community Solo detail keeps the single app flow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLongestPublicCommunitySideQuest(page);

  const detail = page.locator(".sqc-community-detail-screen");
  const readingPanel = detail.locator(".sqc-community-reading-panel");
  const taskRail = detail.locator(".sqc-community-task-rail");
  await expect(page.locator(".sqc-desktop-header")).toBeHidden();
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(detail).toHaveCount(1);
  await expect(detail.locator("h1")).toHaveCount(1);
  await expect(detail.locator(".sqc-community-detail-hero .sqc-like-pill")).toHaveCount(1);
  await expect(detail.locator(":scope > .sqc-native-card")).toHaveCount(1);
  await expect(readingPanel).toHaveCSS("display", "contents");
  await expect(taskRail).toBeVisible();
  const sourceOrderIsPreserved = await detail.evaluate((element) => {
    const selectors = [
      ".sqc-community-detail-hero",
      ".sqc-community-reading-panel",
      ".sqc-multiplayer-score-grid",
      ":scope > .sqc-native-card",
      ".sqc-community-task-rail",
    ];
    const nodes = selectors.map((selector) => element.querySelector(selector));
    return nodes.every(Boolean) && nodes.every((node, index) => index === nodes.length - 1
      || Boolean(node!.compareDocumentPosition(nodes[index + 1]!) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(sourceOrderIsPreserved).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
