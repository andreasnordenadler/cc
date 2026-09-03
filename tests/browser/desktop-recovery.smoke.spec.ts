import { expect, test } from "@playwright/test";

const missingPath = "/desktop-recovery-browser-proof-missing";

test("not-found switches from the mobile surface to a desktop recovery workspace at 1180px", async ({ page }) => {
  await page.setViewportSize({ width: 1179, height: 900 });
  const response = await page.goto(missingPath, { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);

  await expect(page.locator(".sqc-recovery-mobile")).toBeVisible();
  await expect(page.locator(".sqc-desktop-recovery")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Guest menu" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(page.locator(".sqc-recovery-mobile")).toBeHidden();
  await expect(page.locator(".sqc-desktop-recovery")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Guest menu" })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Desktop shortcuts" })).toBeVisible();

  const desktopGeometry = await page.locator(".sqc-desktop-recovery").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const routes = element.querySelector<HTMLElement>(".sqc-desktop-recovery-routes");
    if (!routes) throw new Error("Expected recovery routes");
    return {
      width: Math.round(rect.width),
      columns: getComputedStyle(routes).gridTemplateColumns.split(" ").filter(Boolean).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(desktopGeometry).toEqual({ width: 1124, columns: 2, overflow: 0 });

  await page.setViewportSize({ width: 1920, height: 1080 });
  const wideGeometry = await page.locator(".sqc-desktop-recovery").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const firstRoute = element.querySelector<HTMLElement>(".sqc-desktop-recovery-routes a");
    if (!firstRoute) throw new Error("Expected recovery route");
    const routeRect = firstRoute.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      routeWidth: Math.round(routeRect.width),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(wideGeometry.width).toBe(1320);
  expect(wideGeometry.routeWidth).toBeGreaterThan(300);
  expect(wideGeometry.overflow).toBe(0);

  const routes = page.getByRole("navigation", { name: "Recovery destinations" });
  await expect(routes.getByRole("link", { name: /Browse Solo/ })).toHaveAttribute("href", "/side-quests");
  await expect(routes.getByRole("link", { name: /Browse Community/ })).toHaveAttribute("href", "/community-side-quests");
  await expect(routes.getByRole("link", { name: /Browse Multiplayer/ })).toHaveAttribute("href", "/multiplayer");
  await expect(routes.getByRole("link", { name: /Get help/ })).toHaveAttribute("href", "/support");

  await routes.getByRole("link", { name: /Browse Solo/ }).focus();
  await expect(routes.getByRole("link", { name: /Browse Solo/ })).toBeFocused();
});
