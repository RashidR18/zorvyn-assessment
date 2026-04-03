# Finance Data Processing and Access Control Backend

## Overview
This is a comprehensive Node.js backend built for a finance dashboard system. It implements robust user management, roles and permissions (Viewer, Analyst, Admin), financial record tracking, and dashboard summary APIs. 

Built with:
- Node.js & Express.js
- MongoDB & Mongoose
- Zod for Input Validation
- JSON Web Token (JWT) for Authentication

## Key Features
1. **User and Role Management**: 
   - JWT-based authentication
   - Roles: `Viewer` (sees dashboard summaries), `Analyst` (views records and dashboard), `Admin` (full CRUD access).
2. **Financial Records Management**:
   - Create, update, delete, view financial entries (Income/Expense).
   - Filter by date ranges, category, type.
3. **Dashboard Summaries API**:
   - Aggregation pipelines to compute total income, expenses, and net balance.
   - Monthly trend graphs, recent activities, and category-wise aggregation.
4. **Validation**:
   - Comprehensive input validation using **Zod**.
   - Custom error handling middleware for Mongoose, JWT, and generic API errors.

## Installation and Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy the example environment file and modify to fit your setup:
   ```bash
   cp .env.example .env
   ```
   *Make sure you provide a valid MongoDB connection string (e.g. `mongodb://localhost:27017/finance`).*

3. **Run the server**:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## Design Decisions
- **Architecture**: Organized into `routes` -> `controllers` -> `models` for separation of concerns and maintainability.
- **Validation Strategy**: Transitioning from model-level validation to route-level validation using Zod ensures that bad data is rejected before ever hitting the controller/DB logic.
- **Error Handling**: A custom `AppError` class alongside centralized error middleware encapsulates logic, avoids duplicated try-catch blocks using a `catchAsync` wrapper, and outputs clean error messages formatted perfectly for frontend ingestion.
- **Access Control**: Implemented through custom express middlewares (`protect` for JWT validation, `authorize` for Role checking) ensuring a streamlined declarative approach in routes.

## API Documentation
The API is grouped logically under `/api`.

### Auth & Users (`/api/auth`)
- `POST /register` - Register a new user (Viewer default)
- `POST /login` - Login to receive JWT token 
- `GET /me` - Get current user profile (Requires Auth)
- `GET /users`, `PUT /users/:id`, `DELETE /users/:id` - Manage users (Admin Auth required)

### Financial Records (`/api/records`)
- `GET /` - Advanced filtering/sorting for records (Analyst or Admin Auth required)
- `POST /` - Create a new record (Admin Auth required)
- `GET /:id` - Get single record details (Analyst or Admin Auth required)
- `PUT /:id` - Update record (Admin Auth required)
- `DELETE /:id` - Delete record (Admin Auth required)

### Dashboard (`/api/dashboard`)
- `GET /analytics` - Get aggregated dashboard data. Provides calculations, top categories, monthly trends (Auth required for Viewer, Analyst, Admin)

## Author
Prepared by Rashid Ali for Assessment Evaluation.
