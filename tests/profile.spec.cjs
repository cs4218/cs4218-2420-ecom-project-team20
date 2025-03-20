// @ts-check
import { test, expect } from '@playwright/test';

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  password: "johnsmithpw",
  phone: "0123456789",
  address: "10 Apple Street",
};
const newUser = {
  name: "Johnny Smith",
  email: "johnsmith@email.com",
  password: "johnnysmithpw",
  phone: "9876543210",
  address: "10 Pear Street",
};

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test.describe("Update profile details", () => {
  test("should be able to login to existing account", async ({ page }) => {
    await login(page, testUser);
  });

  test("should be able to navigate to Profile", async ({ page }) => {
    await login(page, testUser);
    await navigateToProfile(page, testUser);
  });

  test("should be able to enter new details", async ({ page }) => {
    await login(page, testUser);
    await navigateToProfile(page, testUser);

    const nameTextbox = page.getByRole("textbox", { name: "Enter Your Name" });
    const passwordTextbox = page.getByRole("textbox", { name: "Enter Your Password" });
    const phoneTextbox = page.getByRole("textbox", { name: "Enter Your Phone" });
    const addressTextbox = page.getByRole("textbox", { name: "Enter Your Address" });

    await nameTextbox.fill("test");
    await passwordTextbox.fill("test");
    await phoneTextbox.fill("test");
    await addressTextbox.fill("test");
  });

  test("should be able to edit profile", async ({ page }) => {
    await login(page, testUser);
    await navigateToProfile(page, testUser);

    await editProfile(page, newUser);
    await expect(page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(1)).toBeVisible();

    // change back to original testUser details
    await editProfile(page, testUser);
  });

  test("should be able to login with new details", async ({ page }) => {
    await login(page, testUser);
    await navigateToProfile(page, testUser);

    await editProfile(page, newUser);
    await expect(page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(1)).toBeVisible();

    const userTab = page.getByRole("button", { name: newUser.name });
    await userTab.click();

    const logoutTab = page.getByRole("link", { name: "Logout" });
    await logoutTab.click();

    await login(page, newUser);
    await navigateToProfile(page, newUser);

    await editProfile(page, testUser);
    await expect(page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(1)).toBeVisible();
  });
});

async function login(page, user) {
  const loginTab = page.getByRole('link', { name: 'Login' });
  await loginTab.click();

  const emailTextbox = page.getByRole('textbox', { name: 'Enter Your Email' });
  await emailTextbox.click();
  await emailTextbox.fill(user.email);

  const passwordTextbox = page.getByRole('textbox', { name: 'Enter Your Password' });
  await passwordTextbox.click();
  await passwordTextbox.fill(user.password);

  const loginButton = page.getByRole('button', { name: 'LOGIN' });
  await loginButton.click();
  await expect(page.getByText('🙏Logged in successfully')).toBeVisible();
}

async function navigateToProfile(page, user) {
  await page.goto("http://localhost:3000/dashboard/user/profile");

  const heading = page.getByRole("heading", { name: "USER PROFILE" });
  await expect(heading).toBeVisible();
}

async function editProfile(page, newUser) {
  const nameTextbox = page.getByRole("textbox", { name: "Enter Your Name" });
  const passwordTextbox = page.getByRole("textbox", { name: "Enter Your Password" });
  const phoneTextbox = page.getByRole("textbox", { name: "Enter Your Phone" });
  const addressTextbox = page.getByRole("textbox", { name: "Enter Your Address" });
  const updateButton = page.getByRole('button', { name: 'UPDATE' });

  await nameTextbox.fill(newUser.name);
  await passwordTextbox.fill(newUser.password);
  await phoneTextbox.fill(newUser.phone);
  await addressTextbox.fill(newUser.address);
  await updateButton.click();
}
