# API Routes

All routes are prefixed with `/api/v1`.

## Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Create user profile after Firebase sign-up |
| GET | `/auth/me` | Get current user's profile |
| PUT | `/auth/me` | Update current user's profile |

All routes except `/auth/register` require a valid Firebase JWT in the `Authorization` header.

## Users

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users/:id` | Get a user's public profile |
| GET | `/users/:id/reviews` | Get reviews for a user |
| GET | `/users/recommendations` | Get recommended collaborators |
| PUT | `/users/me/skills` | Update current user's skills |
| PUT | `/users/me/preferences` | Update matching preferences |

### Query Parameters for `/users/recommendations`

| Param | Type | Description |
|-------|------|-------------|
| `hackathonId` | string | Filter by shared hackathon interest |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

## Hackathons

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/hackathons` | List hackathons (with filters) |
| GET | `/hackathons/:id` | Get hackathon details |
| POST | `/hackathons/:id/interest` | Mark interest in a hackathon |
| DELETE | `/hackathons/:id/interest` | Remove interest |

### Query Parameters for `/hackathons`

| Param | Type | Description |
|-------|------|-------------|
| `difficulty` | string | Filter by difficulty level |
| `isOnline` | boolean | Online-only filter |
| `tags` | string | Comma-separated tag filter |
| `search` | string | Search by name/description |
| `upcoming` | boolean | Only show future hackathons |
| `page` | number | Page number |
| `limit` | number | Results per page |

## Teams

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/teams` | Create a new team for a hackathon |
| GET | `/teams/:id` | Get team details and members |
| GET | `/teams/me` | List current user's teams |
| PUT | `/teams/:id` | Update team (name, status) |

## Team Invites

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/teams/:id/invites` | Send an invite to a user |
| GET | `/invites/received` | List received invites |
| GET | `/invites/sent` | List sent invites |
| PUT | `/invites/:id` | Accept or reject an invite |

### Request Body for `PUT /invites/:id`

```json
{
  "status": "ACCEPTED" | "REJECTED"
}
```

## Reviews

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/reviews` | Write a review for a teammate |
| GET | `/users/:id/reviews` | Get reviews for a user |

### Request Body for `POST /reviews`

```json
{
  "targetUserId": "string",
  "teamId": "string",
  "rating": "POSITIVE" | "NEGATIVE",
  "content": "string (10-1000 chars)",
  "isAnonymous": false
}
```

## Notifications

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notifications` | List notifications (paginated) |
| PUT | `/notifications/:id/read` | Mark a notification as read |
| PUT | `/notifications/read-all` | Mark all as read |
| GET | `/notifications/preferences` | Get notification preferences |
| PUT | `/notifications/preferences` | Update notification preferences |

## Chat (WebSocket)

Team chat uses Socket.io. After connecting, authenticate by emitting:

```
socket.emit('authenticate', { token: '<firebase-jwt>' })
```

### Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `team:join` | Client → Server | `{ teamId }` |
| `team:leave` | Client → Server | `{ teamId }` |
| `message:send` | Client → Server | `{ teamId, content }` |
| `message:new` | Server → Client | `{ id, senderId, senderName, content, type, createdAt }` |
| `message:typing` | Client → Server | `{ teamId }` |
| `message:stop-typing` | Client → Server | `{ teamId }` |
| `notification:new` | Server → Client | `{ id, type, title, content }` |
