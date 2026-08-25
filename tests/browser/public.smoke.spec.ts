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

test("desktop Home navigation and content share the expanded route canvas without changing mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/");
  await expect(page.getByRole("heading", { name: "Your next chess game needs a terrible side plot." })).toBeVisible();

  const desktopGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".sqc-desktop-header");
    const content = document.querySelector<HTMLElement>(".sqc-desktop-guest");
    if (!header || !content) throw new Error("Expected the signed-out desktop Home workspace");
    return {
      headerWidth: Math.round(header.getBoundingClientRect().width),
      contentWidth: Math.round(content.getBoundingClientRect().width),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(desktopGeometry).toEqual({ headerWidth: 1320, contentWidth: 1320, overflow: 0 });

  await page.setViewportSize({ width: 1920, height: 1080 });
  const wideGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".sqc-desktop-header");
    const content = document.querySelector<HTMLElement>(".sqc-desktop-guest");
    if (!header || !content) throw new Error("Expected the signed-out wide Home workspace");
    return {
      headerWidth: Math.round(header.getBoundingClientRect().width),
      contentWidth: Math.round(content.getBoundingClientRect().width),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(wideGeometry).toEqual({ headerWidth: 1600, contentWidth: 1600, overflow: 0 });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".sqc-desktop-home-only")).toBeHidden();
  await expect(page.locator(".sqc-app-only")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("desktop app menu dismisses with Escape, focus departure, and outside click", async ({ page, browser }, testInfo) => {
  const noJavaScriptContext = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: testInfo.project.use.baseURL as string,
  });
  const noJavaScriptPage = await noJavaScriptContext.newPage();
  await expectHealthyNavigation(noJavaScriptPage, "/");
  const serverRenderedMenu = noJavaScriptPage.locator(".sqc-desktop-menu");
  const serverRenderedTrigger = serverRenderedMenu.locator("summary");
  await expect(serverRenderedMenu).toHaveAttribute("inert", "");
  const triggerBox = await serverRenderedTrigger.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await noJavaScriptPage.mouse.click(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
  await expect(serverRenderedMenu).not.toHaveAttribute("open", "");
  await serverRenderedTrigger.focus();
  await expect(serverRenderedTrigger).not.toBeFocused();
  await noJavaScriptContext.close();

  await expectHealthyNavigation(page, "/");

  const trigger = page.locator(".sqc-desktop-menu summary");
  const menu = page.getByRole("navigation", { name: "Desktop main menu" });
  await expect(page.locator(".sqc-desktop-menu")).not.toHaveAttribute("inert", "");

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

  await trigger.press("Enter");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "Trophy Cabinet", exact: true })).toBeFocused();
  await expect(menu).toBeHidden();

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

