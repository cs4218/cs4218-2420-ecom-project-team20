import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/about", { timeout: 60000 });
});

test.describe("About page UI tests", () => {
  test("should render the About page with the correct title", async ({ page }) => {
    const layoutTitle = await page.title();
    expect(layoutTitle).toContain("About us - Ecommerce app");
  });

  test("should display the About page image", async ({ page }) => {
    const aboutImage = page.locator("img[alt='contactus']");
    await expect(aboutImage).toBeVisible();
    await expect(aboutImage).toHaveAttribute("src", "/images/about.jpeg");
  });

  test("should display the About page content", async ({ page }) => {
    const content = page.locator(".text-justify");
    await expect(content).toBeVisible();
    await expect(content).toContainText("Buy something today!");
  });

  test("should render the page layout correctly", async ({ page }) => {
    const row = page.locator(".row.contactus");
    const imageColumn = page.locator(".col-md-6");
    const textColumn = page.locator(".col-md-4");

    await expect(row).toBeVisible();
    await expect(imageColumn).toBeVisible();
    await expect(textColumn).toBeVisible();
  });

  test("should pass basic accessibility checks", async ({ page }) => {
    const violations = await page.accessibility.snapshot();
    expect(violations).toBeTruthy();
  });

  test("should render properly on mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const content = page.locator(".text-justify");
    await expect(content).toBeVisible();
  });
});
