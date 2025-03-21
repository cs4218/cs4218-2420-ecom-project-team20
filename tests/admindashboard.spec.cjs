import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { hashPassword } from "../helpers/authHelper";
import UserModel from "../models/userModel";
dotenv.config();

let adminName;
let adminEmail;
let adminPassword;
let adminPhone;

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

  // Create admin user
  adminName = "admin";
  adminEmail = "admin@test.com";
  adminPassword = "admin@test.com";
  adminPhone = "1234567890";
  const hashedPassword = await hashPassword(adminPassword);
  const adminUser = new UserModel({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    dob: "1990-01-01",
    phone: adminPhone,
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

test.describe("AdminDashboard component", () => {
  test("should load AdminDashboard component after logging in as admin", async ({
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

    await expect(page.getByText(`Admin Name : ${adminName}`)).toBeVisible();
    await expect(page.getByText(`Admin Email : ${adminEmail}`)).toBeVisible();
    await expect(page.getByText(`Admin Contact : ${adminPhone}`)).toBeVisible();
  });
});
