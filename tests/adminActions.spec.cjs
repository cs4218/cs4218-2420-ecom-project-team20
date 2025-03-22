// @ts-check
import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel";
import { hashPassword } from "../helpers/authHelper";

let adminName;
let adminEmail;
let adminPassword;
let adminPhone;
let adminUser;

test.beforeAll(async () => {
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

test.afterAll(async () => {
  await userModel.deleteMany({ email: adminEmail });
  await mongoose.disconnect();
});

test("Create category UI test", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await login(page, adminUser);

  // Ensure correct user is logged in
  const userTab = page.getByRole("button", { name: adminName });
  await expect(userTab).toBeVisible();

  await userTab.click();

  const dashboardTab = page.getByRole("link", { name: "DASHBOARD" });
  await dashboardTab.click();

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
  await expect(page.locator('td').filter({ hasText: /^Test Category$/ })).toBeVisible();

  // Check if category is successfully deleted
  const deleteButton = page.getByRole("button", { name: "Delete" });
  await deleteButton.click();
  await expect(page.getByText("category is deleted")).toBeVisible();
  await expect(page.locator('td').filter({ hasText: /^Test Category$/ })).not.toBeVisible();
});

test("Create Product UI test", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await login(page, adminUser);

  // Ensure correct user is logged in
  const userTab = page.getByRole("button", { name: adminName });
  await expect(userTab).toBeVisible();

  await userTab.click();

  const dashboardTab = page.getByRole("link", { name: "DASHBOARD" });
  await dashboardTab.click();

  // GO to Create Category tab
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
  await expect(page.locator('td').filter({ hasText: /^Test Category$/ })).toBeVisible();

  // Go to Create Product tab
  const createProductTab = page.getByRole("link", { name: "Create Product" });
  await createProductTab.click();

  await page.getByLabel('Select a category').click();
  await page.getByRole('option', { name: 'Test Category' }).click();
  await page.getByRole("textbox", { name: "write a name" }).fill("Crucible");
  await page.getByRole("textbox", { name: "write a description" }).fill("Novel by James Rollins");
  await page.getByRole("textbox", { name: "write a Price" }).fill("10");
  await page.getByRole("textbox", { name: "write a quantity" }).fill("1");
  await page.getByRole("textbox", { name: "write a name" }).fill("Crucible");
  await page.getByLabel('Select Shipping').click();
  await page.getByRole('option', { name: 'No' }).click();
  await page.getByLabel('Select a category').click();
  await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
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
  await emailTextbox.fill(adminEmail);
  await emailTextbox.press("Tab");
  await passwordTextbox.fill(adminPassword);
  await loginButton.click();
}
