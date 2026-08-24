import { expect, test, type Page } from "@playwright/test";

function expectPreviewBaseURL(baseURL: string | undefined) {
  expect(baseURL, "the browser regression requires an explicit preview base URL").toBeTruthy();
  expect(new URL(baseURL!).origin, "run this branch regression against its preview, never production").not.toBe("https://sidequestchess.com");
}

async function measureDeterministicTableSlot(page: Page) {
  return page.locator('[aria-label="Community Multiplayer Side Quests"]').evaluate((section) => {
    let catalog = section.querySelector(".sqc-catalog");
    if (!catalog) {
      catalog = document.createElement("div");
      catalog.className = "sqc-catalog";
      const browsePanel = section.querySelector(".sqc-community-browse-panel");
      if (browsePanel) browsePanel.after(catalog);
      else section.append(catalog);
    }
    const table = Object.assign(document.createElement("div"), {
      className: "sqc-app-row",
      textContent: "Layout fixture",
    });
    catalog.replaceChildren(table);

    const invite = document.querySelector<HTMLElement>('[aria-label="Join private Multiplayer Side Quest"]');
    if (!invite) throw new Error("Invite join region is missing");
    const tableBox = table.getBoundingClientRect();
    const inviteBox = invite.getBoundingClientRect();
    return {
      table: { y: tableBox.y, height: tableBox.height },
      invite: { y: inviteBox.y, height: inviteBox.height },
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

test("desktop Community Multiplayer keeps the table slot above the fold beside invite join", async ({ page, baseURL }) => {
  expectPreviewBaseURL(baseURL);

  for (const { width, height } of [
    { width: 1180, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/multiplayer-side-quests?tab=community", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("region", { name: "Join private Multiplayer Side Quest" })).toBeVisible();
    const geometry = await measureDeterministicTableSlot(page);

    expect(geometry.table.y, `${width}px: the table slot should begin high enough to compare without scrolling`).toBeLessThanOrEqual(630);
    expect(geometry.table.y + Math.min(geometry.table.height, 220), `${width}px: a useful decision-ready portion should remain above the 900px fold`).toBeLessThanOrEqual(900);
    expect(Math.abs(geometry.table.y - geometry.invite.y), `${width}px: browse and invite actions should read as one desktop workspace`).toBeLessThanOrEqual(170);
    expect(geometry.overflow, `${width}px: the workspace must not overflow horizontally`).toBe(0);
  }
});

test("mobile Community Multiplayer retains the established stacked app flow", async ({ page, baseURL }) => {
  expectPreviewBaseURL(baseURL);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/multiplayer-side-quests?tab=community", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".sqc-desktop-multiplayer-intro")).toBeHidden();
  await expect(page.getByRole("region", { name: "Join private Multiplayer Side Quest" })).toBeVisible();
  const geometry = await measureDeterministicTableSlot(page);

  expect(geometry.invite.y, "mobile keeps invite join after the public table list").toBeGreaterThan(geometry.table.y);
  expect(geometry.overflow, "mobile must not overflow horizontally").toBe(0);
});
