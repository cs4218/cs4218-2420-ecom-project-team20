import {
  createProductController,
  updateProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  productFiltersController,
  braintreeTokenController,
  brainTreePaymentController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
} from "./productController.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import slugify from "slugify";
import fs from "fs";
import braintree from "braintree";
import { error } from "console";

jest.mock("../models/orderModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
  mockConstructor.findById = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
  mockConstructor.create = jest.fn();
  return mockConstructor;
});

jest.mock("../models/productModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.find = jest.fn();
  mockConstructor.findOne = jest.fn();
  mockConstructor.findById = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
  mockConstructor.create = jest.fn();
  mockConstructor.findByIdAndDelete = jest.fn();
  return mockConstructor;
});

jest.mock("../models/orderModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.find = jest.fn();
  mockConstructor.findOne = jest.fn();
  mockConstructor.findById = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
  mockConstructor.create = jest.fn();
  mockConstructor.findByIdAndDelete = jest.fn();
  return mockConstructor;
});

jest.mock("../models/categoryModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
  mockConstructor.findById = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
  mockConstructor.create = jest.fn();
  return mockConstructor;
});

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

jest.mock("slugify");
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mock-photo-data"),
}));

const gateway = braintree.BraintreeGateway.mock.results[0].value;

describe("Product Controller CRUD Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {

      params: {
        pid: "mock-product-id",
      },
      fields: {
        name: "Test Product",
        description: "This is description of test product",
        price: 99.99,
        category: "mock-category-id",
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          size: 1000000,
          path: "../client/public/photo.jpg",
          data: "mock-photo-data",
          type: "image/jpeg",
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
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

    it("should return success if product already exists", async () => {
      productModel.findOne.mockResolvedValue({ name: "Test Product" });

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Product Already Exists",
      });
    });

    it("should successfully create a new product", async () => {
      const mockProduct = {
        ...req.fields,
        slug: slugify("Test Product"),
        photo: {
          data: "mock-photo-data",
          contentType: "image/jpeg",
        },
        save: jest.fn().mockResolvedValue(true),
      };

      productModel.findOne.mockResolvedValue(null);
      productModel.mockImplementation(() => mockProduct);

      fs.readFileSync.mockReturnValue("mock-photo-data");

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        products: mockProduct,
      });

      expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);

      expect(mockProduct.save).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      const mockProduct = {
        ...req.fields,
        slug: slugify("Test Product"),
        photo: {
          data: "mock-photo-data",
          contentType: "image/jpeg",
        },
        save: jest.fn().mockRejectedValue(mockError),
      };

      productModel.findOne.mockResolvedValue(null);
      productModel.mockImplementation(() => mockProduct);

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
          category: "mock-category-id",
          quantity: 2,
          photo: {},
          shipping: true,
        },
        {
          name: "Test Product 2",
          slug: slugify("Test Product 2"),
          description: "This is test product 2",
          price: 20,
          category: "mock-category-id",
          quantity: 5,
          photo: {},
          shipping: false,
        },
      ];

      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProductsList),
      });

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: mockProductsList.length,
        message: "All Products",
        products: mockProductsList,
      });
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(mockError),
      });

      await getProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError.message,
        message: "Erorr in getting products",
      });

      spy.mockRestore();
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
        category: "mock-category-id",
        quantity: 2,
        photo: {},
        shipping: true,
      };

      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Single Product Fetched",
        product: mockProduct,
      });
    });

    it("should return error if product doesn't exist", async () => {
      req.params = { slug: "test-single-product" };

      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      });

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Product not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { slug: "test-single-product" };

      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await getSingleProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Eror while getitng single product",
      });

      spy.mockRestore();
    });
  });

  describe("productPhotoController", () => {
    it("should successfully get photo by id", async () => {
      req.params = {
        pid: "mock-product-id",
      };
      const mockProduct = {
        photo: {
          data: "mock-photo-data",
          contentType: "image/jpeg",
        },
      };
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProduct),
      });

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith(
        "Content-type",
        mockProduct.photo.contentType
      );
      expect(res.send).toHaveBeenCalledWith(mockProduct.photo.data);
    });

    it("should handle errors", async () => {
      req.params = {
        pid: "mock-product-id",
      };
      const mockError = new Error("Database-Error");
      const spy = jest.spyOn(console, "log");

      productModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError),
      });

      await productPhotoController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Erorr while getting photo",
        error: mockError,
      });

      spy.mockRestore();
    });
  });

  describe("deleteProductController", () => {
    it("should successfully delete a product", async () => {
      req.params = {
        pid: "mock-product-id",
      };
      const mockProduct = {
        ...req.fields,
        _id: "mock-product-id",
        slug: slugify("Test Product"),
      };

      productModel.findById.mockResolvedValue(mockProduct);
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProduct),
      });

      await deleteProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted successfully",
      });
    });

    it("should return error if product does not exist", async () => {
      req.params = {
        pid: "mock-nonexistent-pid"
      };

      productModel.findById = jest.fn().mockResolvedValue(null);

      await deleteProductController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith("mock-nonexistent-pid");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Product not found",
      });
      expect(productModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      req.params = {
        pid: "mock-product-id",
      };
      const mockProduct = {
        ...req.fields,
        _id: "mock-product-id",
        slug: slugify("Test Product"),
      };
      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      productModel.findById.mockResolvedValue(mockProduct)
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError),
      });

      await deleteProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while deleting product",
        error: mockError,
      });
    });
  });

  describe("updateProductController", () => {
    it("should return error if name is not provided", async () => {
      req.fields.name = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Name is Required",
      });
    });

    it("should return error if description is not provided", async () => {
      req.fields.description = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
    });

    it("should return error if category is not provided", async () => {
      req.fields.category = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
    });

    it("should return error if quantity is not provided", async () => {
      req.fields.quantity = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
    });

    it("should return error if photo is larger than 1 MB", async () => {
      req.files.photo.size = 1000001;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
    });

    it("should return error if price is not provided", async () => {
      req.fields.price = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Price is Required",
      });
    });

    it("should return an error if trying to update an already existing product", async () => {
      req.params = {
        pid: "mock-product-id",
      };

      productModel.findOne.mockResolvedValue({ name: "Test Product" });

      fs.readFileSync.mockReturnValue("mock-photo-updated-data");

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Another product with this name already exists",
      });
      expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should successfully update a product", async () => {
      req.params = {
        pid: "mock-product-id",
      };
      req.fields = {
        name: "Test Updated Product",
        description: "This is updated description of test product",
        price: 100,
        category: "test-updated-object-id",
        quantity: 20,
        shipping: false,
      };
      req.files = {
        photo: {
          size: 1000000,
          path: "../client/public/photo-updated.jpg",
          data: "mock-photo-updated-data",
          type: "image/jpeg",
        },
      };
      const mockUpdatedProduct = {
        _id: "mock-product-id",
        ...req.fields,
        slug: slugify("Test Updated Product"),
        photo: {
          data: "mock-photo-updated-data",
          contentType: "image/jpeg",
        },
        save: jest.fn().mockResolvedValue(true),
      };

      productModel.findOne.mockResolvedValue(null);
      productModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      fs.readFileSync.mockReturnValue("mock-photo-updated-data");

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Updated Successfully",
        products: mockUpdatedProduct,
      });

      expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);

      expect(mockUpdatedProduct.save).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      req.params = {
        pid: "mock-product-id",
      };
      req.fields = {
        name: "Test Updated Product",
        description: "This is updated description of test product",
        price: 100,
        category: "test-updated-object-id",
        quantity: 20,
        shipping: false,
      };
      req.files = {
        photo: {
          size: 1000000,
          path: "../client/public/photo-updated.jpg",
          data: "mock-photo-updated-data",
          type: "image/jpeg",
        },
      };

      productModel.findOne.mockResolvedValue(null);
      productModel.findByIdAndUpdate.mockRejectedValue(mockError);

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError.message,
        message: "Error in Update product",
      });

      spy.mockRestore();
    });
  });
});

