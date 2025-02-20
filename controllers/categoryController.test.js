import { expect, jest } from "@jest/globals";
import { categoryController, createCategoryController, updateCategoryController } from "./categoryController.js";
import categoryModel from "../models/categoryModel.js";
import mongoose from "mongoose";
import slugify from "slugify";
import { error } from "console";

jest.mock("../models/categoryModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
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

  test("create new category will add it to categories", async () => {
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
  const categoryOld = "categoryOld";
  const categoryNew = "categoryNew";
  const validId = "validId";
  const invalidId = "invalidId";
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      params: { id: validId },
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

  test("Update category with valid id", async () => {
    categoryModel.findByIdAndUpdate.mockResolvedValue(validId, {name: req.body.name, slug: req.body.slug}, {new: true});

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
      category: validId,
    });
  });

  test("Update category with invalid id", async () => {
    req.params.id = invalidId;

    await updateCategoryController(req, res);

    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      invalidId,
      { name: req.body.name, slug: req.body.slug },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while updating category"
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



