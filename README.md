# CodeCollab

> A web platform for university students to connect and collaborate on hackathons

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)

---

## 📖 Overview

CodeCollab is a full-stack web application built for a university software engineering course project. The platform facilitates team formation and collaboration for hackathon events.

---

## ✨ Features

- User authentication and profile management
- Hackathon discovery and browsing
- Team formation tools
- Real-time messaging
- Peer review system

---

## 🛠️ Tech Stack

### Frontend
- React.js 18.x
- React Router
- Axios
- Socket.io Client

### Backend
- Node.js 18.x
- Express.js
- PostgreSQL 15.x
- Sequelize ORM
- Socket.io
- Firebase Authentication

### Deployment
- Vercel (Frontend & Backend)

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

---Setup Guide](SETUP_GUIDE.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

## 👥 Team

**G3T3** - Singapore Management University  
*IS112: Innovation and Digital Enterprise Project*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.