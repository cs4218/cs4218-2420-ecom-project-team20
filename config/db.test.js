
import connectDB from "./db.js"
import mongoose from "mongoose";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("connectDB", () => {
  let consoleLogSpy;

  beforeEach(() => {
    process.env.MONGO_URL = "mongodb://testurl";
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should log success message when connection succeeds", async () => {
    const fakeConnection = {
      connection: { host: "localhost" },
    };
    mongoose.connect.mockResolvedValue(fakeConnection);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Connected To Mongodb Database localhost")
    );
  });

  test("should log error message when connection fails", async () => {
    const errorMessage = "Connection failed";
    mongoose.connect.mockRejectedValue(new Error(errorMessage));

    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error in Mongodb Error: ${errorMessage}`)
    );
  });
});
