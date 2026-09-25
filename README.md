# Mega Coat Paint & Chemical Management System

A full-stack paint store management system built for managing products, categories, inventory, sales, users, and business reports.

## Overview

Mega Coat Paint & Chemical Management System is a local business management application designed for paint and chemical stores.

The system provides separate administrative and cashier access, inventory tracking, stock movement management, sales processing, reporting, and store settings.

## Features

### Authentication and Authorization

- Secure JWT-based authentication
- Admin and cashier roles
- Protected API routes
- Role-based access control
- Active and inactive user accounts
- Password hashing with bcrypt
- Authentication rate limiting

### Dashboard

- Total products
- Inventory value
- Low-stock products
- Sales overview
- Revenue information
- Business performance summary

### Product Management

- Create products
- View products
- Search products
- Product details
- Product categories
- SKU management
- Cost and selling prices
- Reorder levels
- Product activation and deactivation
- Opening stock tracking

### Category Management

- Create categories
- View categories
- Activate and deactivate categories
- Assign products to categories

### Inventory Management

- Current stock levels
- Stock movement history
- Purchase stock
- Stock returns
- Stock adjustments
- Damage adjustments
- Stock-out protection
- Insufficient-stock validation
- Automatic stock movement records

### Sales

- Create sales
- Multiple items per sale
- Automatic stock reduction
- Sale references
- Sale details
- Sales history
- Automatic subtotal and total calculations
- Cost and profit tracking

### Reports

- Total sales
- Revenue
- Cost
- Profit
- Product sales performance
- Sales history

### User Management

- Create users
- Admin and cashier roles
- Activate and deactivate users
- User status management
- Protected administrative access

### Store Settings

- Store name
- Business type
- Address
- Phone number
- Email
- Currency settings

## Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- JWT
- bcryptjs
- Helmet
- CORS
- Express Rate Limit

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React

## Project Structure

```text
mega-coat-paint-management-system/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── generated/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
Requirements

Before running the project, install:

Node.js 20 or later
npm
Git
Installation

Clone the repository:

git clone https://github.com/mustyJose/mega-coat-paint-management-system.git

Enter the project:

cd mega-coat-paint-management-system
Backend Setup

Enter the backend directory:

cd backend

Install dependencies:

npm install

Create the environment file:

Copy-Item .env.example .env

Open .env and configure:

PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="8h"
SEED_ADMIN_PASSWORD="your-secure-admin-password"

Generate Prisma Client:

npx prisma generate

Create the database:

npx prisma migrate dev

Seed the initial administrator:

npm run db:seed

Start the backend:

npm run dev

The API runs at:

http://localhost:3000
Frontend Setup

Open another terminal and enter the frontend directory:

cd frontend

Install dependencies:

npm install

Create the environment file:

Copy-Item .env.example .env

The frontend environment should contain:

VITE_API_URL=http://localhost:3000/api

Start the frontend:

npm run dev

The frontend will normally be available at:

http://localhost:5173
Production Builds
Backend

From the backend directory:

npm run build
Frontend

From the frontend directory:

npm run build
API

The backend exposes REST API endpoints for:

/api/auth
/api/categories
/api/products
/api/inventory
/api/dashboard
/api/sales
/api/users

Authentication uses Bearer tokens:

Authorization: Bearer <token>
Security

The application includes:

JWT authentication
HS256 algorithm restriction
Password hashing
Role-based authorization
Active-user validation
Request rate limiting
Authentication rate limiting
Helmet security headers
CORS configuration
Request body size limits
Protected administrative endpoints
Transaction-based stock updates
Insufficient-stock protection
Environment-based secrets

Sensitive environment files and the local SQLite database are excluded from version control.

Database

The application uses SQLite for local storage through Prisma ORM.

The local database file is intentionally excluded from Git.

Prisma migrations are stored in:

backend/prisma/migrations/
User Roles
Administrator

Administrators can:

Manage users
Manage categories
Manage products
Manage inventory
Process sales
View reports
Manage store settings
Cashier

Cashiers can:

View dashboard
View products
View categories
Manage inventory operations
Process sales
Manage store settings

Administrative features such as user management and reports are restricted to administrators.

Testing

The system has been tested for:

Authentication
Invalid authentication tokens
User activation and deactivation
Role-based authorization
Product creation
Duplicate SKU validation
Category management
Stock receiving
Stock adjustments
Stock returns
Damage adjustments
Insufficient stock handling
Sales processing
Automatic stock reduction
Sales reporting
Profit calculations
User management
Frontend navigation
Production builds
Development Commands
Backend
npm run dev
npm run build
npm run start
npm run db:seed
Frontend
npm run dev
npm run build
npm run preview
Project Status

The core Mega Coat Paint & Chemical management system is complete and has passed the current functional and production-build verification.

Author

Mustapha Salawu

BSc Computer Science

GitHub: https://github.com/mustyJose