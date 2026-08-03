import { expect, test } from "@playwright/test";

async function expectHealthyNavigation(page: import("@playwright/test").Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `${path} should return a document response`).not.toBeNull();
  expect(response!.status(), `${path} should not return an HTTP error`).toBeLessThan(400);
}

test("signed-out desktop homepage explains the loop and exposes public browsing plus auth", async ({ page }) => {
  await expectHealthyNavigation(page, "/");

  await expect(page.getByRole("heading", { name: "Your next chess game needs a terrible side plot." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Choose your bad idea", exact: true })).toHaveAttribute("href", "/side-quests");
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" }).getByRole("link", { name: "Multiplayer Side Quests" })).toHaveAttribute("href", "/multiplayer");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/sign-in?redirect_url=%2F");
  await expect(page.getByRole("heading", { name: "The ritual is suspiciously simple." })).toBeVisible();
  await expect(page.getByText("Present evidence to the paperwork goblin", { exact: true })).toBeVisible();
  await expect(page.getByText("Receive unnecessary heraldry", { exact: true })).toBeVisible();
});

test("desktop app menu dismisses with Escape and outside click", async ({ page }) => {
  await expectHealthyNavigation(page, "/");

  const trigger = page.locator(".sqc-desktop-menu summary");
  const menu = page.getByRole("navigation", { name: "Desktop main menu" });

  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(trigger).toContainText("Explore");
  await expect(menu.getByText("Create & manage", { exact: true })).toBeVisible();
  await expect(menu.getByText("Account & help", { exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "My Custom Side Quests" })).toHaveAttribute("href", "/custom-side-quests");
  await expect(menu.getByRole("link", { name: "Help & Support" })).toHaveAttribute("href", "/support");
  await expect(menu.getByRole("link", { name: "My Account", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(1);
  await expect(menu.getByRole("link", { name: "Home", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(menu).toBeVisible();
  await page.getByRole("heading", { name: "Your next chess game needs a terrible side plot." }).click();
  await expect(menu).toBeHidden();
});

test("signed-out desktop-native routes omit the phone menu and expose persistent shortcuts", async ({ page }) => {
  await expectHealthyNavigation(page, "/");

  await expect(page.getByLabel("Open main menu")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Guest menu" })).toHaveCount(0);

  await expectHealthyNavigation(page, "/side-quests");
  await expect(page.getByRole("navigation", { name: "Guest menu" })).toHaveCount(0);
  const shortcuts = page.getByRole("navigation", { name: "Desktop shortcuts" });
  await expect(shortcuts).toBeVisible();
  await expect(shortcuts.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(shortcuts.getByRole("link", { name: "Solo Side Quests" })).toHaveAttribute("href", "/side-quests");
  await expect(shortcuts.getByRole("link", { name: "Multiplayer Side Quests" })).toHaveAttribute("href", "/multiplayer");
  await expect(shortcuts.getByRole("link", { name: "Trophy Cabinet" })).toHaveAttribute("href", "/trophy-cabinet");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/sign-in?redirect_url=%2Fside-quests");
});

test("desktop Solo discovery keeps every objective readable at the composition boundary", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 });
  await expectHealthyNavigation(page, "/side-quests");

  const cards = page.locator(".sqc-catalog .sqc-app-row");
  expect(await cards.count()).toBeGreaterThan(0);
  const geometry = await cards.evaluateAll((rows) => rows.map((row) => {
    const objective = row.querySelector<HTMLElement>(".sqc-row-copy small");
    return {
      minHeight: Number.parseFloat(getComputedStyle(row).minHeight),
      objectiveClientHeight: objective?.clientHeight ?? 0,
      objectiveScrollHeight: objective?.scrollHeight ?? 0,
    };
  }));

  expect(geometry.every(({ minHeight }) => minHeight === 176)).toBe(true);
  expect(geometry.every(({ objectiveClientHeight, objectiveScrollHeight }) => objectiveScrollHeight <= objectiveClientHeight + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("Community discovery switches between one mobile catalog and a desktop browsing workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/community-side-quests");

  const desktopIntro = page.getByRole("heading", { name: "Player-made rules, arranged for serious browsing." });
  await expect(desktopIntro).toBeHidden();
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(page.getByLabel("Community Side Quest filters")).toHaveCount(1);
  const firstRow = page.locator(".sqc-community-catalog-section .sqc-app-row").first();
  if (await firstRow.count()) {
    await expect(firstRow.locator(".sqc-community-row-mobile-meta")).toBeVisible();
    await expect(firstRow.locator(".sqc-community-row-details")).toBeHidden();
  }

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(desktopIntro).toBeVisible();
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(page.getByLabel("Community Side Quest filters")).toHaveCount(1);

  const catalog = page.locator(".sqc-community-catalog-section .sqc-catalog");
  if (await catalog.count()) {
    const columns = await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(2);
    await expect(firstRow.locator(".sqc-community-row-mobile-meta")).toBeHidden();
    await expect(firstRow.locator(".sqc-community-row-details")).toBeVisible();
    await expect(firstRow.locator(".sqc-community-row-creator")).toContainText("By ");
    await expect(firstRow.locator(".sqc-community-row-summary")).not.toBeEmpty();
    await expect(firstRow.locator(".sqc-community-row-stat")).toHaveCount(3);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(2);

    await page.setViewportSize({ width: 1679, height: 900 });
    expect(await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(2);

    await page.setViewportSize({ width: 1680, height: 900 });
    expect(await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(3);

    await page.setViewportSize({ width: 1920, height: 1080 });
    const wideGeometry = await catalog.evaluate((element) => {
      const screen = element.closest(".sqc-screen");
      const cards = Array.from(element.querySelectorAll<HTMLElement>(".sqc-app-row"));
      return {
        columns: getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
        screenWidth: screen?.getBoundingClientRect().width ?? 0,
        cardWidths: cards.slice(0, 3).map((card) => card.getBoundingClientRect().width),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(wideGeometry.columns).toBe(3);
    expect(wideGeometry.screenWidth).toBeGreaterThanOrEqual(1500);
    expect(wideGeometry.cardWidths).toHaveLength(3);
    expect(wideGeometry.cardWidths.every((width) => width >= 390)).toBe(true);
    expect(wideGeometry.overflow).toBe(0);
  } else {
    await expect(page.locator(".sqc-community-catalog-section .sqc-empty-panel.standalone")).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("official Solo detail switches from the mobile flow to one desktop action workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/challenges/knights-before-coffee");

  const detail = page.locator(".sqc-official-solo-detail-screen");
  const shareActions = detail.locator(":scope > .sqc-community-share-actions");
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(detail.locator(".sqc-proof-action-card").getByRole("link", { name: "Sign in", exact: true })).toHaveCount(1);
  await expect(shareActions).toHaveCSS("grid-template-columns", /\d+px/);
  const mobileShareColumnCount = await shareActions.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(mobileShareColumnCount).toBe(1);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(detail.locator(".sqc-proof-action-card").getByRole("link", { name: "Sign in", exact: true })).toHaveCount(1);

  const geometry = await detail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const share = element.querySelector(":scope > .sqc-community-share-actions");
    const shareButtons = share ? Array.from(share.querySelectorAll("button")) : [];
    return {
      width: Math.round(rect.width),
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      shareColumns: share ? getComputedStyle(share).gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      shareButtonWidths: shareButtons.map((button) => Math.round(button.getBoundingClientRect().width)),
      shareButtonHeights: shareButtons.map((button) => Math.round(button.getBoundingClientRect().height)),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.width).toBeGreaterThan(1000);
  expect(geometry.columns).toBe(2);
  expect(geometry.shareColumns).toBe(2);
  expect(geometry.shareButtonWidths).toHaveLength(2);
  expect(Math.abs(geometry.shareButtonWidths[0] - geometry.shareButtonWidths[1])).toBeLessThanOrEqual(2);
  expect(geometry.shareButtonHeights.every((height) => height >= 46)).toBe(true);
  expect(geometry.overflow).toBe(0);
});

test("Community Solo detail switches from the mobile flow to one desktop task workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/challenges/community/seed-castle-never-heard-of-it-05-1");

  const detail = page.locator(".sqc-community-detail-screen");
  const share = page.getByRole("button", { name: "Share Community Solo Side Quest" });
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(share).toHaveCount(1);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(share).toHaveCount(1);

  const geometry = await detail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const taskRail = element.querySelector(".sqc-community-task-rail");
    return {
      width: Math.round(rect.width),
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      taskRailPosition: taskRail ? getComputedStyle(taskRail).position : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.width).toBeGreaterThan(1000);
  expect(geometry.columns).toBe(2);
  expect(geometry.taskRailPosition).toBe("sticky");
  expect(geometry.overflow).toBe(0);
});

test("Custom library switches from the mobile flow to one desktop workshop", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/custom-side-quests");

  const intro = page.getByRole("heading", { name: "Your Side Quest workshop, with room to think." });
  await expect(intro).toBeHidden();
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(page.getByRole("link", { name: "+ Create" })).toHaveCount(1);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(intro).toBeVisible();
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(page.getByRole("link", { name: "+ Create" })).toHaveCount(1);

  const geometry = await page.locator(".sqc-custom-library-screen").evaluate((element) => ({
    columns: getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(geometry.columns).toBe(2);
  expect(geometry.overflow).toBe(0);
});

test("sign-in returns to the exact page and query where the user started", async ({ page }) => {
  await page.goto("/side-quests?tab=community");
  const signInLink = page.getByRole("link", { name: "Sign in", exact: true });
  await expect(signInLink).toHaveAttribute("href", "/sign-in?redirect_url=%2Fside-quests%3Ftab%3Dcommunity");
  await signInLink.click();

  await expect(page).toHaveURL(/\/sign-in\?redirect_url=/);
  expect(new URL(page.url()).searchParams.get("redirect_url")).toBe("/side-quests?tab=community");
});

test("help redirects canonically to support", async ({ page }) => {
  await expectHealthyNavigation(page, "/help");

  await expect(page).toHaveURL(/\/support$/);
  await expect(page.getByRole("heading", { name: "How can we help?" })).toBeVisible();
});

test("signed-out support clearly requires an account before messaging", async ({ page }) => {
  await expectHealthyNavigation(page, "/support");

  const report = page.getByRole("region", { name: "Report a problem" });
  await expect(report.getByText("Support messages require a signed-in Side Quest Chess account.")).toBeVisible();
  await expect(report.getByRole("link", { name: "Sign in to message support" })).toHaveAttribute(
    "href",
    "/sign-in?redirect_url=/support",
  );
  await expect(report.getByRole("button", { name: "Send support message" })).toHaveCount(0);
});

test("account authentication uses a desktop workspace without duplicating the Clerk form", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/sign-in");

  const heading = page.getByRole("heading", { name: "Sign in, then go make terrible chess decisions." });
  const workspace = page.locator(".sqc-auth-workspace");
  await expect(heading).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(page.getByLabel("What your account keeps")).toBeVisible();
  await expect(page.getByRole("region", { name: "Sign in form" })).toBeInViewport();
  await expect(page.locator(".sqc-auth-card form")).toHaveCount(1);

  const geometry = await workspace.evaluate((element) => ({
    columns: getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
    fontSize: Number.parseFloat(getComputedStyle(element.querySelector("h1")!).fontSize),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(geometry.columns).toBe(2);
  expect(geometry.fontSize).toBeGreaterThanOrEqual(48);
  expect(geometry.fontSize).toBeLessThanOrEqual(66);
  expect(geometry.overflow).toBe(0);
});

test("solo catalog is publicly browseable", async ({ page }) => {
  await expectHealthyNavigation(page, "/solo");

  await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Any Game Counts", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Queen? Never Heard of Her", exact: true })).toBeVisible();
});

test("multiplayer catalog is publicly browseable", async ({ page }) => {
  await expectHealthyNavigation(page, "/multiplayer");

  await expect(page.getByRole("heading", { name: "Official Multiplayer Side Quests" })).toBeVisible();
  await expect(page.getByText(/official/, { exact: true }).first()).toBeVisible();
});

test("privacy policy is public, dedicated, and links to privacy support", async ({ page }) => {
  await expectHealthyNavigation(page, "/privacy");

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Information Side Quest Chess handles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chess game verification" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact privacy support" })).toHaveAttribute(
    "href",
    "mailto:andreas.nordenadler@gmail.com?subject=Side%20Quest%20Chess%20privacy%20request",
  );
});

test("Terms of Use has a public dedicated launch-draft destination", async ({ page }) => {
  await expectHealthyNavigation(page, "/terms");

  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole("heading", { name: "Terms of Use" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Draft status" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  await expect(page.getByRole("link", { name: "Open Help & Support" })).toHaveAttribute("href", "/support");
  const brandItemsOverlap = await page.locator(".terms-brand-row").evaluate((row) => {
    const [back, kicker] = Array.from(row.children).map((element) => element.getBoundingClientRect());
    return back.left < kicker.right && back.right > kicker.left && back.top < kicker.bottom && back.bottom > kicker.top;
  });
  expect(brandItemsOverlap).toBe(false);
});

test("auth entry renders without requiring credentials", async ({ page }) => {
  await expectHealthyNavigation(page, "/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in, then go make terrible chess decisions." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sign in form" })).toBeVisible();
});

test("public challenge sharing copies the exact route and keeps the sign-in boundary available", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await expectHealthyNavigation(page, "/challenges/finish-any-game");

  await expect(page.getByRole("heading", { name: "Any Game Counts", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Share public link" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share Solo Side Quest public link" })).toBeVisible();
  await page.getByRole("button", { name: "Copy Solo Side Quest public link" }).click();
  await expect(page.getByRole("status")).toHaveText("Public link copied.");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    new URL("/challenges/finish-any-game", page.url()).toString(),
  );
  await expect(page.getByLabel("Current screen").getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
    "href",
    "/sign-in?redirect_url=/challenges/finish-any-game",
  );
});