describe("Product Controller Advanced Functions Test", () => {
  let req, res, mockProductsList;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      body: {
        checked: [],
        radio: [],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    slugify.mockImplementation((str) => `${str}-slug`);

    mockProductsList = [
      {
        name: "Test Product 1",
        slug: slugify("Test Product 1"),
        description: "This is test product 1",
        price: 50,
        category: "mock-category-id",
        quantity: 2,
        photo: {},
        shipping: true,
      },
      {
        name: "Test Product 2",
        slug: slugify("Test Product 2"),
        description: "This is test product 2",
        price: 75,
        category: "mock-category-id",
        quantity: 5,
        photo: {},
        shipping: false,
      },
      {
        name: "Test Product 3",
        slug: slugify("Test Product 3"),
        description: "This is test product 3",
        price: 40,
        category: "mock-category-id",
        quantity: 3,
        photo: {},
        shipping: true,
      },
    ];
  });

  describe("productFiltersController", () => {
    it("should filter products based on categories and prices", async () => {
      req.body.checked = ["mock-category-1", "mock-category-2"];
      req.body.radio = [0, 99];

      const mockArgs = {
        category: req.body.checked,
        price: { $gte: req.body.radio[0], $lte: req.body.radio[1] },
      };

      productModel.find.mockResolvedValue(mockProductsList);

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProductsList,
      });
      expect(productModel.find).toHaveBeenCalledWith(mockArgs);
    });

    it("should handle errors", async () => {
      const mockError = new Error("Filter Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockRejectedValue(mockError);

      await productFiltersController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error WHile Filtering Products",
        error: mockError,
      });
    });
  });

  describe("productCountController", () => {
    it("should show total number of products", async () => {
      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockReturnValue(10),
      });

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: 10,
      });
    });

    it("should handle errors", async () => {
      const mockError = new Error("Count Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockRejectedValue(mockError),
      });

      await productCountController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error in product count",
        error: mockError,
      });
    });
  });

  describe("productListController", () => {
    it("should display a set number of products per page", async () => {
      req.params = {
        page: 2,
      };

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProductsList),
      });

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProductsList,
      });
    });

    it("should still display page when no page number is provided", async () => {
      req.params = {
        page: null,
      };

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProductsList),
      });

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProductsList,
      });
    });

    it("should handle errors", async () => {
      req.params = {
        page: 1,
      };
      const mockError = new Error("Product List Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(mockError),
      });

      await productListController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error in per page ctrl",
        error: mockError,
      });
    });
  });

  describe("searchProductController", () => {
    it("should search for products based on keywords", async () => {
      req.params = {
        keyword: "Test Product",
      };

      productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProductsList),
      });

      await searchProductController(req, res);

      expect(res.json).toHaveBeenCalledWith(mockProductsList);
    });

    it("should handle errors", async () => {
      req.params = {
        keyword: "Test Product",
      };
      const mockError = new Error("Search Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError),
      });

      await searchProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error In Search Product API",
        error: mockError,
      });
    });
  });

  describe("realtedProductController", () => {
    it("should find similar products", async () => {
      req.params = {
        pid: "mock-product-id",
        cid: "mock-category-id",
      };

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockProductsList),
      });

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProductsList,
      });
    });

    it("should handle errors", async () => {
      req.params = {
        pid: "mock-product-id",
        cid: "mock-category-id",
      };
      const mockError = new Error("Related Products Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await realtedProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error while geting related product",
        error: mockError,
      });
    });
  });

  describe("productCategoryController", () => {
    it("should find products by category", async () => {
      req.params = {
        slug: "mock-category-slug",
      };
      const mockCategory = {
        name: "Test Category",
        slug: "mock-category-slug",
      };
      categoryModel.findOne.mockResolvedValue(mockCategory);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProductsList),
      });

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        category: mockCategory,
        products: mockProductsList,
      });
    });

    it("should handle errors", async () => {
      req.params = {
        slug: "mock-category-slug",
      };
      const mockError = new Error("Category Error");
      const spy = jest.spyOn(console, "log");

      productModel.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await productCategoryController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error While Getting products",
        error: mockError,
      });
    });
  });

  describe("Payment Gateway API", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();

      req = {
        body: {
          nonce: "mock-payment-method-nonce",
          cart: [
            { _id: "mock-product-1", price: 50 },
            { _id: "mock-product-2", price: 30 },
          ],
        },
        user: {
          _id: "mock-user-id",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    describe("braintreeTokenController", () => {
      it("should generate a token successfully", async () => {
        const mockToken = "mock-client-token";
        gateway.clientToken.generate.mockImplementation(({}, callback) => {
          callback(null, { clientToken: mockToken });
        });

        await braintreeTokenController(req, res);

        expect(gateway.clientToken.generate).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({ success: true, clientToken: mockToken });
      });

      it("should handle errors when generating a Braintree client token", async () => {
        const mockError = new Error("Braintree Error");
        gateway.clientToken.generate.mockImplementation((_, callback) => {
          callback(mockError, null);
        });

        await braintreeTokenController(req, res);

        expect(gateway.clientToken.generate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({success: false, err: mockError});
      });

      it("should handle errors internal server error", async () => {
        const mockError = new Error("Internal Server Error");
        gateway.clientToken.generate.mockImplementation((_, callback) => {
          throw new Error("Internal Server Error");
          callback(mockError, null);
        });

        await braintreeTokenController(req, res);

        expect(gateway.clientToken.generate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Internal Server Error",
        });
      });
    });

    describe("brainTreePaymentController", () => {
      it("should handle payment requests for products successfully", async () => {
        const mockResult = {
          success: true,
          transaction: { id: "mock-transaction-id" },
        };
        gateway.transaction.sale.mockImplementation((_, callback) => {
          callback(null, mockResult);
        });

        await brainTreePaymentController(req, res);

        expect(orderModel).toHaveBeenCalledWith({
          products: req.body.cart,
          payment: mockResult,
          buyer: req.user._id,
        });
        expect(res.json).toHaveBeenCalledWith({ success: true });
      });

      it("should handle payment-related errors", async () => {
        const mockError = new Error("Payment Error");
        gateway.transaction.sale.mockImplementation((_, callback) => {
          callback(mockError, null);
        });

        await brainTreePaymentController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(mockError);
      });

      it("should handle payment-related errors", async () => {
        const mockError = new Error("Payment Error");
        gateway.transaction.sale.mockImplementation((_, callback) => {
          throw new Error("Internal Server Error");
          callback(mockError, null);
        });

        await brainTreePaymentController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Internal Server Error",
        });
      });
    });
  });
});
