import {
  createProductController,
  updateProductController,
  deleteProductController,
  getProductController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import slugify from "slugify";
import fs from "fs";
import braintree from "braintree";

jest.mock("../models/productModel.js");
jest.mock("braintree", () => {
  return {
    BraintreeGateway: jest.fn().mockImplementation(() => {
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
  };
});

jest.mock("slugify");
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mock-photo-data"),
}));

describe("Product Controller CRUD Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      fields: {
        name: "Test Product",
        description: "This is description of test product",
        price: 99.99,
        category: "test-object-id",
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          size: 1000000,
          path: "../client/public/photo.jpg",
          type: "image/jpeg",
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    slugify.mockImplementation((str) => `${str}-slug`);
  });

  describe("createProductController", () => {
    it("should return error if name is not provided", async () => {
      req.fields.name = null;

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Name is Required",
      });
    });

    it("should return error if description is not provided", async () => {
      req.fields.description = null;

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
    });

    it("should return error if category is not provided", async () => {
      req.fields.category = null;

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
    });

    it("should return error if quantity is not provided", async () => {
      req.fields.quantity = null;

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
    });

    it("should return error if photo is larger than 1 MB", async () => {
      req.files.photo.size = 1000001;

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
    });

    it("should return error if price is not provided", async () => {
      req.fields.price = null;

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Price is Required",
      });
    });

    it("should successfully create a new product", async () => {
      req.fields.category;
      const mockProduct = new productModel({
        ...req.fields,
        slug: slugify("Test Product"),
        photo: {
          data: "mock-photo-data",
          contentType: "image/jpeg",
        },
      });

      productModel.findOne.mockResolvedValue(null);
      productModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockProduct),
      }));

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        mockProduct,
      });
    });

    it("should handle errors", async () => {
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

  describe("getProductController", () => {
    it("should successfully get all products", async () => {
      const mockProductsList = [
        {
          name: "Test Product 1",
          slug: slugify("Test Product 1"),
          description: "This is test product 1",
          price: 100,
          category: "test-object-id",
          quantity: 2,
          photo: {},
          shipping: true,
        },
        {
          name: "Test Product 2",
          slug: slugify("Test Product 2"),
          description: "This is test product 2",
          price: 20,
          category: "test-object-id",
          quantity: 5,
          photo: {},
          shipping: false,
        },
      ];
      productModel.find.mockResolvedValue(mockProductsList);

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        counTotal: mockProductsList.length,
        message: "ALlProducts",
        product: mockProductsList,
      });
    });
  });

  describe("getSingleProductController", () => {
    it("should successfully get one product", async () => {
      req.params = { slug: "test-single-product" };
      const mockProduct = {
        name: "Test Product 1",
        slug: "test-single-product",
        description: "This is test product 1",
        price: 100,
        category: "test-object-id",
        quantity: 2,
        photo: {},
        shipping: true,
      };
      productModel.findOne.mockResolvedValue(mockProduct);

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Single Product Fetched",
        product: mockProduct,
      });
    });
  });
});
