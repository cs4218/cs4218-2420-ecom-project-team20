/**
 * Validates if the given email address is in a proper format.
 *
 * This function uses a regular expression to check if the email address
 * follows the standard email format, which includes:
 * - One or more characters before the "@" symbol
 * - An "@" symbol
 * - One or more characters after the "@" symbol and before the "."
 * - A "." symbol
 * - One or more characters after the "."
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email address is valid, otherwise false.
 */
export const emailValidation = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
