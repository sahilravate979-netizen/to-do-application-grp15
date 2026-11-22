# To-Do Application - Backend API Documentation

## Base URL

Authentication: `http://localhost:3000/api/auth`

Admin: `http://localhost:3000/api/admin`

## 1. User Registration

- **Method:** POST
- **Endpoint:** `/api/auth/register`

**Request Body:**
```json
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "password123"
}
```

## 2. User Login

- **Method:** POST
- **Endpoint:** `/api/auth/login`

**Request Body:**
```json
{
  "email": "test@gmail.com",
  "password": "password123"
}
```

Returns an authentication token and user role (`User` or `Admin`).

## 3. User Profile

- **Method:** GET
- **Endpoint:** `/api/auth/profile`
- **Authentication:** Bearer Token Required

## 4. Protected Test API

- **Method:** GET
- **Endpoint:** `/api/auth/test-protected`
- **Authentication:** Bearer Token Required

# Admin APIs

All Admin APIs require an Admin Bearer Token.

## 5. Admin Login

- **Method:** POST
- **Endpoint:** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin12345"
}
```

## 6. View All Registered Users

- **Method:** GET
- **Endpoint:** `/api/admin/users`
- **Authentication:** Admin Bearer Token Required

Returns all registered users with their user ID, name, email, role and registration date.

## 7. View Tasks of a Particular User

- **Method:** GET
- **Endpoint:** `/api/admin/users/:userId/tasks`
- **Authentication:** Admin Bearer Token Required

**Example:**
`http://localhost:3000/api/admin/users/4/tasks`

Returns the selected user's details and their tasks, including task status, priority and deadline.

## 8. View Overall Task Progress

- **Method:** GET
- **Endpoint:** `/api/admin/progress`
- **Authentication:** Admin Bearer Token Required

Returns task statistics for each normal user:

- Total Tasks
- Pending Tasks
- In Progress Tasks
- Completed Tasks

## Access Control

- **User:** Can access normal user functionalities.
- **Admin:** Can access Admin functionalities.
- Normal Users cannot access Admin APIs.
- Unauthorized requests receive `401 Unauthorized` or `403 Forbidden`, depending on the authentication failure.