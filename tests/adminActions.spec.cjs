// @ts-check
import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper";
import assert from "assert";

let adminName;
let adminEmail;
let adminPassword;
let adminPhone;
let adminUser;

test.beforeEach(async () => {
  const uri = await fs.readFile(".mongo-uri", "utf-8");

  await mongoose.connect(uri);

  // Create Admin User
  adminName = "JRM-NUS";
  adminEmail = "JRAdmin@test.sg";
  adminPassword = "JRAdmin@test.sg";
  adminPhone = "12345678";
  const hashedPassword = await hashPassword(adminPassword);
  adminUser = {
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    phone: adminPhone,
    address: adminEmail,
    answer: adminEmail,
    role: 1,
  };

  const newAdminUser = new userModel(adminUser);
  await newAdminUser.save();
});

test.afterEach(async () => {
  await productModel.deleteMany({ name: "Crucible: the Novel" });
  await categoryModel.deleteMany({ name: "Test-Category" });
  await productModel.deleteMany({ name: "Crucible" });
  await categoryModel.deleteMany({ name: "Test Category" });
  await userModel.deleteMany({ email: adminEmail });
  await mongoose.disconnect();
});

test("create update and delete category and product UI test", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await login(page);

  // Ensure correct user is logged in
  const userTab = page.locator("li").filter({ hasText: adminName });
  await expect(userTab).toBeVisible();

  await userTab.click();

  const dashboardTab = page.locator("li").filter({ hasText: /^Dashboard$/ });
  await dashboardTab.click();

  // Go to Create Category tab
  const createCategoryTab = page.getByRole("link", { name: "Create Category" });
  await createCategoryTab.click();

  // Ensure category is not created yet
  await expect(page.getByText(`Test Category`)).not.toBeVisible();

  const categoryTextbox = page.getByRole("textbox", {
    name: "Enter New Category",
  });
  const submitButton = page.getByRole("button", { name: "Submit" });

  await categoryTextbox.click();
  await categoryTextbox.fill("Test Category");
  await submitButton.click();

  // Check if category is successfully created
  await expect(page.getByText("Test Category is created")).toBeVisible();
  await expect(
    page.locator("td").filter({ hasText: /^Test Category$/ })
  ).toBeVisible();

  const editButton = page.getByRole("button", { name: "Edit" });
  await editButton.click();

  const newCategoryForm = page.getByRole("dialog");
  await expect(newCategoryForm).toBeVisible();

  const newCategoryTextbox = newCategoryForm.getByRole('textbox', { name: 'Enter new category' });
  await newCategoryTextbox.fill("Test-Category");
  await newCategoryForm.getByRole("button", { name: "Submit" }).click();

  // Check that old category is updated to new category
  await expect(page.getByText("Test-Category is updated")).toBeVisible();
  await expect(
    page.locator("td").filter({ hasText: /^Test Category$/ })
  ).not.toBeVisible();
  await expect(
    page.locator("td").filter({ hasText: /^Test-Category$/ })
  ).toBeVisible();

  // Go to Create Product tab
  const createProductTab = page.getByRole("link", { name: "Create Product" });
  await createProductTab.click();

  await page.getByRole("textbox", { name: "write a name" }).fill("Crucible");
  await page
    .getByRole("textbox", { name: "write a description" })
    .fill("Novel by James Rollins");
  await page.getByPlaceholder("write a Price").fill("10");
  await page.getByPlaceholder("write a quantity").fill("10");
  await page.locator("#rc_select_0").click();
  await page.getByTitle("Test-Category").click();
  await page.locator("#rc_select_1").click();
  await page.getByTitle("No").click();
  await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

  await expect(page.getByText("All Products List")).toBeVisible();
  await expect(
    page.locator("h5").filter({ hasText: /^Crucible$/ })
  ).toBeVisible();
  await expect(
    page.locator("p").filter({ hasText: /^Novel by James Rollins$/ })
  ).toBeVisible();

  await page
    .locator("h5")
    .filter({ hasText: /^Crucible$/ })
    .click();
  await expect(
    page.locator("h1").filter({ hasText: "Update Product" })
  ).toBeVisible();

  // Empty out all fields
  await page.getByPlaceholder("write a name").fill("");
  await page
    .getByPlaceholder("write a description")
    .fill("");
  await page.getByPlaceholder("write a Price").fill("");
  await page.getByPlaceholder("write a quantity").fill("");

  // Fill in fields
  await page.getByPlaceholder("write a name").fill("Crucible: the Novel");
  await page
    .getByPlaceholder("write a description")
    .fill("This is a novel by James Rollins");
  await page.getByPlaceholder("write a Price").fill("15");
  await page.getByPlaceholder("write a quantity").fill("5");
  await page.getByRole("button", { name: "Update Product" }).click();

  await expect(page.getByText("All Products List")).toBeVisible();
  await expect(
    page.locator("h5").filter({ hasText: /^Crucible: the Novel$/ })
  ).toBeVisible();
  await expect(
    page.locator("p").filter({ hasText: /^This is a novel by James Rollins$/ })
  ).toBeVisible();

  await page
    .locator("h5")
    .filter({ hasText: /^Crucible: the Novel$/ })
    .click();
  await page.getByRole("button", { name: "Delete Product" }).click();

  // Handle prompt to delete product
  page.on("dialog", async (dialog) => {
    assert(dialog.message() === "Are You Sure want to delete this product ? ");
    await dialog.accept("Yes");
  });

  await expect(
    page.locator("h5").filter({ hasText: /^Crucible: the Novel$/ })
  ).not.toBeVisible();

  // Go to Create Category tab
  await createCategoryTab.click();

  const deleteButton = page.getByRole("button", { name: "Delete" });
  await deleteButton.click();

  // Check if category is successfully deleted
  await expect(page.getByText("category is deleted")).toBeVisible();
  await expect(
    page.locator("td").filter({ hasText: /^Test-Category$/ })
  ).not.toBeVisible();
});

async function login(page) {
  const loginTab = page.getByRole("link", { name: "Login" });
  await loginTab.click();

  const emailTextbox = page.getByRole("textbox", { name: "Enter Your Email" });
  const passwordTextbox = page.getByRole("textbox", {
    name: "Enter Your Password",
  });
  const loginButton = page.getByRole("button", { name: "LOGIN" });

  await emailTextbox.click();
  await emailTextbox.fill(adminEmail);
  await emailTextbox.press("Tab");
  await passwordTextbox.fill(adminPassword);
  await loginButton.click();
}
