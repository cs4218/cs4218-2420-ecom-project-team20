# E-commerce

This project is a full-stack e-commerce application with a REST API backend and React frontend.

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Frontend**: React.js
- **Authentication**: JWT, bcrypt
- **Payment Processing**: Braintree
- **Testing**: Jest, Playwright
- **Code Quality**: SonarQube

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local instance or connection string to MongoDB Atlas)

## CI (Automated testing through Github Actions)



## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cs4218/cs4218-2420-ecom-project-team20.git
   cd ecom
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8080
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   BRAINTREE_MERCHANT_ID=<your-braintree-merchant-id>
   BRAINTREE_PUBLIC_KEY=<your-braintree-public-key>
   BRAINTREE_PRIVATE_KEY=<your-braintree-private-key>
   ```

## Running the Application

### Development Mode

To run both the server and client in development mode:

```bash
npm run dev
```

This will start:
- Backend server at http://localhost:8080
- Frontend React app at http://localhost:3000

### Running Server Only

```bash
npm run server
```

### Running Client Only

```bash
npm run client
```

## Testing

This project includes comprehensive testing setups for both frontend and backend.

### Running All Tests

```bash
npm test
```

### Running Frontend Tests Only

```bash
npm run test:frontend
```

### Running Backend Tests Only

```bash
npm run test:backend
```

### End-to-End Testing with Playwright

The project includes Playwright for end-to-end testing. To run Playwright tests:

```bash
npx playwright test
```

## Code Quality

The project is configured with SonarQube for code quality analysis:

```bash
npm run sonarqube
```

Ensure you have a SonarQube server running and properly configured in your environment.

## Project Structure

```
ecom/
├── client/             # React frontend application
├── controllers/        # Express route controllers
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # Express routes
├── tests/              # Test files
├── .env                # Environment variables
├── jest.setup.js       # Jest setup file
├── jest.frontend.config.js  # Jest frontend configuration
├── jest.backend.config.js   # Jest backend configuration
├── package.json        # Project dependencies and scripts
└── server.js           # Express server entry point
```

## Available API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/user` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/user` - Get current user's orders (protected)
- `POST /api/orders` - Create a new order (protected)
- `PUT /api/orders/:id` - Update order status (admin only)

## License

This project is licensed under the ISC License.

## Author

RP