import { beforeEach, describe, expect, jest } from "@jest/globals";
import { createCategoryController, deleteCategoryCOntroller, updateCategoryController } from "./categoryController.js";
import categoryModel from "../models/categoryModel.js";
import mongoose from "mongoose";
import slugify from "slugify";

jest.mock("../models/categoryModel.js", () => {
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
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

describe("Create Category Controller Test", () => {
  let req, res;
  const categoryName = "testCategory"

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      body: {
        name: categoryName,
        slug: slugify(categoryName),
      }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("create category will not add an existing category", async () => {
    categoryModel.findOne.mockResolvedValue({ name: req.body.name })

    await createCategoryController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Already Exisits"
    })
    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: req.body.name });
    expect(categoryModel.save).not.toHaveBeenCalled();
  });

  test("should successfully create new category", async () => {
    categoryModel.findOne.mockResolvedValue(null);

    categoryModel.create.mockResolvedValue({
      name: req.body.name,
      slug: req.body.slug,
    })

    await createCategoryController(req, res);
    
    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: req.body.name });
    expect(categoryModel).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        slug: req.body.slug,
      })
    )
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: {
        name: req.body.name,
        slug: req.body.slug,
      }
    })
  });

  test("should handle errors when creating categories", async () => {
    categoryModel.findOne.mockRejectedValue(new Error("DB Error"));

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Errro in Category"
    });
  })

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.resetModules();
  });

});

describe("Update Category Controller Test", () => {
  const categoryNew = "categoryNew";
  const id = "cat001"
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks(); 
    jest.useFakeTimers();

    req = {
      params: { id: id },
      body: {
        name: categoryNew,
        slug: slugify(categoryNew),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should successfully update category with new name", async () => {
    categoryModel.findByIdAndUpdate.mockResolvedValue(req.params.id, {name: req.body.name, slug: req.body.slug}, {new: true});

    await updateCategoryController(req, res);

    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      { name: req.body.name, slug: req.body.slug },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      messsage: "Category Updated Successfully",
      category: id,
    });
  });

  test("should handle errors when updating categories", async () => {
    categoryModel.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while updating category"
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.resetModules();
  });
});

describe("Delete Category Controller Test", () => {
  const categoryToBeDeleted = "categoryToBeDeleted";
  const id = "cat001"
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      params: { id: id },
      body: {
        name: categoryToBeDeleted,
        slug: slugify(categoryToBeDeleted),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should successfully delete category with specified id", async () => {
    categoryModel.findByIdAndDelete.mockResolvedValue(req.params.id);

    await deleteCategoryCOntroller(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(
      req.params.id,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    });
  });

  test("should handle errors when deleting categories", async () => {
    categoryModel.findByIdAndDelete.mockRejectedValue(new Error("DB Error"));

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "error while deleting category"
    });
  });
})



