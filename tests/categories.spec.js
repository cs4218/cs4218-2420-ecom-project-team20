import { test, expect } from "@playwright/test";
import fs from 'fs/promises';
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";

test.describe("Categories Page UI Tests", () => {

    test.beforeAll(async () => {
        const uri = await fs.readFile('.mongo-uri', 'utf-8');
        
        await mongoose.connect(uri);

        const fruitCategory = new categoryModel({
            name: 'Fruits',
            slug: 'fruits',
        });
    
        const textileCategory = new categoryModel({
            name: 'Textiles',
            slug: 'textiles',
        });

        await Promise.all([
            fruitCategory.save(),
            textileCategory.save(),
        ]);
    });

    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/categories");
    });

    test.afterAll(async () => {
        await Promise.all([
            categoryModel.deleteOne({ slug: 'fruits' }),
            categoryModel.deleteOne({ slug: 'textiles' }),
        ]);
        
        await mongoose.disconnect();
    });

    test("should render the Categories page with correct title", async ({ page }) => {
        await expect(page).toHaveTitle("All Categories");
    });

    test("should display the main heading and instruction", async ({ page }) => {
        const heading = page.locator("h2");
        const instruction = page.locator(".instruction");
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText("All Categories");
        await expect(instruction).toBeVisible();
        await expect(instruction).toHaveText("Click on a category below to see the items in that category");
    });

    test("should display a list of categories", async ({ page }) => {
        await page.waitForSelector(".btn.btn-primary");
        const categoryLinks = page.locator(".btn.btn-primary");
    
        const count = await categoryLinks.count();

        await expect(count).toBeGreaterThan(0);
        await expect(categoryLinks.first()).toBeVisible();
    });

    test("should navigate to the correct category page when a category is clicked", async ({ page }) => {
        const categoryLinks = page.locator(".btn.btn-primary");
        const firstCategoryLink = categoryLinks.first();
        const firstCategoryName = await firstCategoryLink.innerText();
        
        await firstCategoryLink.click();
        await expect(page).toHaveURL(new RegExp(`/category/.*${firstCategoryName.toLowerCase()}`));
    });

});
