import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import fs from "fs/promises";
import dotenv from "dotenv";
import { hashPassword } from "../helpers/authHelper";
import UserModel from "../models/userModel";
import orderModel from "../models/orderModel";
import categoryModel from "../models/categoryModel";
import productModel from "../models/productModel";
dotenv.config();

let adminName;
let adminEmail;
let adminPassword;
let adminId;
let orderId;

async function deleteUser(email) {
  try {
    await UserModel.deleteMany({ email });
  } catch (error) {
    console.error(error);
  }
}

async function deleteCategory(name) {
  try {
    await categoryModel.deleteMany({ name });
  } catch (error) {
    console.error(error);
  }
}

async function deleteProduct(name) {
  try {
    await productModel.deleteMany({ name });
  } catch (error) {
    console.error(error);
  }
}

async function deleteOrder(id, buyer) {
  try {
    await UserModel.findByIdAndDelete(id)
    await UserModel.deleteMany({ buyer: adminId })
  } catch (error) {
    console.error(error);
  }
}

test.beforeEach(async ({ page }) => {
  const uri = await fs.readFile(".mongo-uri", "utf-8");
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
  adminId = adminUser._id;

  // create cateogory
  const testCategory = new categoryModel({
    name: "Test-Category",
    slug: "test-category",
  });
  await testCategory.save();
  const testCategoryId = testCategory._id;

  // create product
  const testProduct = new productModel({
    name: "Test-Product",
    slug: "test-product",
    category: testCategoryId,
    description: "This is a test product",
    price: 10,
    quantity: 1,
    shipping: true,
  });
  await testProduct.save();
  const testProductId = testProduct._id;

  // create order
  const adminOrder = new orderModel({
    products: [testProductId],
    payment: { method: "Credit Card", amount: 999.99 },
    buyer: adminId,
    status: "Not Process",
  });
  await adminOrder.save();
  orderId = adminOrder._id;
});

test.afterEach(async () => {
  await deleteProduct("Test-Product");
  await deleteCategory("Test-Category");
  await deleteUser(adminEmail);
  await deleteOrder(orderId);
  await mongoose.disconnect();
});

test.describe("Admin Orders component", () => {
  test("should be able to view the Orders list", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/login");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(adminEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(adminPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // check that product exists
    await expect(page).toHaveURL("http://localhost:3000");
    await expect(page.getByText("Test-Product")).toBeVisible();
    // navigate to admin dashboard
    await page.getByRole("button", { name: adminName }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/admin");

    await page.getByRole("link", { name: "Orders" }).click();

    await expect(page).toHaveURL(
      "http://localhost:3000/dashboard/admin/orders"
    );
    await expect(page.getByText("Test-Product")).toBeVisible();
    await expect(page.getByText("Not Process").first()).toBeVisible();
    await expect(
      page.locator("td").filter({ hasText: adminName })
    ).toBeVisible();
  });
});
