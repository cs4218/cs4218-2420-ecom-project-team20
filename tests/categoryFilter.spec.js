import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import mongoose from "mongoose";
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';

test.beforeAll(async () => {
    const uri = await fs.readFile('.mongo-uri', 'utf-8');

    await mongoose.connect(uri);
    
    const novel = new productModel({
        name: 'fantasy-chronicles',
        slug: 'fantasy-chronicles-2025',
        description: 'An immersive fantasy novel with unexpected twists',
        price: 24.99,
        category: new mongoose.Types.ObjectId('65d8e7f3b2a91c4567890123'),
        quantity: 15,
        photo: {
            data: Buffer.from('novel image placeholder', 'utf-8'),
            contentType: 'image/png',
        },
        shipping: true,
    });

    const smartwatch = new productModel({
        name: 'pulse-tracker-pro',
        slug: 'pulse-tracker-pro-v2',
        description: 'Advanced fitness tracking with health monitoring features',
        price: 199.95,
        category: new mongoose.Types.ObjectId('65d8e7f3b2a91c4567890124'),
        quantity: 8,
        photo: {
            data: Buffer.from('smartwatch product image', 'utf-8'),
            contentType: 'image/png',
        },
        shipping: true,
    });


    const literatureCategory = new categoryModel({
        name: 'literature',
        slug: 'literature-collection',
        _id: '65d8e7f3b2a91c4567890123',
    });

    const gadgetsCategory = new categoryModel({
        name: 'gadgets',
        slug: 'tech-gadgets',
        _id: '65d8e7f3b2a91c4567890124',
    });

    await Promise.all([
        novel.save(),
        smartwatch.save(),
        literatureCategory.save(),
        gadgetsCategory.save()
    ]);
});

test.afterAll(async () => {
    await Promise.all([
        productModel.deleteOne({ slug: 'fantasy-chronicles-2025' }),
        productModel.deleteOne({ slug: 'pulse-tracker-pro-v2' }),
        categoryModel.deleteOne({ slug: 'literature-collection' }),
        categoryModel.deleteOne({ slug: 'tech-gadgets' })
    ]);
    
    await mongoose.disconnect();
});

test('should filter products by category selection', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await expect(page.getByText('fantasy-chronicles')).toBeVisible();
    await expect(page.getByText('pulse-tracker-pro')).toBeVisible();

    await page.getByRole('main').getByText('literature').click();
    await expect(page.getByText('fantasy-chronicles')).toBeVisible();
    await expect(page.getByText('pulse-tracker-pro')).not.toBeVisible();

 
    await page.getByRole('main').getByText('literature').click(); // Deselect literature
    await page.getByRole('main').getByText('gadgets').click();    // Select gadgets
    await expect(page.getByText('pulse-tracker-pro')).toBeVisible();
    await expect(page.getByText('fantasy-chronicles')).not.toBeVisible();

    await page.getByRole('main').getByText('literature').click(); // Also select literature
    await expect(page.getByText('pulse-tracker-pro')).toBeVisible();
    await expect(page.getByText('fantasy-chronicles')).toBeVisible();

    await page.getByText('RESET FILTERS').click();
    await expect(page.getByText('pulse-tracker-pro')).toBeVisible();
    await expect(page.getByText('fantasy-chronicles')).toBeVisible();
});