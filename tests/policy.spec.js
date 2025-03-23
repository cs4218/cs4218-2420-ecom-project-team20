import { test, expect } from "@playwright/test";

test.describe("Privacy Policy page UI tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/policy");
  });

  test("should render the Privacy Policy page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle("Privacy Policy");
  });

  test("should display the contact image with correct src and alt", async ({ page }) => {
    const image = page.locator('img[alt="contactus"]');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  test("should display the Privacy Policy content", async ({ page }) => {
    const content = page.locator(".col-md-4 p");
    await expect(content).toBeVisible();
    await expect(content).toContainText(
      "At Virtual Vault, we respect your privacy and are committed to protecting it."
    );
  });

  test("should render the page layout correctly", async ({ page }) => {
    const row = page.locator(".row.contactus");
    const colLeft = page.locator(".col-md-6");
    const colRight = page.locator(".col-md-4");

    await expect(row).toBeVisible();
    await expect(colLeft).toBeVisible();
    await expect(colRight).toBeVisible();

    const leftBox = await colLeft.boundingBox();
    const rightBox = await colRight.boundingBox();

    expect(leftBox.width).toBeGreaterThan(0);
    expect(rightBox.width).toBeGreaterThan(0);
  });

  test("should render properly on mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size

    const row = page.locator(".row.contactus");
    await expect(row).toBeVisible();

    const cols = page.locator(".row.contactus > div");
    expect(await cols.count()).toBe(2);

    const col1 = cols.nth(0);
    const col2 = cols.nth(1);

    const col1Box = await col1.boundingBox();
    const col2Box = await col2.boundingBox();

    expect(col1Box.width).toBeLessThan(400); // Ensure columns stack in mobile view
    expect(col2Box.width).toBeLessThan(400);
  });
});
