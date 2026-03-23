# CodeCollab

> Find the right people. Build something great.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)

---

Finding the right hackathon teammates is genuinely hard. You either end up with your same friends who have the same skill gaps, or you skip the event entirely. CodeCollab fixes that — a platform where students can discover hackathons, get matched with compatible teammates, and build teams worth competing with.

---

## Features

- **Swipe-based matching** — Browse and connect with potential teammates through an intuitive card-swipe interface
- **Smart recommendations** — Get matched based on complementary skills, experience level, and goals
- **Hackathon discovery** — Find events filtered by interest, skill level, and timeline
- **Peer reviews** — Honest, post-hackathon reviews (with anonymous option) so you know who you're teaming up with
- **Team workspace** — Manage your squad, track sprint tasks, and chat in one place
- **Real-time messaging** — Stay in sync with matches and teammates

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, React Router, Socket.io Client, Axios |
| Backend | Node.js, Express.js, Socket.io |
| Database | PostgreSQL 15, Sequelize ORM |
| Auth | Firebase Authentication |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/GarvitSobti/CodeCollab.git
cd CodeCollab

# Install all dependencies
npm run install-all

# Set up environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env
# Fill in your values (Firebase, DB credentials, JWT secret)

# Start both client and server
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3003

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for a full walkthrough including Firebase setup and database config.

---

## Project Structure

```
CodeCollab/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Navigation, SwipeContainer, etc.
│       ├── pages/        # Discover, Hackathons, Team, Messages, Profile
│       └── contexts/
├── server/          # Express backend
│   └── src/
│       ├── routes/
│       ├── models/
│       ├── controllers/
│       └── config/
└── docs/            # Architecture, API, DB schema
```

---

## Documentation

- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api.md)
- [Database Schema](docs/database-schema.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Contributing](CONTRIBUTING.md)

---

## Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/SaaiAravindhRaja">
        <img src="https://github.com/SaaiAravindhRaja.png" width="72" style="border-radius:12px"/><br/>
        <sub><b>Saai</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/nathan11474">
        <img src="https://github.com/nathan11474.png" width="72" style="border-radius:12px"/><br/>
        <sub><b>Nathan</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/GarvitSobti">
        <img src="https://github.com/GarvitSobti.png" width="72" style="border-radius:12px"/><br/>
        <sub><b>Garvit</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/wzinl">
        <img src="https://github.com/wzinl.png" width="72" style="border-radius:12px"/><br/>
        <sub><b>Zin</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Swayam4717">
        <img src="https://github.com/Swayam4717.png" width="72" style="border-radius:12px"/><br/>
        <sub><b>Swayam</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## License

MIT — see [LICENSE](LICENSE) for details.
