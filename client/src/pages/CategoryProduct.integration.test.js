import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import ProductModel from "../../../models/productModel";
import CategoryModel from "../../../models/categoryModel";
import * as productController from "../../../controllers/productController";

dotenv.config();
let mongoServer;
const app = express();
app.use(express.json());
app.get("/api/v1/product/product-category/:slug", productController.productCategoryController);

jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(() => {
    return {
      clientToken: {
        generate: jest.fn(),
      },
      transaction: {
        sale: jest.fn(),
      },
    };
  }),
  Environment: {
    Sandbox: "sandbox",
  },
}));

const mockProducts = [
  {
    _id: "66db427fdb0119d9234b27f1",
    name: "Textbook",
    slug: "textbook",
    description: "A comprehensive textbook",
    price: 79.99,
    category: new mongoose.Types.ObjectId("67daefb0e430f9c760210709"),
    quantity: 50,
    shipping: false,
  },
  {
    _id: "67a2171ea6d9e00ef2ac0229",
    name: "The Law of Contract in Singapore",
    slug: "the-law-of-contract-in-singapore",
    description: "A bestselling book in Singapore",
    price: 54.99,
    category: new mongoose.Types.ObjectId("67daefb0e430f9c760210709"),
    quantity: 200,
    shipping: true,
  }
];
const mockCategory = {
  name: "book",
  slug: "book",
  _id: "67daefb0e430f9c760210709",
};

describe("CategoryProduct Integration Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    const bookCategory = await new CategoryModel(mockCategory);
    const product1 = await new ProductModel(mockProducts[0]);
    const product2 = await new ProductModel(mockProducts[1]);
    await bookCategory.save();
    await product1.save();
    await product2.save();
  });

  afterEach(async () => {
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("get category products", () => {
    it("should return 200 when the category has products", async () => {
      const response = await request(app).get(`/api/v1/product/product-category/${ mockCategory.slug }`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category._id).toBe(mockCategory._id);
      expect(response.body.products.length).toEqual(2);
    });

    it("should return 404 when category doesn't exist", async () => {
      const response = await request(app).get("/api/v1/product/product-category/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Category not found");
    });
  });
});
