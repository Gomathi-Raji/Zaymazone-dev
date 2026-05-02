# Zaymazone Backend API Documentation

## Overview
Zaymazone is a comprehensive e-commerce backend API for an artisan marketplace platform. The API supports user authentication, product management, shopping cart, order processing, and artisan profile management.

## Base URL
```
http://localhost:4000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Health Check
- **GET** `/health` - Check API health status
- **GET** `/` - Get API information and endpoint list

### Authentication
- **POST** `/api/auth/signup` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "password123"
  }
  ```
- **POST** `/api/auth/signin` - Sign in existing user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Products
- **GET** `/api/products` - Get all products with pagination and filtering
  - Query parameters: `q` (search), `category`, `page`, `limit`, `minPrice`, `maxPrice`, `artisanId`, `inStock`
- **GET** `/api/products/:id` - Get single product by ID
- **POST** `/api/products` - Create new product (Auth required)
- **PUT** `/api/products/:id` - Update product (Auth required)
- **DELETE** `/api/products/:id` - Delete product (Auth required)

### Artisans
- **GET** `/api/artisans` - Get all artisans
- **GET** `/api/artisans/:id` - Get single artisan by ID
- **POST** `/api/artisans` - Create artisan profile (Auth required)
- **PUT** `/api/artisans/:id` - Update artisan profile (Auth required)
- **DELETE** `/api/artisans/:id` - Delete artisan profile (Auth required)

### Cart Management
- **GET** `/api/cart` - Get user's cart (Auth required)
- **POST** `/api/cart/add` - Add item to cart (Auth required)
  ```json
  {
    "productId": "product_id",
    "quantity": 2
  }
  ```
- **PATCH** `/api/cart/item/:productId` - Update cart item quantity (Auth required)
- **DELETE** `/api/cart/item/:productId` - Remove item from cart (Auth required)

### Order Management
- **GET** `/api/orders/my-orders` - Get user's orders (Auth required)
- **GET** `/api/orders/:id` - Get single order by ID (Auth required)
- **POST** `/api/orders` - Create new order (Auth required)
  ```json
  {
    "items": [
      {
        "productId": "product_id",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra", 
      "zipCode": "400001",
      "country": "India",
      "phone": "+919876543210"
    },
    "paymentMethod": "cod"
  }
  ```
- **PATCH** `/api/orders/:id/cancel` - Cancel order (Auth required)

### Wishlist
- **GET** `/api/wishlist` - Get user's wishlist (Auth required)
- **POST** `/api/wishlist/add` - Add product to wishlist (Auth required)
- **DELETE** `/api/wishlist/:productId` - Remove product from wishlist (Auth required)

### Reviews
- **GET** `/api/reviews/product/:productId` - Get product reviews
- **GET** `/api/reviews/my-reviews` - Get user's reviews (Auth required)
- **POST** `/api/reviews` - Create review (Auth required)
- **PATCH** `/api/reviews/:id` - Update review (Auth required)

## Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [...] // Optional validation errors
}
```

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized  
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Features Implemented

### Core E-commerce Features
- ✅ User Authentication & Authorization
- ✅ Product Catalog with Search & Filtering
- ✅ Shopping Cart Management
- ✅ Order Processing & Management
- ✅ Wishlist Functionality
- ✅ Review System
- ✅ Artisan Profile Management

### Technical Features
- ✅ JWT-based Authentication
- ✅ Input Validation with Zod
- ✅ MongoDB with Mongoose ODM
- ✅ Rate Limiting & Security Headers
- ✅ Error Handling & Logging
- ✅ CORS Support
- ✅ RESTful API Design

### Database Models
- User (authentication, profiles)
- Product (inventory management)
- Artisan (creator profiles)
- Cart (shopping cart items)
- Order (order processing)
- Review (product reviews)
- Wishlist (saved products)

## Sample Data
The API comes pre-seeded with:
- 2 test users (including admin)
- 3 artisan profiles
- 3 sample products (pottery, textiles, metalwork)

## Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (120 requests per minute)
- Input sanitization
- JWT token authentication
- Password hashing with bcrypt

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run database seed
npm run seed

# Run comprehensive tests
./comprehensive-test.sh
```

The backend is fully functional and ready for frontend integration!