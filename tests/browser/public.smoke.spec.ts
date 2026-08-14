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
});

test("desktop Trophy Cabinet difficulty directory filters the shared coat collection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectHealthyNavigation(page, "/trophy-cabinet");

  const directory = page.getByRole("complementary", { name: "Filter coats by difficulty" });
  const grid = page.getByLabel("Official Solo Side Quest coat grid");
  await expect(directory).toBeVisible();
  await expect(grid.getByRole("link")).toHaveCount(13);

  await directory.getByRole("button", { name: "Hard 3" }).click();
  await expect(directory.getByRole("button", { name: "Hard 3" })).toHaveAttribute("aria-pressed", "true");
  await expect(grid.getByRole("link")).toHaveCount(3);
  await expect(grid.getByText("No Castle Club", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(directory).toBeHidden();
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

  expect(geometry.every(({ minHeight }) => minHeight === 238)).toBe(true);
  expect(geometry.every(({ objectiveClientHeight, objectiveScrollHeight }) => objectiveScrollHeight <= objectiveClientHeight + 1)).toBe(true);
  expect(geometry.every(({ noteClientHeight, noteScrollHeight }) => noteScrollHeight <= noteClientHeight + 1)).toBe(true);
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
  if (await firstRow.count()) {
    await expect(firstRow.locator(".sqc-community-row-mobile-meta")).toBeVisible();
    await expect(firstRow.locator(".sqc-community-row-details")).toBeHidden();
  }

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
      expect(await catalog.locator(".sqc-app-row").evaluate((element) => element.getBoundingClientRect().width)).toBe(760);
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
