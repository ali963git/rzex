# RZEX API Documentation

## Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.rzex.io/api/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limits

| Endpoint Type | Rate Limit |
|---------------|------------|
| Public API    | 120 req/min |
| Private API   | 60 req/min  |
| Order API     | 10 req/sec  |
| WebSocket     | 50 msg/sec  |

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| AUTHENTICATION_ERROR | 401 | Auth required |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT | 429 | Rate limit exceeded |
| INTERNAL | 500 | Server error |
| INSUFFICIENT_BALANCE | 400 | Not enough funds |

## Endpoints

See the main [README.md](../../README.md) for complete endpoint documentation.
