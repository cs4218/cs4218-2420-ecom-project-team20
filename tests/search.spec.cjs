// @ts-check
import { test, expect } from '@playwright/test';

const mockSearchResults = [
  {
    _id: 1,
    name: "Textbook",
    slug: "textbook",
    description: "A comprehensive textbook",
    price: 79.99,
    category: "book",
    quantity: 50,
    shipping: false,
  },
  {
    _id: 2,
    name: "The Law of Contract in Singapore",
    slug: "the-law-of-contract-in-singapore",
    description: "A bestselling book in Singapore",
    price: 54.99,
    category: "book",
    quantity: 200,
    shipping: true,
  },
];

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test.describe("Search for a product", () => {
  test("should initially have an empty search bar", async ({ page }) => {
    const searchBar = await page.getByRole("searchbox", { name: 'Search' });
    await expect(searchBar).toBeVisible();
    await expect(searchBar).toBeEmpty();
  });

  test("should be able to type in search bar", async ({ page }) => {
    const searchBar = page.getByRole("searchbox", { name: 'Search' });
    await searchBar.click();
    await searchBar.fill('book');
  });

  test("should be able to search by clicking button", async ({ page }) => {
    const searchBar = page.getByRole("searchbox", { name: 'Search' });
    const searchButton = page.getByRole('button', { name: 'Search' });

    await searchBar.click();
    await searchBar.fill('book');
    await searchButton.click();
    await page.goto('http://localhost:3000/search');

    const heading = page.getByRole('heading', { name: 'Search Results' });
    await expect(heading).toBeVisible();
  });

  test("should be able to search by clicking 'Enter' key", async ({ page }) => {
    const searchBar = page.getByRole("searchbox", { name: 'Search' });

    await searchBar.click();
    await searchBar.fill('book');
    await searchBar.press('Enter');
    await page.goto('http://localhost:3000/search');

    const heading = page.getByRole('heading', { name: 'Search Results' });
    await expect(heading).toBeVisible();
  });

  test("should display products that exist for search query", async ({ page }) => {
    const searchBar = page.getByRole("searchbox", { name: 'Search' });

    await searchBar.click();
    await searchBar.fill('book');
    await searchBar.press('Enter');
    await page.waitForURL("http://localhost:3000/search");

    const resultsCount = page.getByRole("heading", { name: "Found 2" });
    await expect(resultsCount).toBeVisible();

    const title_1 = page.getByRole('heading', { name: 'The Law of Contract in' });
    const title_2 = page.getByRole('heading', { name: 'Textbook' });
    const description_1 = page.getByText('A bestselling book in');
    const description_2 = page.getByText('A comprehensive textbook...');
    const price_1 = page.getByText('$79.99');
    const price_2 = page.getByText('$54.99');
    const image_1 = page.getByTestId('s-img-The Law of Contract in Singapore');
    const image_2 = page.getByTestId('s-img-Textbook');
    const button_1 = page.getByTestId('s-md-button-textbook');
    const button_2 = page.getByTestId('s-md-button-the-law-of-contract-in-singapore');

    await expect(title_1).toBeVisible();
    await expect(title_2).toBeVisible();
    await expect(description_1).toBeVisible();
    await expect(description_2).toBeVisible();
    await expect(price_1).toBeVisible();
    await expect(price_2).toBeVisible();
    await expect(image_1).toBeVisible();
    await expect(image_2).toBeVisible();
    await expect(button_1).toBeVisible();
    await expect(button_2).toBeVisible();

    // NOTE: Tests would not pass for original method because title which was rendered did not always match the full one due to scope of view
    // mockSearchResults.map(async (searchResult) => {
    //   const name = page.getByRole("heading", { name: searchResult.name })
    //   const description = page.getByText(`${ searchResult.description.substring(0, 30) }...`);
    //   const price = page.getByText(`$${ searchResult.price }`);
    //   const image = page.getByTestId(`s-img-${ searchResult.name }`);
    //   const button = page.getByTestId(`s-md-button-${ searchResult.slug }`);
    //
    //   await expect(name).toBeVisible();
    //   await expect(description).toBeVisible();
    //   await expect(price).toBeVisible();
    //   await expect(image).toBeVisible();
    //   await expect(button).toBeVisible();
    // });
  });

  test("should display message when products don't exist for search query", async ({ page }) => {
    const searchBar = page.getByRole("searchbox", { name: "Search" });

    await searchBar.click();
    await searchBar.fill("nonexistent");
    await searchBar.press("Enter");
    await page.waitForURL("http://localhost:3000/search");

    const heading = page.getByRole("heading", { name: "Search Results" });
    const message = page.getByText("No Products Found");

    await expect(heading).toBeVisible();
    await expect(message).toBeVisible();
  });

  test("should navigate to product page when 'More Details' button is clicked", async ({ page }) => {
    const searchBar = page.getByRole("searchbox", { name: 'Search' });

    await searchBar.click();
    await searchBar.fill('book');
    await searchBar.press('Enter');
    await page.waitForURL("http://localhost:3000/search");

    const button = page.getByTestId(`s-md-button-${ mockSearchResults[0].slug }`);

    await expect(button).toBeVisible();
    await button.click();
    await page.waitForURL(`http://localhost:3000/product/${ mockSearchResults[0].slug }`);

    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Name: Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description: A comprehensive' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Price: $79.99' })).toBeVisible();
    await expect(page.getByTestId('pd-image-Textbook')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Similar Products ➡️' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeVisible();
  });
});
