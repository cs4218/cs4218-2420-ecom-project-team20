import { beforeEach, describe, expect, jest } from "@jest/globals";
import {
  createProductController,
  updateProductController,
  deleteProductController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import mongoose, { Types } from "mongoose";
import slugify from "slugify";

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

jest.mock("mongoose", () => ({
  models: {},
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: jest.fn(() => 'mock-object-id'), // Mock ObjectId to return a fixed value
  },
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

describe("Create Product Controller Test", () => {
  let req, res;
  const productName = "productName";
  const productDescription = "This is the product description";
  const productPrice = 99.99;
  const productCategory = mongoose.Types.ObjectId();
  const productQuantity = 10;
  const productPhoto = "productPhoto";
  const productShipping = true;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      fields: {
        name: productName,
        description: productDescription,
        price: productPrice,
        category: productCategory,
        quantity: productQuantity,
        shipping: productShipping,
      },
      files: {
        photo: productPhoto,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should successfully create a new product", async () => {
    productModel.findOne.mockResolvedValue(null);

    const mockProductModel = { ...req.fields, slug: slugify(req.fields.name) }
    productModel.create.mockResolvedValue();
  });
});

describe("Update Product Controller Test", () => {});

describe("Delete Product Controller Test", () => {});
