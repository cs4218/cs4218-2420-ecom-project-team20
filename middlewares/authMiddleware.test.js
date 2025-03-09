import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js", () => {
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

describe("Authentication Middleware Tests", () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {
        authorization: "Bearer test-token",
      },
      user: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  describe("requireSignIn Middleware", () => {
    it("should successfully verify JWT and call next()", async () => {
      const mockDecodedToken = { _id: "user123", email: "test@test.com" };
      JWT.verify.mockReturnValue(mockDecodedToken);

      await requireSignIn(mockReq, mockRes, nextFunction);

      expect(JWT.verify).toHaveBeenCalledWith(
        "Bearer test-token",
        process.env.JWT_SECRET
      );
      expect(mockReq.user).toEqual(mockDecodedToken);
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should handle JWT verification failure", async () => {
      const mockError = new Error("Invalid token");
      JWT.verify.mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, "log");

      await requireSignIn(mockReq, mockRes, nextFunction);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(nextFunction).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("isAdmin Middleware", () => {
    it("should allow access for admin user (role = 1)", async () => {
      const mockUser = { _id: "user123", role: 1 };
      userModel.findById.mockResolvedValue(mockUser);

      await isAdmin(mockReq, mockRes, nextFunction);

      expect(userModel.findById).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should deny access for non-admin user (role != 1)", async () => {
      const mockUser = { _id: "user123", role: 0 };
      userModel.findById.mockResolvedValue(mockUser);

      await isAdmin(mockReq, mockRes, nextFunction);

      expect(userModel.findById).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "UnAuthorized Access",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database error");
      userModel.findById.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "log");

      await isAdmin(mockReq, mockRes, nextFunction);

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error in admin middleware",
      });
      expect(nextFunction).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
