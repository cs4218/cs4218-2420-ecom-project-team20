import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryCOntroller,
} from "./categoryController.js";

jest.mock("../models/categoryModel.js");
jest.mock("slugify");

describe("Category Controller Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    categoryModel.findOne = jest.fn();
    categoryModel.find = jest.fn();
    categoryModel.findByIdAndUpdate = jest.fn();
    categoryModel.findByIdAndDelete = jest.fn();

    slugify.mockImplementation((str) => `${str}-slug`);
  });

  describe("createCategoryController", () => {
    it("should return error if name is not provided", async () => {
      await createCategoryController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: "Name is required",
      });
    });

    it("should return success if category already exists", async () => {
      mockReq.body = { name: "Test Category" };
      categoryModel.findOne.mockResolvedValue({ name: "Test Category" });

      await createCategoryController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Already Exisits",
      });
    });

    it("should create new category successfully", async () => {
      mockReq.body = { name: "Test Category" };
      const mockCategory = { name: "Test Category", slug: "test-category" };

      categoryModel.findOne.mockResolvedValue(null);
      categoryModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockCategory),
      }));

      await createCategoryController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "new category created",
        category: mockCategory,
      });
    });

    it("should handle errors", async () => {
      mockReq.body = { name: "Test Category" };
      const mockError = new Error("Database error");
      categoryModel.findOne.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "log");

      await createCategoryController(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Errro in Category",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("updateCategoryController", () => {
    it("should update category successfully", async () => {
      mockReq.body = { name: "Updated Category" };
      mockReq.params = { id: "category123" };
      const mockUpdatedCategory = {
        name: "Updated Category",
        slug: "updated-category",
      };

      categoryModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedCategory);

      await updateCategoryController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        messsage: "Category Updated Successfully",
        category: mockUpdatedCategory,
      });
    });

    it("should handle update errors", async () => {
      mockReq.body = { name: "Updated Category" };
      mockReq.params = { id: "category123" };
      const mockError = new Error("Update error");

      categoryModel.findByIdAndUpdate.mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, "log");

      await updateCategoryController(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error while updating category",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("categoryControlller (Get All)", () => {
    it("should get all categories successfully", async () => {
      const mockCategories = [
        { name: "Category 1", slug: "category-1" },
        { name: "Category 2", slug: "category-2" },
      ];

      categoryModel.find.mockResolvedValue(mockCategories);

      await categoryControlller(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "All Categories List",
        category: mockCategories,
      });
    });

    it("should handle errors when getting all categories", async () => {
      const mockError = new Error("Database error");
      categoryModel.find.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "log");

      await categoryControlller(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error while getting all categories",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("singleCategoryController", () => {
    it("should get single category successfully", async () => {
      mockReq.params = { slug: "test-category" };
      const mockCategory = { name: "Test Category", slug: "test-category" };

      categoryModel.findOne.mockResolvedValue(mockCategory);

      await singleCategoryController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Get SIngle Category SUccessfully",
        category: mockCategory,
      });
    });

    it("should handle errors when getting single category", async () => {
      mockReq.params = { slug: "test-category" };
      const mockError = new Error("Database error");

      categoryModel.findOne.mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, "log");

      await singleCategoryController(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error While getting Single Category",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("deleteCategoryCOntroller", () => {
    it("should delete category successfully", async () => {
      mockReq.params = { id: "category123" };

      categoryModel.findByIdAndDelete.mockResolvedValue({});

      await deleteCategoryCOntroller(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Categry Deleted Successfully",
      });
    });

    it("should handle errors when deleting category", async () => {
      mockReq.params = { id: "category123" };
      const mockError = new Error("Delete error");

      categoryModel.findByIdAndDelete.mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, "log");

      await deleteCategoryCOntroller(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "error while deleting category",
        error: mockError,
      });

      consoleSpy.mockRestore();
    });
  });
});
