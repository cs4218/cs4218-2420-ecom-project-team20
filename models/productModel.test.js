
import Product from './productModel.js';

const mockingoose = require('mockingoose');


describe('Product Model Tests', () => {

  it('should require a name', () => {
    const product = new Product({});
    const error = product.validateSync();
    expect(error.errors.name).toBeDefined();
  });


  it('should default shipping to undefined', () => {
    const product = new Product({});
    expect(product.shipping).toBeUndefined();
  });

  it('should save a valid product', async () => {
    const mockProduct = new Product({
      name: 'Laptop',
      slug: 'laptop',
      description: 'Gaming Laptop',
      price: 1500,
      category: '507f1f77bcf86cd799439011',
      quantity: 5,
    });

    mockingoose(Product).toReturn(mockProduct, 'save');

    const result = await mockProduct.save();
    expect(result.name).toBe('Laptop');
    expect(result.price).toBe(1500);
  });
});
