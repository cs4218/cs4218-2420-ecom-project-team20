import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { requireSignIn, isAdmin } from '../middlewares/authMiddleware.js';
import categoryModel from '../models/categoryModel.js';
import userModel from '../models/userModel.js';
import * as categoryController from './categoryController.js';

jest.mock('../middlewares/authMiddleware.js', () => ({
    requireSignIn: jest.fn((req, res, next) => {
      if (req.headers.authorization) {
        req.user = { _id: req.headers.userid };
        return next();
      }
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }),
    isAdmin: jest.fn((req, res, next) => {
      if (req.headers.isadmin === 'true') {
        return next();
      }
      return res.status(401).json({ success: false, message: 'Admin access required' });
    })
  }));

dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/category/create', requireSignIn, isAdmin, categoryController.createCategoryController);
app.put('/api/category/update/:id', requireSignIn, isAdmin, categoryController.updateCategoryController);
app.get('/api/categories', categoryController.categoryControlller);
app.get('/api/category/:slug', categoryController.singleCategoryController);
app.delete('/api/category/:id', requireSignIn, isAdmin, categoryController.deleteCategoryController);

describe('Category Controller Integration Tests', () => {
  let mongoServer;
  let adminUser;
  let adminId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    adminUser = new userModel({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      phone: '0987654321',
      address: 'Admin Address',
      role: 1,
      answer: 'admin',
    });
    await adminUser.save();
    adminId = adminUser._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await categoryModel.deleteMany({});
  });

  describe('Create Category', () => {
    test('Should create a new category successfully', async () => {
      const response = await request(app)
        .post('/api/category/create')
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true')
        .send({ name: 'Electronics' });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('new category created');
      expect(response.body.category.name).toBe('Electronics');
      expect(response.body.category.slug).toBe('electronics');
    });

    test('Should reject category creation without name', async () => {
      const response = await request(app)
        .post('/api/category/create')
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true')
        .send({});

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Name is required');
    });

    test('Should reject duplicate category creation', async () => {
      await categoryModel.create({ 
        name: 'Books', 
        slug: 'books' 
      });

      const response = await request(app)
        .post('/api/category/create')
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true')
        .send({ name: 'Books' });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category Already Exisits');
    });

    test('Should require admin access', async () => {
      const response = await request(app)
        .post('/api/category/create')
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'false')
        .send({ name: 'Home Decor' });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Update Category', () => {
    let categoryId;
    
    beforeEach(async () => {
      const category = await categoryModel.create({
        name: 'Fashion',
        slug: 'fashion'
      });
      categoryId = category._id.toString();
    });

    test('Should update category successfully', async () => {
      const response = await request(app)
        .put(`/api/category/update/${categoryId}`)
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true')
        .send({ name: 'Fashion & Apparel' });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category.name).toBe('Fashion & Apparel');
      expect(response.body.category.slug).toBe('fashion-and-apparel');
    });

    test('Should reject update with existing name', async () => {
      await categoryModel.create({
        name: 'Clothing',
        slug: 'clothing'
      });

      const response = await request(app)
        .put(`/api/category/update/${categoryId}`)
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true')
        .send({ name: 'Clothing' });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category with this name already exists');
    });
  });

  describe('Get Categories', () => {
    beforeEach(async () => {
      await categoryModel.insertMany([
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Clothing', slug: 'clothing' },
        { name: 'Books', slug: 'books' }
      ]);
    });

    test('Should get all categories', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category.length).toBe(3);
      expect(response.body.category.map(c => c.name)).toContain('Electronics');
      expect(response.body.category.map(c => c.name)).toContain('Clothing');
      expect(response.body.category.map(c => c.name)).toContain('Books');
    });

    test('Should get single category by slug', async () => {
      const response = await request(app).get('/api/category/electronics');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category.name).toBe('Electronics');
    });

    test('Should handle non-existent category slug', async () => {
      const response = await request(app).get('/api/category/non-existent');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe(null);
    });
  });

  describe('Delete Category', () => {
    let categoryId;
    
    beforeEach(async () => {
      const category = await categoryModel.create({
        name: 'Test Category',
        slug: 'test-category'
      });
      categoryId = category._id.toString();
    });

    test('Should delete category successfully', async () => {
      const response = await request(app)
        .delete(`/api/category/${categoryId}`)
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category Deleted Successfully');

      const categoryCount = await categoryModel.countDocuments({ _id: categoryId });
      expect(categoryCount).toBe(0);
    });

    test('Should return 404 when deleting non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();;
      
      const response = await request(app)
        .delete(`/api/category/${nonExistentId}`)
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'true');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });

    test('Should require admin access for deletion', async () => {
      const response = await request(app)
        .delete(`/api/category/${categoryId}`)
        .set('Authorization', 'valid-token')
        .set('userid', adminId)
        .set('isadmin', 'false');

      expect(response.statusCode).toBe(401);
      
      // Verify category was not deleted
      const categoryCount = await categoryModel.countDocuments({ _id: categoryId });
      expect(categoryCount).toBe(1);
    });
  });
});