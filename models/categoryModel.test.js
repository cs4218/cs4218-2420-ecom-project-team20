import Category from './categoryModel.js';

const mockingoose = require('mockingoose');

describe('Category Model Tests', () => {

  it('should save a category successfully', async () => {
    const mockCategory = new Category({ name: 'Books', slug: 'books' });

    mockingoose(Category).toReturn(mockCategory, 'save');

    const result = await mockCategory.save();
    expect(result.name).toBe('Books');
    expect(result.slug).toBe('books');
  });


  it('should lowercase the slug field', () => {
    const category = new Category({ name: 'Toys', slug: 'TOYS' });
    expect(category.slug).toBe('toys');
  });
});
