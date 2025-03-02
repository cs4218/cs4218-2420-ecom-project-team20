import {
  createProductController,
  updateProductController,
  deleteProductController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import slugify from "slugify";
import fs from "fs"
import braintree from "braintree";

jest.mock("../models/productModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
  mockConstructor.findByIdAndDelete = jest.fn();
  mockConstructor.create = jest.fn();
  mockConstructor.save = jest.fn();
  return mockConstructor;
});
jest.mock("slugify");
jest.mock("fs", () => {
    readFileSync = jest.fn();
})

jest.mock("mongoose", () => ({
  models: {},
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: jest.fn(() => "mock-object-id"), // Mock ObjectId to return a fixed value
  },
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

describe("Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      fields: {},
      files: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    slugify.mockImplementation((str) => `${str}-slug`);
  });

  describe("createProductController", () => {
    it("should successfully create a new product", async () => {
      req.fields = {
        name: "Test Product",
        description: "This is description of test product",
        price: 99.99,
        category: mongoose.Types.ObjectId(),
        quantity: 10,
        shipping: true,
      };
      req.files = {
        photo: {
          size: 300000,
          path: "../client/public/photo.jpg",
        },
      };
      const mockProduct = { ...req.fields, slug: slugify("Test Product") };

      productModel.findOne.mockResolvedValue(null);
      productModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockProduct),
      }));

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        mockProduct,
      });
    });

    it("should handle errors", async () => {
      req.fields = {
        name: "Test Product",
        description: "This is description of test product",
        price: 99.99,
        category: mongoose.Types.ObjectId(),
        quantity: 10,
        shipping: true,
      };
      req.files = {
        photo: {
          size: 300000,
          path: "../client/public/photo.jpg",
        },
      };
      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      productModel.findOne.mockRejectedValue(mockError);

      await createProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error in crearing product",
      });

      spy.mockRestore();
    });
  });
});
