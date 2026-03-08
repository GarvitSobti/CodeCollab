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

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15.x or higher
- npm or yarn
- Git

### Installation

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Set up environment variables
# Copy .env.example to .env in both client/ and server/

# Run the application
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

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
*CS206: Software Product Management*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.