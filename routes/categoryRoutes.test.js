import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import categoryRoutes from './categoryRoutes.js';
import userModel from '../models/userModel.js';
import categoryModel from '../models/categoryModel.js';
import slugify from 'slugify';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/v1/category', categoryRoutes);

describe('Category Routes Integration Tests', () => {
  let mongoServer;
  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;
  let testCategory;
  let categoryId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {

    await userModel.deleteMany({});
    await categoryModel.deleteMany({});

    regularUser = await userModel.create({
      name: 'Regular User',
      email: 'regular@test.com',
      password: '$2a$10$XvN/ZgfQmGt7vN4B.Dg9.OXQdRAiLZ6KWKtQBYQvCk5x7jdEMtEAu', // hashed "password123"
      phone: '1234567890',
      address: 'Test Address',
      role: 0,
      answer: 'Test Answer'
    });

    adminUser = await userModel.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: '$2a$10$XvN/ZgfQmGt7vN4B.Dg9.OXQdRAiLZ6KWKtQBYQvCk5x7jdEMtEAu', // hashed "password123"
      phone: '0987654321',
      address: 'Admin Address',
      role: 1,
      answer: 'Test Answer'
    });

    testCategory = await categoryModel.create({
      name: 'Electronics',
      slug: slugify('Electronics')
    });
    categoryId = testCategory._id.toString();

    regularToken = JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    adminToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  });

  describe('Create Category Route', () => {
    test('Admin should create a category successfully', async () => {
      const newCategory = {
        name: 'Books'
      };

      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', adminToken)
        .send(newCategory);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'new category created');
      expect(response.body.category).toHaveProperty('name', newCategory.name);
      expect(response.body.category).toHaveProperty('slug', 'books');
    });

    test('Should not create category without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .send({ name: 'Furniture' });

      expect(response.statusCode).toBe(401);
    });

    test('Regular user should not create category', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', regularToken)
        .send({ name: 'Clothing' });

      expect(response.statusCode).toBe(401);
    });

    test('Should not create category without name', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', adminToken)
        .send({});

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'Name is required');
    });

    test('Should not create duplicate category', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', adminToken)
        .send({ name: 'Electronics' }); // Already exists

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/already exisits/i);
    });
  });

  describe('Update Category Route', () => {
    test('Admin should update a category successfully', async () => {
      const updatedData = {
        name: 'Updated Electronics'
      };

      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', adminToken)
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Category Updated Successfully');
      expect(response.body.category).toHaveProperty('name', updatedData.name);
      expect(response.body.category).toHaveProperty('slug', 'updated-electronics');
    });

    test('Should not update category without authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .send({ name: 'New Name' });

      expect(response.statusCode).toBe(401);
    });

    test('Regular user should not update category', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', regularToken)
        .send({ name: 'New Name' });

      expect(response.statusCode).toBe(401);
    });

    test('Should handle update with duplicate name', async () => {
      await categoryModel.create({
        name: 'Home Appliances',
        slug: slugify('Home Appliances')
      });


      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', adminToken)
        .send({ name: 'Home Appliances' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/already exists/i);
    });

    test('Should handle non-existent category ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .put(`/api/v1/category/update-category/${nonExistentId}`)
        .set('Authorization', adminToken)
        .send({ name: 'New Name' });

      expect(response.body.category).toBe(null);
    });
  });

  describe('Get Categories Routes', () => {
    beforeEach(async () => {
      await categoryModel.create([
        { name: 'Clothing', slug: slugify('Clothing') },
        { name: 'Books', slug: slugify('Books') }
      ]);
    });

    test('Should get all categories without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/category/get-category');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'All Categories List');
      expect(Array.isArray(response.body.category)).toBe(true);
      expect(response.body.category.length).toBe(3);
    });

    test('Should get single category by slug', async () => {
      const response = await request(app)
        .get(`/api/v1/category/single-category/${testCategory.slug}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Get Single Category Successfully');
      expect(response.body.category).toHaveProperty('name', testCategory.name);
    });

    test('Should handle non-existent category slug', async () => {
      const response = await request(app)
        .get('/api/v1/category/single-category/non-existent-slug');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.category).toBe(null);
    });
  });

  describe('Delete Category Route', () => {
    test('Admin should delete category successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Category Deleted Successfully');

      const categoryExists = await categoryModel.findById(categoryId);
      expect(categoryExists).toBe(null);
    });

    test('Should not delete category without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`);

      expect(response.statusCode).toBe(401);

      const categoryExists = await categoryModel.findById(categoryId);
      expect(categoryExists).not.toBe(null);
    });

    test('Regular user should not delete category', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(401);

      const categoryExists = await categoryModel.findById(categoryId);
      expect(categoryExists).not.toBe(null);
    });

    test('Should handle delete for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${nonExistentId}`)
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Category not found');
    });
  });
});