import { expect, test } from "@playwright/test";

test("desktop Official Solo search filters the canonical catalog and recovers from zero matches", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });

  const search = page.getByRole("search");
  const input = search.getByRole("searchbox", { name: "Find an official Side Quest" });
  await expect(search).toBeVisible();
  await input.fill("knights coffee");
  await search.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/\/side-quests\?q=knights\+coffee$/);
  await expect(search.getByRole("searchbox")).toHaveValue("knights coffee");
  await expect(page.getByText("1 of 13 official", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Knights Before Coffee" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open No Castle Club" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Easy", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await input.fill("dragon");
  await search.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: "No official Side Quests match “dragon”." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Jump to quest difficulty" })).toHaveCount(0);
  await page.getByRole("link", { name: "Clear search" }).first().click();
  await expect(page).toHaveURL(/\/side-quests$/);
  await expect(page.getByText("13 official", { exact: true })).toBeVisible();
});

test("Official Solo search respects the desktop boundary and leaves the default mobile catalog unchanged", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  await page.goto("/side-quests", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("search")).toBeHidden();
  await expect(page.locator(".sqc-app-row")).toHaveCount(13);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.locator(".sqc-app-row")).toHaveCount(13);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("search")).toBeHidden();
  await expect(page.locator(".sqc-app-row")).toHaveCount(13);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
