import { beforeEach, describe, expect, jest } from "@jest/globals";
import { createProductController, updateProductController, deleteProductController } from "./productController.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
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
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

describe("Create Product Controller Test", () => {

});

describe("Update Product Controller Test", () => {

});

describe("Delete Product Controller Test", () => {
    
})