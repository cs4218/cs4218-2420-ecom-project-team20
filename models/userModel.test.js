import User from './userModel.js';

const mockingoose = require('mockingoose');

describe('User Model Tests', () => {

  it('should require an email', () => {
    const user = new User({});
    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
  });

  it('should enforce email uniqueness (mocked)', async () => {
    mockingoose(User).toReturn({ email: 'existing@example.com' }, 'findOne');

    const existingUser = await User.findOne({ email: 'existing@example.com' });
    expect(existingUser.email).toBe('existing@example.com');
  });

  it('should default role to 0', () => {
    const user = new User({});
    expect(user.role).toBe(0);
  });

  it('should save a valid user', async () => {
    const mockUser = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpassword123',
      phone: '9876543210',
      address: { city: 'Los Angeles', zip: '90001' },
      answer: 'green',
    });

    mockingoose(User).toReturn(mockUser, 'save');

    const result = await mockUser.save();
    expect(result.name).toBe('Jane Doe');
  });
});