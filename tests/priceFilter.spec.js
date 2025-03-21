import { test, expect } from '@playwright/test';
import mongoose from "mongoose";
import productModel from '../models/productModel.js';

test.beforeAll(async () => {
    const uri = await fs.readFile('.mongo-uri', 'utf-8');
    await mongoose.connect(uri);
    
    const journal = new productModel({
        name: 'premium-journal',
        slug: 'leather-bound-journal',
        description: 'Handcrafted leather journal with premium paper',
        price: 14.95,
        category: new mongoose.Types.ObjectId(),
        quantity: 7,
        photo: {
            data: Buffer.from("journal product image", "utf-8"),
            contentType: "image/png",
        },
        shipping: true,
    });

    const camera = new productModel({
        name: 'digital-slr',
        slug: 'professional-camera-2025',
        description: 'High resolution digital camera with advanced features',
        price: 899.99,
        category: new mongoose.Types.ObjectId(),
        quantity: 3,
        photo: {
            data: Buffer.from("camera product image", "utf-8"),
            contentType: "image/png",
        },
        shipping: true,
    });

    await Promise.all([
        journal.save(),
        camera.save()
    ]);
});

test.afterAll(async () => {
    await Promise.all([
        productModel.deleteOne({ slug: 'leather-bound-journal' }),
        productModel.deleteOne({ slug: 'professional-camera-2025' })
    ]);
    
    await mongoose.disconnect();
});

test('should filter products by price range selection', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await page.getByText('$0 to 19').click();
    await expect(page.getByText('premium-journal')).toBeVisible();
    await expect(page.getByText('digital-slr')).not.toBeVisible();

    await page.getByText('$100 or more').click();
    await expect(page.getByText('digital-slr')).toBeVisible();
    await expect(page.getByText('premium-journal')).not.toBeVisible();

    await page.getByText('RESET FILTERS').click();
    await expect(page.getByText('premium-journal')).toBeVisible();
    await expect(page.getByText('digital-slr')).toBeVisible();
});