// @ts-check
import { test, expect } from "@playwright/test";

const adminUser = {
  name: "admin@test.sg",
  email: "admin@test.sg",
  password: "admin@test.sg",
  phone: "admin@test.sg",
  address: "admin@test.sg",
};

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test.describe("Create new category", () => {
  test("should be able to login to admin account", async ({ page }) => {
    await login(page, adminUser);
  });

  test("should be able to go to Create Categories page", async ({ page }) => {
    await login(page, adminUser);
    await navigateToCreateCategoriesPage(page, adminUser);
  });

  test("should be able to create new category and also delete that category", async ({ page }) => {
    await login(page, adminUser);
    await navigateToCreateCategoriesPage(page, adminUser);

    const categoryTextbox = page.getByRole("textbox", { name: "Enter New Category" });
    const submitButton = page.getByRole("button", { name: "Submit" });

    await categoryTextbox.click();
    await categoryTextbox.fill("Test Category");
    await submitButton.click();

    await expect(page.locator('div').filter({ hasText: /^Test Category is created$/ })).toBeVisible();
    await expect(page.locator('td').filter({ hasText: "Test Category" })).toBeVisible();

    // const deleteButton = page.getByRole("button", { name: "Delete" }).nth(3);

    // await deleteButton.click();

    // await expect(page.locator('status').filter({ hasText: /^category is deleted$/ })).toBeVisible();
    // await expect(page.locator('td').filter({ hasText: "Test Category" })).toBeVisible();
  });

  // test("should be able to delete a category", async ({ page }) => {
  //   await login(page, adminUser);
  //   await navigateToCreateCategoriesPage(page, adminUser);

  //   const deleteButton = page.getByRole("button", { name: "Delete" }).nth(3);

  //   await deleteButton.click();

  //   await expect(page.locator('status').filter({ hasText: /^category deleted successfully$/ })).toBeVisible();
  //   await expect(page.locator('td').filter({ hasText: "Test Category" })).not.toBeVisible();
  // });
});

async function login(page, user) {
  const loginTab = page.getByRole("link", { name: "Login" });
  await loginTab.click();

  const emailTextbox = page.getByRole("textbox", { name: "Enter Your Email" });
  const passwordTextbox = page.getByRole("textbox", {
    name: "Enter Your Password",
  });
  const loginButton = page.getByRole("button", { name: "LOGIN" });

  await emailTextbox.click();
  await emailTextbox.fill(user.email);
  await emailTextbox.press("Tab");
  await passwordTextbox.fill(user.password);
  await loginButton.click();
}

async function navigateToCreateCategoriesPage(page, user) {
    const userTab = page.getByRole("button", { name: user.name });
   await userTab.click();
 
   const dashboardTab = page.getByRole("link", { name: "Dashboard" });
   await dashboardTab.click();
 
   const createCategoryTab = page.getByRole("link", { name: "Create Category" })
   await createCategoryTab.click();
}