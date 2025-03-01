import { emailValidation } from "./emailValidation";

describe("Email Validation Tests", () => {
  test("should return true for valid email addresses", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.com",
      "user+label@example.com",
      "first.last@subdomain.domain.com",
      "123@domain.com",
      "user-name@domain.com",
      "user_name@domain.com",
    ];

    validEmails.forEach((email) => {
      expect(emailValidation(email)).toBe(true);
    });
  });

  test("should return false for emails without @ symbol", () => {
    const invalidEmails = [
      "testexample.com",
      "user.name.domain.com",
      "email.domain",
    ];

    invalidEmails.forEach((email) => {
      expect(emailValidation(email)).toBe(false);
    });
  });

  test("should return false for emails with spaces", () => {
    const invalidEmails = [
      "test @example.com",
      "test@ example.com",
      "test@example. com",
      " test@example.com",
      "test@example.com ",
    ];

    invalidEmails.forEach((email) => {
      expect(emailValidation(email)).toBe(false);
    });
  });

  test("should return false for emails with missing domain parts", () => {
    const invalidEmails = [
      "test@.com",
      "test@com.",
      "@domain.com",
      "test@",
      "test@.",
      "test@domain",
    ];

    invalidEmails.forEach((email) => {
      expect(emailValidation(email)).toBe(false);
    });
  });

  test("should return false for empty or null inputs", () => {
    const invalidInputs = ["", null, undefined];

    invalidInputs.forEach((input) => {
      expect(emailValidation(input)).toBe(false);
    });
  });
});
