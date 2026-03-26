# API Documentation

Base URL: `http://localhost:3003/api` (development)

All endpoints return JSON responses.

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "university": "SMU"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Verify Token
```http
GET /api/auth/verify
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

---

## User Endpoints

### Get User Profile
```http
GET /api/users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "university": "SMU",
  "yearOfStudy": 2,
  "skills": ["React", "Node.js", "Python"],
  "bio": "Passionate developer...",
  "github": "johndoe",
  "linkedin": "johndoe"
}
```

### Update User Profile
```http
PUT /api/users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "skills": ["React", "Node.js", "Python", "PostgreSQL"],
  "github": "johndoe",
  "linkedin": "johndoe"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

### Get User by ID
```http
GET /api/users/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 2,
  "firstName": "Jane",
  "lastName": "Smith",
  "university": "NUS",
  "skills": ["Python", "Machine Learning"],
  "bio": "AI enthusiast...",
  "averageRating": 4.5,
  "reviewCount": 10
}
```

---

## Hackathon Endpoints

### List Hackathons
```http
GET /api/hackathons?page=1&limit=10&difficulty=beginner
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `difficulty` (optional): beginner|intermediate|advanced
- `theme` (optional): Filter by theme

**Response:**
```json
{
  "hackathons": [
    {
      "id": 1,
      "name": "SMU Hack 2026",
      "description": "Annual SMU hackathon...",
      "startDate": "2026-04-15",
      "endDate": "2026-04-17",
      "location": "Singapore",
      "difficulty": "beginner",
      "prizes": "$10,000",
      "theme": "Sustainability"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Get Hackathon Details
```http
GET /api/hackathons/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "SMU Hack 2026",
  "description": "Detailed description...",
  "startDate": "2026-04-15",
  "endDate": "2026-04-17",
  "registrationDeadline": "2026-04-01",
  "maxTeamSize": 4,
  "prizes": "$10,000",
  "sponsors": ["Company A", "Company B"],
  "website": "https://smuhack.sg"
}
```

### Bookmark Hackathon
```http
POST /api/hackathons/bookmark
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "hackathonId": 1
}
```

**Response:**
```json
{
  "message": "Hackathon bookmarked successfully"
}
```

---

## Matching Endpoints

### Discover Potential Matches
```http
GET /api/matching/discover?skills=React,Node.js&limit=20
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `skills` (optional): Comma-separated list
- `experience` (optional): beginner|intermediate|advanced
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "matches": [
    {
      "id": 5,
      "firstName": "Alice",
      "university": "NTU",
      "skills": ["Python", "TensorFlow"],
      "matchScore": 85,
      "averageRating": 4.7
    }
  ]
}
```

### Swipe on User
```http
POST /api/matching/swipe
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "targetUserId": 5,
  "action": "like"
}
```

**Actions:** `like` | `pass`

**Response:**
```json
{
  "message": "Swipe recorded",
  "matched": true
}
```

### Get Matches
```http
GET /api/matching/matches
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "matches": [
    {
      "matchId": 10,
      "user": {
        "id": 5,
        "firstName": "Alice",
        "skills": ["Python", "TensorFlow"]
      },
      "matchedAt": "2026-03-05T10:30:00Z"
    }
  ]
}
```

---

## Review Endpoints

### Create Review
```http
POST /api/reviews
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "targetUserId": 5,
  "rating": 5,
  "comment": "Great teammate, very reliable!",
  "hackathonId": 1
}
```

**Response:**
```json
{
  "message": "Review submitted successfully",
  "review": { /* review object */ }
}
```

### Get User Reviews
```http
GET /api/reviews/user/:userId
```

**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Great teammate...",
      "reviewer": {
        "firstName": "John",
        "lastName": "D."
      },
      "createdAt": "2026-02-20T10:00:00Z"
    }
  ],
  "averageRating": 4.5
}
```

---

## Message Endpoints

### Get Conversations
```http
GET /api/messages/conversations
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "participants": [
        { "id": 2, "firstName": "Jane" }
      ],
      "lastMessage": "See you at the hackathon!",
      "lastMessageAt": "2026-03-08T09:45:00Z",
      "unreadCount": 2
    }
  ]
}
```

### Get Messages in Conversation
```http
GET /api/messages/conversation/:conversationId
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "senderId": 2,
      "content": "Hey! Want to team up?",
      "createdAt": "2026-03-08T09:30:00Z",
      "read": true
    }
  ]
}
```

### Send Message
```http
POST /api/messages
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "recipientId": 2,
  "content": "Sure, let's do it!"
}
```

**Response:**
```json
{
  "message": "Message sent",
  "messageId": 123
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "code": "VALIDATION_ERROR"
  }
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **General Endpoints:** 100 requests per 15 minutes per IP
- **Authentication:** 5 requests per 15 minutes per IP
- **Messaging:** 50 messages per hour per user

Exceeded rate limits return `429 Too Many Requests`.
