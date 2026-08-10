import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
}

test("desktop Home presents the Side Quest Chess coming-soon design", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const response = await page.goto("/", { waitUntil: "networkidle" });

  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { name: "Every game deserves a side quest." })).toBeVisible();
  await expect(page.getByText("A new kind of chess challenge", { exact: true })).toBeVisible();
  await expect(page.getByText("The first quests are being prepared", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Side Quest Chess coat of arms" })).toBeVisible();
  await expect(page.getByText("Coming soon", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  await expect(page.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support");
  await expect(page.getByText(/Sign in|Create account/)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("coming-soon Home remains balanced and complete on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Every game deserves a side quest." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Side Quest Chess coat of arms" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Legal and support" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Guest menu" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open main menu" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("coming-soon Home preserves accessible keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const home = page.getByRole("link", { name: "Side Quest Chess home" });
  await home.focus();
  await expect(home).toBeFocused();
  await expect(home).toHaveCSS("outline-style", "solid");
});
