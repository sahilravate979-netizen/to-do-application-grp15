# To-Do Application - Backend API Documentation

Base URL: http://localhost:3000/api/auth

## 1. User Registration

- Method: POST
- Endpoint: /register

Request Body:
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "password123"
}

## 2. User Login

- Method: POST
- Endpoint: /login

Request Body:
{
  "email": "test@gmail.com",
  "password": "password123"
}

## 3. User Profile

- Method: GET
- Endpoint: /profile
- Authentication: Bearer Token Required

## 4. Protected Test API

- Method: GET
- Endpoint: /test-protected
- Authentication: Bearer Token Required