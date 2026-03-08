# Database Schema

## Overview

CodeCollab uses PostgreSQL as its primary database. The schema is designed to support user profiles, hackathon listings, team matching, peer reviews, and real-time messaging.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │────────▶│   Reviews    │◀────────│    Users    │
│             │  gives  │              │ receives│             │
└──────┬──────┘         └──────────────┘         └──────┬──────┘
       │                                                 │
       │                                                 │
       │ bookmarks                               creates │
       │                                                 │
       ▼                                                 ▼
┌─────────────┐                                 ┌─────────────┐
│ Hackathons  │                                 │   Matches   │
│             │                                 │             │
└─────────────┘                                 └─────────────┘
       │                                                 │
       │ participates                                    │
       │                                                 │
       ▼                                                 ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Teams     │◀────────│   Messages   │────────▶│Conversations│
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Tables

### 1. users

Stores user profile information.

| Column            | Type         | Constraints                  | Description                    |
|-------------------|--------------|------------------------------|--------------------------------|
| id                | SERIAL       | PRIMARY KEY                  | Unique user identifier         |
| firebase_uid      | VARCHAR(128) | UNIQUE                       | Firebase authentication UID    |
| email             | VARCHAR(255) | UNIQUE, NOT NULL             | User email                     |
| first_name        | VARCHAR(100) | NOT NULL                     | First name                     |
| last_name         | VARCHAR(100) | NOT NULL                     | Last name                      |
| university        | VARCHAR(100) |                              | University name                |
| year_of_study     | INTEGER      |                              | Current year (1-4)             |
| major             | VARCHAR(100) |                              | Field of study                 |
| bio               | TEXT         |                              | User biography                 |
| profile_picture   | VARCHAR(500) |                              | Profile image URL              |
| github_username   | VARCHAR(100) |                              | GitHub profile                 |
| linkedin_username | VARCHAR(100) |                              | LinkedIn profile               |
| portfolio_url     | VARCHAR(500) |                              | Personal website               |
| experience_level  | VARCHAR(20)  | DEFAULT 'beginner'           | beginner/intermediate/advanced |
| created_at        | TIMESTAMP    | DEFAULT NOW()                | Account creation timestamp     |
| updated_at        | TIMESTAMP    | DEFAULT NOW()                | Last update timestamp          |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_firebase_uid` on `firebase_uid`
- `idx_users_university` on `university`

---

### 2. skills

Stores available skills/technologies.

| Column     | Type         | Constraints   | Description            |
|------------|--------------|---------------|------------------------|
| id         | SERIAL       | PRIMARY KEY   | Unique skill ID        |
| name       | VARCHAR(100) | UNIQUE, NOT NULL | Skill name (e.g., "React") |
| category   | VARCHAR(50)  |               | frontend/backend/... |
| created_at | TIMESTAMP    | DEFAULT NOW() | When skill was added   |

---

### 3. user_skills

Junction table linking users to their skills.

| Column       | Type    | Constraints                     | Description          |
|--------------|---------|---------------------------------|----------------------|
| id           | SERIAL  | PRIMARY KEY                     | Unique record ID     |
| user_id      | INTEGER | FOREIGN KEY → users(id)         | User reference       |
| skill_id     | INTEGER | FOREIGN KEY → skills(id)        | Skill reference      |
| proficiency  | VARCHAR(20) | DEFAULT 'intermediate'      | beginner/intermediate/expert |
| created_at   | TIMESTAMP | DEFAULT NOW()                 | When skill was added |

**Indexes:**
- `idx_user_skills_user` on `user_id`
- `idx_user_skills_skill` on `skill_id`
- Unique constraint on `(user_id, skill_id)`

---

### 4. hackathons

Stores hackathon information.

| Column                  | Type         | Constraints   | Description                |
|-------------------------|--------------|---------------|----------------------------|
| id                      | SERIAL       | PRIMARY KEY   | Unique hackathon ID        |
| name                    | VARCHAR(255) | NOT NULL      | Hackathon name             |
| description             | TEXT         |               | Full description           |
| start_date              | DATE         | NOT NULL      | Start date                 |
| end_date                | DATE         | NOT NULL      | End date                   |
| registration_deadline   | DATE         |               | Registration cutoff        |
| location                | VARCHAR(255) |               | Physical/Virtual location  |
| difficulty              | VARCHAR(20)  |               | beginner/intermediate/advanced |
| theme                   | VARCHAR(100) |               | Hackathon theme            |
| max_team_size           | INTEGER      | DEFAULT 4     | Maximum team members       |
| prizes                  | TEXT         |               | Prize information          |
| website_url             | VARCHAR(500) |               | Official website           |
| devpost_url             | VARCHAR(500) |               | Devpost link               |
| sponsors                | TEXT[]       |               | Array of sponsors          |
| created_at              | TIMESTAMP    | DEFAULT NOW() | Record creation            |
| updated_at              | TIMESTAMP    | DEFAULT NOW() | Last update                |

**Indexes:**
- `idx_hackathons_start_date` on `start_date`
- `idx_hackathons_difficulty` on `difficulty`

---

### 5. bookmarks

Tracks user bookmarks for hackathons.

| Column         | Type      | Constraints                 | Description         |
|----------------|-----------|-----------------------------|---------------------|
| id             | SERIAL    | PRIMARY KEY                 | Unique bookmark ID  |
| user_id        | INTEGER   | FOREIGN KEY → users(id)     | User reference      |
| hackathon_id   | INTEGER   | FOREIGN KEY → hackathons(id)| Hackathon reference |
| created_at     | TIMESTAMP | DEFAULT NOW()               | When bookmarked     |

**Indexes:**
- `idx_bookmarks_user` on `user_id`
- Unique constraint on `(user_id, hackathon_id)`

---

### 6. matches

Stores user matches (mutual interest).

| Column     | Type      | Constraints             | Description                  |
|------------|-----------|-------------------------|------------------------------|
| id         | SERIAL    | PRIMARY KEY             | Unique match ID              |
| user_1_id  | INTEGER   | FOREIGN KEY → users(id) | First user                   |
| user_2_id  | INTEGER   | FOREIGN KEY → users(id) | Second user                  |
| status     | VARCHAR(20) | DEFAULT 'pending'     | pending/accepted/rejected    |
| matched_at | TIMESTAMP | DEFAULT NOW()           | When match was created       |
| updated_at | TIMESTAMP | DEFAULT NOW()           | Last status update           |

**Indexes:**
- `idx_matches_user1` on `user_1_id`
- `idx_matches_user2` on `user_2_id`
- Unique constraint on `(user_1_id, user_2_id)`

---

### 7. swipes

Tracks individual swipe actions (like/pass).

| Column        | Type      | Constraints             | Description           |
|---------------|-----------|-------------------------|-----------------------|
| id            | SERIAL    | PRIMARY KEY             | Unique swipe ID       |
| swiper_id     | INTEGER   | FOREIGN KEY → users(id) | User who swiped       |
| swiped_id     | INTEGER   | FOREIGN KEY → users(id) | User who was swiped   |
| action        | VARCHAR(10) | NOT NULL              | 'like' or 'pass'      |
| created_at    | TIMESTAMP | DEFAULT NOW()           | When swipe occurred   |

**Indexes:**
- `idx_swipes_swiper` on `swiper_id`
- Unique constraint on `(swiper_id, swiped_id)`

---

### 8. reviews

Stores peer reviews after hackathon collaboration.

| Column        | Type      | Constraints             | Description                |
|---------------|-----------|-------------------------|----------------------------|
| id            | SERIAL    | PRIMARY KEY             | Unique review ID           |
| reviewer_id   | INTEGER   | FOREIGN KEY → users(id) | User giving review         |
| reviewee_id   | INTEGER   | FOREIGN KEY → users(id) | User being reviewed        |
| hackathon_id  | INTEGER   | FOREIGN KEY → hackathons(id) | Associated hackathon  |
| rating        | INTEGER   | CHECK (1-5)             | Star rating (1-5)          |
| comment       | TEXT      |                         | Written feedback           |
| created_at    | TIMESTAMP | DEFAULT NOW()           | Review submission time     |
| updated_at    | TIMESTAMP | DEFAULT NOW()           | Last edit time             |

**Indexes:**
- `idx_reviews_reviewee` on `reviewee_id`
- Unique constraint on `(reviewer_id, reviewee_id, hackathon_id)`

---

### 9. conversations

Stores conversation metadata (direct or group chats).

| Column           | Type      | Constraints   | Description                   |
|------------------|-----------|---------------|-------------------------------|
| id               | SERIAL    | PRIMARY KEY   | Unique conversation ID        |
| type             | VARCHAR(20) | NOT NULL    | 'direct' or 'group'           |
| name             | VARCHAR(255) |            | Group name (if applicable)    |
| created_at       | TIMESTAMP | DEFAULT NOW() | Conversation creation time    |
| last_message_at  | TIMESTAMP |               | Last message timestamp        |

---

### 10. conversation_participants

Junction table for conversation members.

| Column          | Type      | Constraints                      | Description              |
|-----------------|-----------|----------------------------------|--------------------------|
| id              | SERIAL    | PRIMARY KEY                      | Unique record ID         |
| conversation_id | INTEGER   | FOREIGN KEY → conversations(id)  | Conversation reference   |
| user_id         | INTEGER   | FOREIGN KEY → users(id)          | Participant reference    |
| joined_at       | TIMESTAMP | DEFAULT NOW()                    | When user joined         |

**Indexes:**
- `idx_conversation_participants_conv` on `conversation_id`
- `idx_conversation_participants_user` on `user_id`
- Unique constraint on `(conversation_id, user_id)`

---

### 11. messages

Stores chat messages.

| Column          | Type      | Constraints                     | Description              |
|-----------------|-----------|---------------------------------|--------------------------|
| id              | SERIAL    | PRIMARY KEY                     | Unique message ID        |
| conversation_id | INTEGER   | FOREIGN KEY → conversations(id) | Conversation reference   |
| sender_id       | INTEGER   | FOREIGN KEY → users(id)         | Message sender           |
| content         | TEXT      | NOT NULL                        | Message text             |
| read            | BOOLEAN   | DEFAULT FALSE                   | Read status              |
| created_at      | TIMESTAMP | DEFAULT NOW()                   | Message timestamp        |

**Indexes:**
- `idx_messages_conversation` on `conversation_id`
- `idx_messages_sender` on `sender_id`
- `idx_messages_created` on `created_at DESC`

---

## Sample Queries

### Get user with skills
```sql
SELECT u.*, array_agg(s.name) as skills
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
WHERE u.id = 1
GROUP BY u.id;
```

### Get user's average rating
```sql
SELECT AVG(rating) as average_rating, COUNT(*) as review_count
FROM reviews
WHERE reviewee_id = 1;
```

### Get matched users
```sql
SELECT u.*
FROM users u
JOIN matches m ON (u.id = m.user_1_id OR u.id = m.user_2_id)
WHERE (m.user_1_id = 1 OR m.user_2_id = 1)
  AND m.status = 'accepted'
  AND u.id != 1;
```

### Get upcoming hackathons
```sql
SELECT *
FROM hackathons
WHERE start_date > NOW()
ORDER BY start_date ASC
LIMIT 10;
```

---

## Migration Script

Run the migration to create all tables:
```bash
cd server
npm run migrate
```

The migration script is located at `server/src/config/migrate.js`.
