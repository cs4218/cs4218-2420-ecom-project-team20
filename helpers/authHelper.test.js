import { hashPassword, comparePassword } from "./authHelper.js";
import bcrypt from "bcrypt";


jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe("Password Hashing and Comparison", () => {
    const plainPassword = "securePassword123";
    const fakeHash = "$2b$10$hashedpasswordexample";
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("hashPassword should return a hashed password", async () => {
        bcrypt.hash.mockResolvedValue(fakeHash);
        
        const hashedPassword = await hashPassword(plainPassword);
        
        expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
        expect(hashedPassword).toBe(fakeHash);
    });

    test("comparePassword should return true for matching passwords", async () => {
        bcrypt.compare.mockResolvedValue(true);
        
        const isMatch = await comparePassword(plainPassword, fakeHash);
        
        expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, fakeHash);
        expect(isMatch).toBe(true);
    });

    test("comparePassword should return false for non-matching passwords", async () => {
        bcrypt.compare.mockResolvedValue(false);
        
        const isMatch = await comparePassword("wrongPassword", fakeHash);
        
        expect(bcrypt.compare).toHaveBeenCalledWith("wrongPassword", fakeHash);
        expect(isMatch).toBe(false);
    });

    test("hashPassword should handle errors", async () => {
        bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));
        
        const hashedPassword = await hashPassword(plainPassword);
        
        expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
        expect(hashedPassword).toBeUndefined();
    });
});