test("official Solo command rail keeps responsive reading order and control identity", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/challenges/finish-any-game");

  const rail = page.getByRole("complementary", { name: "Solo Side Quest actions" });
  const share = rail.getByRole("button", { name: "Share Solo Side Quest public link" });
  const labels = () => rail.locator("a, button").evaluateAll((controls) => controls.map((control) => control.textContent?.trim()));

  await expect.poll(labels).toEqual(["Share public link", "Copy public link", "Back to list", "Sign in"]);
  await share.focus();
  await expect(share).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(rail.getByRole("button", { name: "Copy Solo Side Quest public link" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(rail.getByRole("link", { name: "Back to list" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(rail.getByRole("link", { name: "Sign in", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await share.focus();

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect.poll(labels).toEqual(["Back to list", "Sign in", "Share public link", "Copy public link"]);
  await expect(share).toBeFocused();
  await rail.getByRole("link", { name: "Back to list" }).focus();
  await page.keyboard.press("Tab");
  await expect(rail.getByRole("link", { name: "Sign in", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(share).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(rail.getByRole("button", { name: "Copy Solo Side Quest public link" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await share.focus();

  await page.setViewportSize({ width: 1179, height: 900 });
  await expect.poll(labels).toEqual(["Share public link", "Copy public link", "Back to list", "Sign in"]);
  await expect(share).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("desktop Multiplayer creation keeps its live draft action in view without changing the mobile footer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/create-multiplayer-side-quest");

  const action = page.getByRole("form", { name: "Create Multiplayer Side Quest form" }).locator(".sqc-create-footer-bar");
  await expect(action).toBeVisible();
  const desktopGeometry = await action.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      position: getComputedStyle(element).position,
      bottom: Math.round(window.innerHeight - rect.bottom),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(desktopGeometry).toEqual({ position: "fixed", bottom: 24, overflow: 0 });
  await expect(action.getByRole("button", { name: "Sign in to create Multiplayer Side Quest" })).toBeVisible();

  await page.setViewportSize({ width: 1920, height: 1080 });
  const form = page.getByRole("form", { name: "Create Multiplayer Side Quest form" });
  const wideGeometry = await form.evaluate((element) => {
    const screen = element.closest<HTMLElement>(".sqc-screen");
    const setup = element.querySelector<HTMLElement>(".sqc-create-setup-card");
    const catalog = element.querySelector<HTMLElement>(".sqc-create-catalog-card");
    if (!screen || !setup || !catalog) throw new Error("Expected the desktop creation workspace");
    const screenRect = screen.getBoundingClientRect();
    const setupRect = setup.getBoundingClientRect();
    const catalogRect = catalog.getBoundingClientRect();
    return {
      screenWidth: Math.round(screenRect.width),
      setupWidth: Math.round(setupRect.width),
      catalogWidth: Math.round(catalogRect.width),
      catalogBesideSetup: catalogRect.left > setupRect.right,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(wideGeometry).toEqual({
    screenWidth: 1600,
    setupWidth: 906,
    catalogWidth: 670,
    catalogBesideSetup: true,
    overflow: 0,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileGeometry = await action.evaluate((element) => ({
    position: getComputedStyle(element).position,
    bottom: getComputedStyle(element).bottom,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(mobileGeometry).toEqual({ position: "sticky", bottom: "10px", overflow: 0 });
});

test("desktop Trophy Cabinet turns coat previews into decision-ready collection cards without changing mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/trophy-cabinet");

  const grid = page.getByLabel("Official Solo Side Quest coat grid");
  const firstCoat = grid.getByRole("link").first();
  await expect(firstCoat.locator(".sqc-coat-tile-context")).toBeHidden();
  await expect(firstCoat.locator(".sqc-coat-tile-objective")).toBeHidden();
  expect(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(3);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(firstCoat.locator(".sqc-coat-tile-context")).toBeVisible();
  await expect(firstCoat.locator(".sqc-coat-tile-objective")).toBeVisible();
  await expect(firstCoat.locator(".sqc-coat-tile-objective")).toContainText("back-rank mate");
  expect(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(3);
  const objectiveGeometry = await grid.locator(".sqc-coat-tile-objective").evaluateAll((objectives) => objectives.map((objective) => ({
    clientHeight: objective.clientHeight,
    scrollHeight: objective.scrollHeight,
  })));
  expect(objectiveGeometry.every(({ clientHeight, scrollHeight }) => scrollHeight <= clientHeight + 1)).toBe(true);
  expect(await grid.getByRole("link").last().evaluate((tile) => getComputedStyle(tile).gridColumnStart)).toBe("2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1379, height: 900 });
  expect(await page.locator(".sqc-trophy-sign-in").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1440, height: 900 });
  const standardDesktopGeometry = await page.evaluate(() => {
    const results = document.querySelector<HTMLElement>(".sqc-trophy-results-bar");
    const firstTile = document.querySelector<HTMLElement>(".sqc-coat-tile");
    const signIn = document.querySelector<HTMLElement>(".sqc-trophy-sign-in");
    return {
      resultsTop: results?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      firstTileTop: firstTile?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      signInColumns: signIn ? getComputedStyle(signIn).gridTemplateColumns.split(" ").length : 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(standardDesktopGeometry.resultsTop).toBeLessThanOrEqual(590);
  expect(standardDesktopGeometry.firstTileTop).toBeLessThanOrEqual(680);
  expect(standardDesktopGeometry.signInColumns).toBe(2);
  expect(standardDesktopGeometry.overflow).toBe(0);

  await page.setViewportSize({ width: 1920, height: 1080 });
  expect(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(4);
  expect(await grid.getByRole("link").first().evaluate((tile) => tile.getBoundingClientRect().width)).toBeGreaterThan(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("desktop Trophy Cabinet difficulty directory filters the shared coat collection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/trophy-cabinet");

  const directory = page.getByRole("complementary", { name: "Filter coats by difficulty" });
  const results = page.getByRole("region", { name: "Coat collection results" });
  const grid = page.getByLabel("Official Solo Side Quest coat grid");
  await expect(directory).toBeVisible();
  await expect(results).toContainText("13 coats on display");
  await expect(grid.getByRole("link")).toHaveCount(13);

  const hardFilter = directory.getByRole("button", { name: "Hard 3" });
  await expect(async () => {
    await hardFilter.click();
    await expect(hardFilter).toHaveAttribute("aria-pressed", "true");
  }).toPass();
  await expect(results).toContainText("3 Hard coats");
  await expect(results.getByRole("button", { name: "Show all coats" })).toBeVisible();
  await expect(grid.getByRole("link")).toHaveCount(3);
  await expect(grid.getByText("No Castle Club", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await results.getByRole("button", { name: "Show all coats" }).click();
  await expect(results).toContainText("13 coats on display");
  await expect(grid.getByRole("link")).toHaveCount(13);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(directory).toBeHidden();
  await expect(results).toBeHidden();
  await expect(grid.getByRole("link")).toHaveCount(13);
});

test("desktop Solo discovery keeps every objective and Android opening hint readable at the composition boundary", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/side-quests");
  const cards = page.locator(".sqc-catalog .sqc-app-row");
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first().locator(".sqc-solo-card-details")).toBeHidden();

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(cards.first().locator(".sqc-solo-card-details")).toBeVisible();
  await expect(cards.first().locator(".sqc-solo-card-open")).toContainText("View quest details");
  await expect(page.getByText("Horses first. Plans later.", { exact: true })).toBeVisible();

  const geometry = await cards.evaluateAll((rows) => rows.map((row) => {
    const objective = row.querySelector<HTMLElement>(".sqc-row-copy small");
    const note = row.querySelector<HTMLElement>(".sqc-solo-card-note");
    return {
      minHeight: Number.parseFloat(getComputedStyle(row).minHeight),
      objectiveClientHeight: objective?.clientHeight ?? 0,
      objectiveScrollHeight: objective?.scrollHeight ?? 0,
      noteClientHeight: note?.clientHeight ?? 0,
      noteScrollHeight: note?.scrollHeight ?? 0,
    };
  }));

  expect(geometry.every(({ minHeight }) => minHeight === 190)).toBe(true);
  expect(geometry.every(({ objectiveClientHeight, objectiveScrollHeight }) => objectiveScrollHeight <= objectiveClientHeight + 1)).toBe(true);
  expect(geometry.every(({ noteClientHeight, noteScrollHeight }) => noteScrollHeight <= noteClientHeight + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1440, height: 900 });
  const standardDesktop = await cards.evaluateAll((rows) => rows.map((row) => ({
    minHeight: Number.parseFloat(getComputedStyle(row).minHeight),
    height: row.getBoundingClientRect().height,
    overflow: row.scrollHeight - row.clientHeight,
  })));
  expect(standardDesktop.every(({ minHeight }) => minHeight === 178)).toBe(true);
  expect(standardDesktop.every(({ height, overflow }) => height >= 178 && overflow === 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1920, height: 1080 });
  const wideDesktop = await cards.evaluateAll((rows) => rows.map((row) => ({
    minHeight: Number.parseFloat(getComputedStyle(row).minHeight),
    overflow: row.scrollHeight - row.clientHeight,
  })));
  expect(wideDesktop.every(({ minHeight, overflow }) => minHeight === 176 && overflow === 0)).toBe(true);
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
  await expect(page.getByRole("complementary", { name: "Creator shortcuts" })).toBeHidden();
  const firstRow = page.locator(".sqc-community-catalog-section .sqc-app-row").first();
  const catalogSummary = page.getByRole("complementary", { name: "Public catalog at a glance" });
  if (await firstRow.count()) {
    await expect(firstRow.locator(".sqc-community-row-mobile-meta")).toBeVisible();
    await expect(firstRow.locator(".sqc-community-row-details")).toBeHidden();
  }
  if (await catalogSummary.count()) await expect(catalogSummary).toBeHidden();

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(desktopIntro).toBeVisible();
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(page.getByLabel("Community Side Quest filters")).toHaveCount(1);
  const creatorDirectory = page.getByRole("complementary", { name: "Creator shortcuts" });
  const creatorShortcutCount = await creatorDirectory.getByRole("link").count();
  if (creatorShortcutCount) {
    await expect(creatorDirectory).toBeVisible();
    expect(creatorShortcutCount).toBeLessThanOrEqual(6);
  } else {
    await expect(creatorDirectory).toHaveCount(0);
  }

  const catalog = page.locator(".sqc-community-catalog-section .sqc-catalog");
  if (await catalog.count()) {
    const initialCatalogRowCount = await catalog.locator(".sqc-app-row").count();
    const expectedColumnCount = (wide: boolean) => initialCatalogRowCount === 1 ? 1 : wide ? 3 : 2;
    const columns = await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(expectedColumnCount(false));
    await expect(firstRow.locator(".sqc-community-row-mobile-meta")).toBeHidden();
    await expect(firstRow.locator(".sqc-community-row-details")).toBeVisible();
    await expect(firstRow.locator(".sqc-community-row-creator")).toContainText("By ");
    await expect(firstRow.locator(".sqc-community-row-summary")).not.toBeEmpty();
    await expect(firstRow.locator(".sqc-community-row-stat")).toHaveCount(3);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(expectedColumnCount(true));

    await page.setViewportSize({ width: 1679, height: 900 });
    expect(await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(expectedColumnCount(true));

    await page.setViewportSize({ width: 1680, height: 900 });
    expect(await catalog.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(expectedColumnCount(true));

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
    expect(wideGeometry.columns).toBe(expectedColumnCount(true));
    expect(wideGeometry.screenWidth).toBeGreaterThanOrEqual(1500);
    expect(wideGeometry.cardWidths).toHaveLength(Math.min(3, initialCatalogRowCount));
    expect(wideGeometry.cardWidths.every((width) => width >= 390)).toBe(true);
    expect(wideGeometry.overflow).toBe(0);

    const candidateQueries = await catalog.locator(".sqc-app-row").evaluateAll((rows) => rows.map((row) => {
      const title = row.querySelector(".sqc-row-title-line strong")?.textContent?.trim() ?? "";
      const byline = row.querySelector(".sqc-community-row-creator")?.textContent?.trim() ?? "";
      return `${title} ${byline}`.trim();
    }).filter(Boolean));
    const search = page.getByLabel("Search Community Side Quests");
    let foundSingleResult = await catalog.locator(".sqc-app-row").count() === 1;
    for (const query of candidateQueries) {
      if (foundSingleResult) break;
      await search.fill(query);
      foundSingleResult = await catalog.locator(".sqc-app-row").count() === 1;
    }
    if (foundSingleResult) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(catalog).toHaveClass(/\bsingle-result\b/);
      await expect(catalogSummary).toBeVisible();
      await expect(catalogSummary).toContainText("Across the full public catalog");
      await expect(catalogSummary.locator("strong")).toHaveCount(5);
      const sparseGeometry = await page.locator(".sqc-community-results-layout.single-result").evaluate((element) => {
        const card = element.querySelector<HTMLElement>(".sqc-app-row")?.getBoundingClientRect();
        const summary = element.querySelector<HTMLElement>(".sqc-community-catalog-summary")?.getBoundingClientRect();
        return {
          columns: getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
          cardWidth: card?.width ?? 0,
          summaryWidth: summary?.width ?? 0,
          gap: summary && card ? summary.left - card.right : 0,
        };
      });
      expect(sparseGeometry.columns).toBe(2);
      expect(sparseGeometry.cardWidth).toBe(760);
      expect(sparseGeometry.summaryWidth).toBeGreaterThanOrEqual(240);
      expect(sparseGeometry.gap).toBeGreaterThanOrEqual(14);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    }
    await search.fill("");

    if (creatorShortcutCount) {
      const firstCreatorShortcut = creatorDirectory.getByRole("link").first();
      await expect(firstCreatorShortcut).toHaveAttribute("href", /\/community-side-quests\?creator=.+/);
      await firstCreatorShortcut.focus();
      await expect(firstCreatorShortcut).toBeFocused();
      await expect(firstCreatorShortcut).toHaveCSS("outline-style", "solid");
      await firstCreatorShortcut.click();
      await expect(page).toHaveURL(/\/community-side-quests\?creator=.+/);
      await expect(page.getByRole("complementary", { name: "Creator shelf" })).toBeVisible();
      await expect(page.getByRole("complementary", { name: "Creator shortcuts" })).toHaveCount(0);
    }
  } else {
    await expect(page.locator(".sqc-community-catalog-section .sqc-empty-panel.standalone")).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("desktop Community creator bylines open one focused creator workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/community-side-quests");

  const creatorLink = page.locator(".sqc-community-row-creator").first();
  expect(await creatorLink.count()).toBeGreaterThan(0);
  await expect(creatorLink).toBeVisible();
  await expect(creatorLink).toHaveAttribute("href", /\/community-side-quests\?creator=.+/);
  await creatorLink.focus();
  await expect(creatorLink).toBeFocused();
  await expect(creatorLink).toHaveCSS("outline-style", "solid");
  await creatorLink.click();
  await expect(page).toHaveURL(/\/community-side-quests\?creator=.+/);
  const shelf = page.getByRole("complementary", { name: "Creator shelf" });
  await expect(shelf).toBeVisible();
  await expect(shelf.getByRole("link", { name: "All creators" })).toHaveAttribute("href", "/community-side-quests");
  await expect(page.getByRole("heading", { name: "Community Side Quests", level: 2 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("desktop Community discovery keeps search and sort context through detail navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/community-side-quests");

  const initialResult = page.locator(".sqc-community-catalog-section .sqc-app-row").first();
  await expect(initialResult).toBeVisible();
  const query = (await initialResult.locator(".sqc-row-title-line strong").innerText()).trim();
  const expectedReturnHref = `/community-side-quests?${new URLSearchParams({ q: query, sort: "liked" }).toString()}`;

  const search = page.getByLabel("Search Community Side Quests");
  await search.fill(query);
  await page.getByLabel("Sort Community Side Quests").selectOption("liked");
  await expect(page).toHaveURL(new RegExp(`${expectedReturnHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));

  const result = page.locator(".sqc-community-catalog-section .sqc-app-row").first();
  await expect(result).toBeVisible();
  await result.getByRole("link", { name: /^Open / }).click();
  await expect(page).toHaveURL(/\/challenges\/community\/.+\?returnTo=/);

  const returnLink = page.getByRole("link", { name: "Back to filtered results" });
  await expect(returnLink).toHaveAttribute("href", expectedReturnHref);
  await returnLink.click();

  await expect(page).toHaveURL(new RegExp(`${expectedReturnHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  await expect(search).toHaveValue(query);
  await expect(page.getByLabel("Sort Community Side Quests")).toHaveValue("liked");
  await expect(result).toBeVisible();

  const creatorShortcut = page.getByRole("complementary", { name: "Creator shortcuts" }).getByRole("link").first();
  await creatorShortcut.click();
  await expect(page).toHaveURL(/\/community-side-quests\?creator=[^&]+(?:#.+)?$/);
  await expect(page.getByLabel("Search Community Side Quests")).toHaveValue("");
  await expect(page.getByLabel("Sort Community Side Quests")).toHaveValue("popular");
  await expect(page.getByRole("complementary", { name: "Creator shelf" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("official Solo detail switches from the mobile flow to one desktop action workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/challenges/knights-before-coffee");

  const detail = page.locator(".sqc-official-solo-detail-screen");
  const commandRail = detail.locator(":scope > .sqc-quest-command-rail");
  const shareActions = commandRail.locator(":scope > .sqc-community-share-actions");
  const briefing = detail.locator(".sqc-desktop-quest-briefing");
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(briefing).toBeHidden();
  await expect(detail.locator(".sqc-proof-action-card").getByRole("link", { name: "Sign in", exact: true })).toHaveCount(1);
  await expect(shareActions).toHaveCSS("grid-template-columns", /\d+px/);
  const mobileShareColumnCount = await shareActions.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(mobileShareColumnCount).toBe(1);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(briefing).toBeVisible();
  await expect(briefing.getByText("Difficulty", { exact: true })).toBeVisible();
  await expect(briefing.getByText("Easy", { exact: true })).toBeVisible();
  await expect(briefing.getByText("Conditions", { exact: true })).toBeVisible();
  await expect(briefing.getByText("4", { exact: true })).toBeVisible();
  await expect(briefing.getByText("Proof", { exact: true })).toBeVisible();
  await expect(briefing.getByText("Automatic", { exact: true })).toBeVisible();
  await expect(detail.locator(".sqc-proof-action-card").getByRole("link", { name: "Sign in", exact: true })).toHaveCount(1);

  const geometry = await detail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const commandRail = element.querySelector(":scope > .sqc-quest-command-rail");
    const share = commandRail?.querySelector(":scope > .sqc-community-share-actions") ?? null;
    const shareButtons = share ? Array.from(share.querySelectorAll("button")) : [];
    return {
      width: Math.round(rect.width),
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      commandRailPosition: commandRail ? getComputedStyle(commandRail).position : null,
      shareColumns: share ? getComputedStyle(share).gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      shareButtonWidths: shareButtons.map((button) => Math.round(button.getBoundingClientRect().width)),
      shareButtonHeights: shareButtons.map((button) => Math.round(button.getBoundingClientRect().height)),
      briefingColumns: getComputedStyle(element.querySelector(".sqc-desktop-quest-briefing")!).gridTemplateColumns.split(" ").filter(Boolean).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.width).toBeGreaterThan(1000);
  expect(geometry.columns).toBe(2);
  expect(geometry.commandRailPosition).toBe("sticky");
  expect(geometry.shareColumns).toBe(2);
  expect(geometry.shareButtonWidths).toHaveLength(2);
  expect(Math.abs(geometry.shareButtonWidths[0] - geometry.shareButtonWidths[1])).toBeLessThanOrEqual(2);
  expect(geometry.shareButtonHeights.every((height) => height >= 46)).toBe(true);
  expect(geometry.briefingColumns).toBe(3);
  expect(geometry.overflow).toBe(0);
});

test("Community Solo detail switches from the mobile flow to one desktop task workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/challenges/community/seed-castle-never-heard-of-it-05-1");

  const detail = page.locator(".sqc-community-detail-screen");
  const readingPanel = detail.locator(".sqc-community-reading-panel");
  const share = page.getByRole("button", { name: "Share Community Solo Side Quest" });
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(share).toHaveCount(1);
  await expect(readingPanel).toHaveCSS("display", "contents");

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.getByLabel("Close screen")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();
  await expect(share).toHaveCount(1);

  const geometry = await detail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const taskRail = element.querySelector(".sqc-community-task-rail");
    const readingPanel = element.querySelector<HTMLElement>(".sqc-community-reading-panel");
    const readingSections = readingPanel ? Array.from(readingPanel.children) as HTMLElement[] : [];
    const readingRect = readingPanel?.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      taskRailPosition: taskRail ? getComputedStyle(taskRail).position : null,
      readingDisplay: readingPanel ? getComputedStyle(readingPanel).display : null,
      readingBorderStyle: readingPanel ? getComputedStyle(readingPanel).borderTopStyle : null,
      readingSectionCount: readingSections.length,
      readingSectionsInsidePanel: readingRect ? readingSections.every((section) => {
        const sectionRect = section.getBoundingClientRect();
        return sectionRect.left >= readingRect.left && sectionRect.right <= readingRect.right;
      }) : false,
      readingDividerStyle: readingSections[1] ? getComputedStyle(readingSections[1]).borderTopStyle : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.width).toBeGreaterThan(1000);
  expect(geometry.columns).toBe(2);
  expect(geometry.taskRailPosition).toBe("sticky");
  expect(geometry.readingDisplay).toBe("grid");
  expect(geometry.readingBorderStyle).toBe("solid");
  expect(geometry.readingSectionCount).toBe(2);
  expect(geometry.readingSectionsInsidePanel).toBe(true);
  expect(geometry.readingDividerStyle).toBe("solid");
  expect(geometry.overflow).toBe(0);
});

test("Custom library switches from the mobile flow to one desktop workshop", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await expectHealthyNavigation(page, "/custom-side-quests");

  const intro = page.getByRole("heading", { name: "Your Side Quest workshop, with room to think." });
  const accountBridge = page.getByRole("complementary", { name: "Custom Side Quest account sync" });
  const syncLink = accountBridge.getByRole("link", { name: "Sign in to sync my workshop" });
  await expect(intro).toBeHidden();
  await expect(accountBridge).toBeHidden();
  await expect(page.getByLabel("Close screen")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  await expect(page.getByRole("link", { name: "+ Create" })).toHaveCount(1);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(intro).toBeVisible();
  await expect(accountBridge).toBeVisible();
  await expect(accountBridge.getByText("Draft here. Play anywhere.", { exact: true })).toBeVisible();
  await expect(syncLink).toHaveAttribute("href", "/sign-in?redirect_url=%2Fcustom-side-quests");
  await syncLink.focus();
  await expect(syncLink).toBeFocused();
  await expect(syncLink).toHaveCSS("outline-style", "solid");
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

test("desktop Custom builder steps move focus through the long workbench without leaking into mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/create-custom-side-quest");

  const steps = page.getByRole("navigation", { name: "Custom Side Quest builder steps" });
  await expect(steps).toBeVisible();
  await expect(steps.getByRole("button", { name: /Shape the rules/ })).toHaveAttribute("aria-current", "step");

  for (const [label, targetId] of [
    ["Shape the rules", "custom-builder-conditions"],
    ["Name the quest", "custom-builder-identity"],
    ["Save & continue", "custom-builder-save"],
  ] as const) {
    const step = steps.getByRole("button", { name: new RegExp(label) });
    await step.click();
    await expect(page.locator(`#${targetId}`)).toBeFocused();
    await expect(step).toHaveAttribute("aria-current", "step");
    await expect(steps.locator('[aria-current="step"]')).toHaveCount(1);
  }

  await page.evaluate(() => window.scrollTo(0, 520));
  const stickyRail = await page.locator(".sqc-custom-builder-setup").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, viewportBottom: window.innerHeight };
  });
  expect(stickyRail.top).toBeGreaterThanOrEqual(16);
  expect(stickyRail.bottom).toBeLessThanOrEqual(stickyRail.viewportBottom - 16);

  await page.setViewportSize({ width: 1440, height: 768 });
  await page.evaluate(() => window.scrollTo(0, 520));
  const shortViewportRail = await page.locator(".sqc-custom-builder-setup").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportBottom: window.innerHeight,
      overflowY: style.overflowY,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    };
  });
  expect(shortViewportRail.top).toBeGreaterThanOrEqual(96);
  expect(shortViewportRail.bottom).toBeLessThanOrEqual(shortViewportRail.viewportBottom - 16);
  expect(shortViewportRail.overflowY).toBe("auto");
  expect(shortViewportRail.scrollHeight).toBeGreaterThan(shortViewportRail.clientHeight);

  await page.setViewportSize({ width: 1179, height: 900 });
  await expect(steps).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
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

test("desktop Support overview clears the complete sticky account workspace", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await expectHealthyNavigation(page, "/support");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const geometry = await page.evaluate(() => {
      const workspace = document.querySelector<HTMLElement>(".sqc-desktop-route-only");
      const overview = document.querySelector<HTMLElement>(".sqc-support-overview");
      if (!workspace || !overview) return null;
      const workspaceRect = workspace.getBoundingClientRect();
      const overviewRect = overview.getBoundingClientRect();
      return {
        workspaceBottom: workspaceRect.bottom,
        overviewTop: overviewRect.top,
        workspaceBackground: getComputedStyle(workspace).backgroundImage,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry!.workspaceBackground).not.toBe("none");
    expect(geometry!.overviewTop).toBeGreaterThanOrEqual(geometry!.workspaceBottom + 24);
    expect(geometry!.overflow).toBe(0);
  }
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

test("Privacy Policy keeps desktop navigation at 1180px without changing the mobile composition below it", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 });
  await expectHealthyNavigation(page, "/privacy");

  const shortcuts = page.getByRole("navigation", { name: "Desktop shortcuts" });
  await expect(shortcuts).toBeVisible();
  const explore = page.locator(".sqc-desktop-menu");
  await explore.locator("summary").click();
  await expect(explore.getByRole("link", { name: "Privacy Policy", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/sign-in?redirect_url=%2Fprivacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy", exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1179, height: 900 });
  await expect(shortcuts).toBeHidden();
  await expect(page.getByRole("link", { name: "← Side Quest Chess" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Privacy Policy", exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("privacy policy is public, dedicated, and links to privacy support", async ({ page }) => {
  await expectHealthyNavigation(page, "/privacy");

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Information Side Quest Chess handles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chess game verification" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact privacy support" })).toHaveAttribute(
    "href",
    "mailto:sam@crowdler.com?subject=Side%20Quest%20Chess%20privacy%20request",
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

test("wide Multiplayer detail expands its tournament canvas without changing the established breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1679, height: 900 });
  await expectHealthyNavigation(page, "/multiplayer");
  const detailHref = await page.locator('a[href^="/groupquests/"]').first().getAttribute("href");
  expect(detailHref).toBeTruthy();
  await expectHealthyNavigation(page, detailHref!);
  await expect(page.locator(".sqc-multiplayer-public-detail-screen")).toBeVisible();
  await page.setViewportSize({ width: 1679, height: 900 });

  const geometry = async () => page.evaluate(() => {
    const screen = document.querySelector(".sqc-screen")?.getBoundingClientRect();
    const rail = document.querySelector(".sqc-multiplayer-command-rail")?.getBoundingClientRect();
    const questList = document.querySelector(".sqc-multiplayer-quest-list")?.getBoundingClientRect();
    return {
      screenWidth: Math.round(screen?.width ?? 0),
      railWidth: Math.round(rail?.width ?? 0),
      questListWidth: Math.round(questList?.width ?? 0),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(await geometry()).toMatchObject({ screenWidth: 1280, railWidth: 360, questListWidth: 896, overflow: 0 });

  await page.setViewportSize({ width: 1680, height: 900 });
  expect(await geometry()).toMatchObject({ screenWidth: 1584, railWidth: 440, questListWidth: 1120, overflow: 0 });

  await page.setViewportSize({ width: 1920, height: 1080 });
  expect(await geometry()).toMatchObject({ screenWidth: 1600, railWidth: 440, questListWidth: 1136, overflow: 0 });
  const action = page.locator(".sqc-multiplayer-command-rail").getByRole("link").first();
  await action.focus();
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS("outline-style", "solid");
});

test("wide public proof expands the evidence canvas while preserving the mobile receipt flow", async ({ page }) => {
  await page.setViewportSize({ width: 1679, height: 900 });
  await expectHealthyNavigation(page, "/proof/preview-back-rank-goblin");
  await expect(page.getByRole("heading", { name: "Back Rank Goblin" })).toBeVisible();

  const geometry = async () => page.evaluate(() => {
    const screen = document.querySelector(".sqc-screen")?.getBoundingClientRect();
    const workspace = document.querySelector(".sqc-public-proof-workspace");
    const receipt = document.querySelector(".sqc-public-proof-scroll-card")?.getBoundingClientRect();
    const rail = document.querySelector(".sqc-public-proof-command-rail")?.getBoundingClientRect();
    return {
      screenWidth: Math.round(screen?.width ?? 0),
      columns: workspace ? getComputedStyle(workspace).gridTemplateColumns.split(" ").map((value) => Math.round(Number.parseFloat(value))) : [],
      receiptWidth: Math.round(receipt?.width ?? 0),
      railWidth: Math.round(rail?.width ?? 0),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(await geometry()).toMatchObject({ screenWidth: 1240, columns: [820, 394], receiptWidth: 820, railWidth: 394, overflow: 0 });

  await page.setViewportSize({ width: 1680, height: 900 });
  expect(await geometry()).toMatchObject({ screenWidth: 1584, columns: [1132, 420], receiptWidth: 1132, railWidth: 420, overflow: 0 });

  await page.setViewportSize({ width: 1920, height: 1080 });
  expect(await geometry()).toMatchObject({ screenWidth: 1600, columns: [1148, 420], receiptWidth: 1148, railWidth: 420, overflow: 0 });
  const share = page.getByRole("button", { name: "Share public proof link" });
  await share.focus();
  await expect(share).toBeFocused();
  await expect(share).toHaveCSS("outline-style", "solid");

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await geometry()).toMatchObject({ screenWidth: 370, columns: [370], receiptWidth: 370, railWidth: 370, overflow: 0 });
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
