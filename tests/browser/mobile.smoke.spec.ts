import { expect, test, type Page } from "@playwright/test";

const noHorizontalOverflow = async (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

async function expectGuestMenu(page: Page) {
  const menu = page.getByRole("navigation", { name: "Guest menu" });
  await expect(menu).toBeVisible();
  for (const name of ["Home", "Solo", "Multiplayer", "Help & Support", "Privacy", "Sign in"]) {
    const link = menu.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByRole("button", { name: "Open main menu" })).toHaveCount(0);
}

test("mobile homepage matches the signed-out app hierarchy", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);

  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Solo Side Quests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Multiplayer Side Quests" })).toBeVisible();
  await expectGuestMenu(page);
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
  await expect(page.getByRole("link", { name: "Open Any Game Counts", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Close screen" })).toBeVisible();
  await expectGuestMenu(page);
  await expect(page.getByRole("link", { name: "Switch to Community Side Quests" })).toHaveAttribute("data-icon", "swap-horizontal");

  const easy = page.getByText("Easy", { exact: true }).first();
  await expect(easy).toHaveCSS("background-color", "rgb(96, 240, 175)");
  await expect(easy).toHaveCSS("color", "rgb(10, 18, 14)");
  const [rowBox, officialTabBox, communityTabBox, swapBox] = await Promise.all([
    page.getByRole("link", { name: "Open Any Game Counts", exact: true }).boundingBox(),
    page.getByRole("tab", { name: "Official Side Quests" }).boundingBox(),
    page.getByRole("tab", { name: "Community Side Quests" }).boundingBox(),
    page.getByRole("link", { name: "Switch to Community Side Quests" }).boundingBox(),
  ]);
  expect(rowBox!.height).toBeLessThanOrEqual(70);
  expect(officialTabBox!.height).toBeLessThanOrEqual(56);
  expect(communityTabBox!.height).toBeLessThanOrEqual(56);
  expect(swapBox!.width).toBeLessThanOrEqual(40);
  await expect(page.locator(".sqc-app-row .sqc-row-copy strong").first()).toHaveCSS("font-size", "14px");
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test("mobile official Solo detail keeps the like control in a bounded hero", async ({ page }) => {
  const response = await page.goto("/challenges/finish-any-game", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);

  const likeControl = page.getByRole("link", { name: "Sign in to like Any Game Counts. 0 likes." });
  await expect(likeControl).toBeVisible();
  const iconBox = await likeControl.locator(".sqc-like-pill-icon").boundingBox();
  expect(iconBox?.width).toBeGreaterThanOrEqual(15);

  const [detailBox, guestMenuBox] = await Promise.all([
    page.getByRole("region", { name: "Current screen" }).boundingBox(),
    page.getByRole("navigation", { name: "Guest menu" }).boundingBox(),
  ]);
  expect(detailBox).not.toBeNull();
  expect(guestMenuBox).not.toBeNull();
  expect(guestMenuBox!.y).toBeGreaterThanOrEqual(detailBox!.y + detailBox!.height);
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test("multiplayer catalog opens Official by default and Community stays app-styled", async ({ page }) => {
  await page.goto("/multiplayer-side-quests", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab", { name: "Official Side Quests" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Official Multiplayer Side Quests" })).toBeVisible();
  await expect(page.getByText("3 official", { exact: true })).toBeVisible();
  const officialLike = page.locator(".sqc-like-pill").first();
  await expect(officialLike).toBeVisible();
  await expect(officialLike).toHaveAttribute("href", /\/sign-in\?redirect_url=%2Fmultiplayer-side-quests/);
  const [officialRowBox, officialLikeBox] = await Promise.all([
    page.locator(".sqc-app-row-with-like").first().boundingBox(),
    officialLike.boundingBox(),
  ]);
  expect(officialRowBox).not.toBeNull();
  expect(officialLikeBox).not.toBeNull();
  expect(officialLikeBox!.x + officialLikeBox!.width).toBeLessThanOrEqual(officialRowBox!.x + officialRowBox!.width);
  await expectGuestMenu(page);

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
