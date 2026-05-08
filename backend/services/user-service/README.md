# User Service Documentation

## Overview

The User Service handles all user-related operations including:
- User registration and authentication
- Profile management
- KYC/AML verification
- 2FA management
- Audit logging

## Endpoints

### Authentication

#### POST /api/auth/register

Register a new user.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "kyc_status": "pending",
    "created_at": "2026-05-08T00:00:00Z"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login

Login user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "kyc_status": "pending"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/logout

Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Profile

#### GET /api/users/me

Get current user profile (requires authentication).

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "kyc_status": "pending",
  "two_fa_enabled": false,
  "phone_number": "+1234567890",
  "country": "US",
  "created_at": "2026-05-08T00:00:00Z"
}
```

#### PUT /api/users/me

Update user profile (requires authentication).

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "country": "US"
}
```

#### POST /api/auth/change-password

Change user password (requires authentication).

**Request:**
```json
{
  "oldPassword": "old_password",
  "newPassword": "new_password_123"
}
```

### KYC Verification

#### POST /api/kyc/verify

Initiate KYC verification (requires authentication).

**Request:**
```json
{
  "documentType": "passport",
  "documentNumber": "ABC123456",
  "verificationData": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "KYC verification initiated",
  "status": "pending"
}
```

## Environment Variables

```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=rzex_db
DB_USER=rzex_user
DB_PASSWORD=password
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
PORT=3000
LOG_LEVEL=debug
```

## Dependencies

- Express.js
- PostgreSQL
- Redis
- JWT
- bcryptjs

## Testing

```bash
npm test
```
