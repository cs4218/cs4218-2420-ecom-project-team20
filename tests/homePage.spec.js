import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';

async function setupDatabase() {
  const uri = await fs.readFile('.mongo-uri', 'utf-8');
  await mongoose.connect(uri);

  const category1 = new categoryModel({
    name: 'Books',
    slug: 'books',
  });

  const category2 = new categoryModel({
    name: 'Electronics',
    slug: 'electronics',
  });

  await category1.save();
  await category2.save();

  const book = new productModel({
    name: 'Best Book',
    slug: 'book-slug',
    description: 'This is the best book',
    price: 18,
    category: category1._id,
    quantity: 1,
    photo: {
      data: Buffer.from('sample photo data', 'utf-8'),
      contentType: 'image/jpeg',
    },
    shipping: false,
  });

  const laptop = new productModel({
    name: 'Best Laptop',
    slug: 'laptop-slug',
    description: 'This is the best laptop',
    price: 1500,
    category: category2._id,
    quantity: 1,
    photo: {
      data: Buffer.from('sample photo data', 'utf-8'),
      contentType: 'image/jpeg',
    },
    shipping: false,
  });

  await book.save();
  await laptop.save();
}

async function cleanupDatabase() {
  await categoryModel.deleteOne({ slug: 'books' });
  await categoryModel.deleteOne({ slug: 'electronics' });
  await productModel.deleteOne({ slug: 'book-slug' });
  await productModel.deleteOne({ slug: 'laptop-slug' });
  await mongoose.disconnect();
}

test.beforeEach(async () => {
  await setupDatabase();
});

test.afterEach(async () => {
  await cleanupDatabase();
});


test('displays products correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForSelector(".card");
    const productCards = await page.locator('.card');
    expect(await productCards.count()).toBeGreaterThan(0);

    const firstProductCard = productCards.nth(0);
    await expect(firstProductCard.locator('.card-img-top')).toBeVisible();
    await expect(firstProductCard.locator('.card-title')).toBeVisible();
    await expect(firstProductCard.locator('.card-price')).toBeVisible();
    await expect(firstProductCard.locator('.card-text')).toBeVisible();
});

test('filter products by category', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const firstCategoryCheckbox = await page.locator('input[type="checkbox"]').first();
    await firstCategoryCheckbox.check();
    await page.waitForSelector(".card");
    const productsBeforeFilter = await page.locator('.card');
    expect(await productsBeforeFilter.count()).toBeGreaterThan(0);
    await page.click('input[type="checkbox"]:checked');
    const productsAfterFilter = await page.locator('.card');
    expect(await productsAfterFilter.count()).toBeGreaterThan(0);
});

test('reset all filters', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const categoryCheckbox = await page.locator('input[type="checkbox"]').first();
    await categoryCheckbox.check();
    const priceRadio = await page.locator('input[type="radio"]').first();
    await priceRadio.check();
    const resetButton = await page.locator('button.btn-danger');
    await resetButton.click();
    const productCountAfterReset = await page.locator('.card').count();
    expect(productCountAfterReset).toBeGreaterThan(0);
  });

test('banner image is visible', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const bannerImage = await page.locator('.banner-img');
    await expect(bannerImage).toBeVisible();
  });
