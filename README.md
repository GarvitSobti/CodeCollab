# CodeCollab 🚀

> **Smart hackathon teammate discovery platform for Singapore university students**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)

---

## 📖 Overview

**CodeCollab** is a web platform that connects university students in Singapore for hackathon collaboration. We solve the critical pain point of finding reliable teammates with complementary skills beyond your immediate friend circle.

### The Problem

- **91.7%** of students find their friends too busy or not interested in hackathons
- **70.8%** struggle to find teammates with complementary skills
- **62.5%** can't judge the reliability of potential teammates they haven't worked with
- **50%** don't know where to look beyond their friend group

### Our Solution

CodeCollab combines **smart skill-based matching**, **peer reviews**, and **hackathon discovery** in one platform — helping students find the right teammates, build trust, and discover opportunities.

---

## ✨ Key Features

### 🎯 Smart Collaborator Matching
- AI-powered matching algorithm that pairs users with **complementary** (not just similar) skills
- Filter by programming languages, experience level, availability, and interests
- Swipe-based interface for quick teammate discovery

### ⭐ Peer Review System
- Rate teammates on collaboration quality, technical skills, and reliability
- Build trust before committing to a team
- Transparent, verified reviews from past hackathons

### 🏆 Curated Hackathon Discovery
- Browse upcoming hackathons in Singapore with filters for difficulty, theme, and prizes
- Integrated with Devpost and other hackathon platforms
- Bookmark and track hackathons you're interested in

### 💬 Real-Time Messaging
- Direct messaging and group chats
- Coordinate with potential teammates before forming a team
- In-app notifications for invites and messages

### 👤 Rich User Profiles
- Showcase your skills, past projects, and GitHub repositories
- Link to portfolio, LinkedIn, and social profiles
- Display peer reviews and hackathon history

---

## 🛠️ Tech Stack

### Frontend
- **React.js 18.x** - Component-based UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time messaging
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js 18.x** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL 15.x** - Relational database
- **Sequelize** - ORM for database management
- **Socket.io** - Real-time bidirectional communication
- **Firebase Auth** - OAuth authentication (Google, GitHub)

### Infrastructure & Tools
- **Vercel** - Frontend hosting
- **Vercel Serverless Functions** - Backend hosting (or alternative free-tier cloud)
- **SendGrid** - Email notifications
- **GitHub API** - Optional skill verification
- **Devpost API** - Hackathon listings

---

## 🏗️ Project Structure

```
CodeCollab/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Helper functions
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React Context providers
│   │   └── assets/        # Images, fonts, etc.
│   └── package.json
│
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models (Sequelize)
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── docs/                  # Documentation
│   ├── architecture.md    # System architecture
│   ├── api.md            # API documentation
│   ├── database-schema.md # Database design
│   └── deployment.md     # Deployment guide
│
└── .github/              # GitHub configuration
    ├── workflows/        # CI/CD workflows
    └── ISSUE_TEMPLATE/   # Issue templates
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 15.x or higher
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CodeCollab.git
   cd CodeCollab
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in both `client/` and `server/` directories:

   **client/.env**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

   **server/.env**
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/codecollab
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   SENDGRID_API_KEY=your_sendgrid_api_key
   GITHUB_API_TOKEN=your_github_token
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb codecollab

   # Run migrations
   cd server
   npm run migrate
   ```

5. **Run the application**

   Open two terminal windows:

   **Terminal 1 - Frontend**
   ```bash
   cd client
   npm start
   ```
   Frontend runs on `http://localhost:3000`

   **Terminal 2 - Backend**
   ```bash
   cd server
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

---

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Database Schema](docs/database-schema.md)
- [Deployment Guide](docs/deployment.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👥 Team

**G3T3 - Singapore Management University**

- Developer 1
- Developer 2
- Developer 3
- Developer 4
- Developer 5

*IS112: Innovation and Digital Enterprise Project*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Project Roadmap

### Phase 1: MVP (Weeks 1-11)
- ✅ Market research and validation
- ⬜ Core authentication (Google, GitHub OAuth)
- ⬜ User profiles and skill tagging
- ⬜ Basic matching algorithm
- ⬜ Hackathon discovery integration
- ⬜ Peer review system
- ⬜ Real-time messaging
- ⬜ Deployment on Vercel

### Phase 2: Growth (Months 3-6)
- ⬜ Advanced matching filters
- ⬜ Profile analytics
- ⬜ Email notifications
- ⬜ Mobile-responsive optimizations
- ⬜ SMU campus launch

### Phase 3: Scale (Months 6-18)
- ⬜ Expansion to NUS, NTU, SUTD
- ⬜ Freemium features
- ⬜ Hackathon organizer partnerships
- ⬜ Corporate recruitment features

---

## 📞 Contact

For questions or support, please open an issue or contact us at:
- **Email**: codecollab.sg@example.com
- **Telegram**: @CodeCollabSG

---

<p align="center">Made with ❤️ by students, for students</p>
