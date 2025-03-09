import Order from '../models/orderModel.js';

const mockingoose = require('mockingoose');

describe('Order Model Tests', () => {

  it('should save an order successfully', async () => {
    const mockOrder = new Order({
      products: ['507f1f77bcf86cd799439013'],
      payment: { method: 'paypal', status: 'pending' },
      buyer: '507f1f77bcf86cd799439014',
    });

    mockingoose(Order).toReturn(mockOrder, 'save');

    const result = await mockOrder.save();
    expect(result.status).toBe('Not Process');
  });

  it('should validate the status field', () => {
    const order = new Order({ status: 'UnknownStatus' });
    const error = order.validateSync();
    expect(error.errors.status).toBeDefined();
  });

  it('should default status to "Not Process"', () => {
    const order = new Order({});
    expect(order.status).toBe('Not Process');
  });
});
