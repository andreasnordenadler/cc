import { expect, test } from "@playwright/test";

test("desktop Support keeps direct task wayfinding usable across the desktop canvas", async ({ page }) => {
  for (const { width, height } of [
    { width: 1180, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/support", { waitUntil: "domcontentloaded" });

    const tasks = page.getByRole("navigation", { name: "Support tasks" });
    await expect(page.getByRole("heading", { level: 1, name: "How can we help?" })).toBeVisible();
    await expect(tasks).toBeVisible();
    await expect(tasks.getByRole("link")).toHaveCount(4);
    await expect(tasks.getByRole("link", { name: "Report a problem" })).toHaveAttribute("href", "#support-report");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  }
});

test("desktop Support task links reveal their target below persistent navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/support", { waitUntil: "domcontentloaded" });

  const reportLink = page.getByRole("navigation", { name: "Support tasks" }).getByRole("link", { name: "Report a problem" });
  await reportLink.focus();
  await expect(reportLink).toBeFocused();
  await expect(reportLink).toHaveCSS("outline-style", "solid");
  await reportLink.press("Enter");
  await expect(page).toHaveURL(/#support-report$/);
  await expect(page.getByRole("region", { name: "Report a problem" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".sqc-desktop-route-only");
    const target = document.querySelector<HTMLElement>("#support-report");
    return Boolean(header && target && target.getBoundingClientRect().top >= header.getBoundingClientRect().bottom);
  })).toBe(true);
});

test("mobile Support retains the Android-derived stack without desktop task chrome", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/support", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1, name: "How can we help?" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Support tasks" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Quick answers" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
