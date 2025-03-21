import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { hashPassword } from "../helpers/authHelper";
import UserModel from "../models/userModel";
dotenv.config();

let adminName;
let adminEmail;
let adminPassword;

async function deleteUser(email) {
  try {
    await UserModel.deleteOne({ email });
  } catch (error) {
    console.error(error);
  }
}

test.beforeEach(async ({ page }) => {
  const uri = await fs.readFile('.mongo-uri', 'utf-8');
  await mongoose.connect(uri);
  await deleteUser(adminEmail);

  // create admin user
  adminName = "admin";
  adminEmail = "admin@test.com";
  adminPassword = "admin@test.com";
  const hashedPassword = await hashPassword(adminPassword);
  const adminUser = new UserModel({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    dob: "1990-01-01",
    phone: "1234567890",
    address: "123 Street",
    answer: "Football",
    role: 1,
  });
  await adminUser.save();
});

test.afterEach(async () => {
  await deleteUser(adminEmail);
  await mongoose.disconnect();
});

test.describe("AdminMenu component", () => {
  test("should load AdminMenu component after logging in as admin", async ({
    page,
  }) => {
    // login as admin
    await page.goto("http://localhost:3000/login");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(adminEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(adminPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // navigate to admin dashboard
    await page.getByRole("button", { name: adminName }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/admin");

    await expect(page.getByText("Admin Panel")).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Create Category" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Product" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
  });
});
