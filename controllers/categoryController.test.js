import { expect, jest } from "@jest/globals";
import { categoryControlller, createCategoryController } from "./categoryController.js";
import categoryModel from "../models/categoryModel.js";
import mongoose from "mongoose";
import { beforeEach } from "node:test";
import slugify from "slugify";

jest.mock("../models/categoryModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    req = {
      body: {
        name: "testCategory",
        slug: slugify("testCategory"),
      }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("create category will not add an existing category", async () => {
    categoryModel.findOne.mockResolvedValue({ name: "testCategory" })

    await categoryControlller(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(categoryModel).not.toHaveBeenCalled();
    expect(categoryModel.save).not.toHaveBeenCalled();
  });
})

