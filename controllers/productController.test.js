import {
  createProductController,
  updateProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
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
        counTotal: mockProductsList.length,
        message: "ALlProducts ",
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
        category: "test-object-id",
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

    it("should handle errors", async () => {
      req.params = {
        pid: "mock-product-id",
      };
      const mockError = new Error("Database Error");
      const spy = jest.spyOn(console, "log");

      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError),
      });

      await deleteProductController(req, res);

      expect(spy).toHaveBeenCalledWith(mockError)
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

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Name is Required",
      });
    });

    it("should return error if description is not provided", async () => {
      req.fields.description = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
    });

    it("should return error if category is not provided", async () => {
      req.fields.category = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
    });

    it("should return error if quantity is not provided", async () => {
      req.fields.quantity = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
    });

    it("should return error if photo is larger than 1 MB", async () => {
      req.files.photo.size = 1000001;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
    });

    it("should return error if price is not provided", async () => {
      req.fields.price = null;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "Price is Required",
      });
    });

    it("should successfully update a product", async () => {
      req.params = {
        pid: "mock-product-id"
      }
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
        pid: "mock-product-id"
      }
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

      productModel.findByIdAndUpdate.mockRejectedValue(mockError);

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(spy).toHaveBeenCalledWith(mockError);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error in Updte product",
      });

      spy.mockRestore();
    });
  });
});


describe("Product Controller Advanced Functions Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      body: {
        checked: 0,
        radio: 0,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    slugify.mockImplementation((str) => `${str}-slug`);
  });

  describe("productFiltersController", async () => {

  });

  describe("productCountController", async () => {

  });

  describe("productListController", async () => {

  });

  describe("searchProductController", async () => {

  });

  describe("realtedProductController", async () => {

  });

  describe("productCategoryController", async () => {

  });
});

describe("Product Controller Payment Functions Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      body: {
        nonce: "mock-payment-method-nonce",
        cart: ["mock-product-1", "mock-product-2"],
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });
  
  describe("braintreeTokenController", async () => {

  });

  describe("brainTreePaymentController", async () => {

  });
});
