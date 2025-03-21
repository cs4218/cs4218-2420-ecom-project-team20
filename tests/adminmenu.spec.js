import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { hashPassword } from "../helpers/authHelper";
import UserModel from "../models/userModel";
dotenv.config();

test.beforeEach(async ({ page }) => {
  await mongoose.connect(process.env.MONGO_URL);
  await mongoose.connection.collection("users").deleteMany({});

  // Create admin user
  const hashedPassword = await hashPassword("admin@test.com");
  const adminUser = new UserModel({
    name: "Admin",
    email: "admin@test.com",
    password: hashedPassword,
    dob: "1990-01-01",
    phone: "1234567890",
    address: "123 Street",
    answer: "Football",
    role: 0,
  });
  await adminUser.save();

  await page.goto("http://localhost:3000/login");

  await page.getByPlaceholder("Enter Your Email").fill("admin@test.com");
  await page.getByPlaceholder("Enter Your Password").fill("admin@test.com");
  await page.getByRole("button", { name: "LOGIN" }).click();

  await page.goto("http://localhost:3000/dashboard/admin");
});

test.afterEach(async () => {
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.disconnect();
});

test.describe("AdminMenu component", () => {
  test("should load AdminMenu component", async ({ page }) => {
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
