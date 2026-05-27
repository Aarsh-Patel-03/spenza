## Backend Requirements

To fully integrate this authentication system, your backend should provide the following endpoints:

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Request:**

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": null
  }
}
```

### 2. User Login

**Endpoint:** `POST /auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": null
  }
}
```

### 3. Token Verification (Optional)

**Endpoint:** `GET /auth/verify`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "valid": true
}
```

### 4. Refresh Token (Optional)

**Endpoint:** `POST /auth/refresh`

**Request:**

```json
{
  "token": "jwt_token_here"
}
```

**Response:**

```json
{
  "token": "new_jwt_token_here"
}
```

## Multi-User & Groups Setup

After authentication, implement these endpoints for group/shared content:

### 5. Create Group

**Endpoint:** `POST /groups`

**Request:**

```json
{
  "name": "Roommates",
  "description": "Shared expenses with roommates"
}
```

**Response:**

```json
{
  "id": "group_id",
  "name": "Roommates",
  "description": "Shared expenses with roommates",
  "createdBy": "user_id",
  "members": ["user_id"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 6. Add Member to Group

**Endpoint:** `POST /groups/:groupId/members`

**Request:**

```json
{
  "email": "member@example.com"
}
```

### 7. Get User Groups

**Endpoint:** `GET /groups`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
[
  {
    "id": "group_id",
    "name": "Roommates",
    "members": [...],
    "expenses": [...]
  }
]
```

## Error Handling

Backend should return appropriate HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Response format for errors:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Integration Steps

1. Update `BASE_URL` in `src/services/api.js`
2. Update request/response formats in `src/services/authService.js`
3. Test each endpoint before deployment
4. Handle all error cases appropriately
