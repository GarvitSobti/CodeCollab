# CodeCollab Setup Guide

Complete step-by-step guide to get CodeCollab running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js 18.x or higher** - [Download](https://nodejs.org/)
- ✅ **PostgreSQL 15.x or higher** - [Download](https://www.postgresql.org/download/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **A code editor** (VS Code recommended)

## Step 1: Clone the Repository

```bash
# If you haven't initialized Git yet
cd CodeCollab
git init
git add .
git commit -m "Initial commit: Setup CodeCollab repository"

# Create a repository on GitHub, then:
git remote add origin https://github.com/yourusername/CodeCollab.git
git branch -M main
git push -u origin main
```

## Step 2: Install Dependencies

```bash
# Install root dependencies (for running both client and server)
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

## Step 3: Set Up PostgreSQL Database

### Create Database

```bash
# Option 1: Using psql command line
psql -U postgres
CREATE DATABASE codecollab;
\q

# Option 2: Using pgAdmin GUI
# Open pgAdmin → Right-click Databases → Create → Database → Name: "codecollab"
```

### Verify Connection

```bash
psql -U postgres -d codecollab
\conninfo
\q
```

## Step 4: Configure Firebase Authentication

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name your project: "CodeCollab" or similar
4. Disable Google Analytics (optional for development)
5. Click "Create Project"

### Enable Authentication Providers

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google**:
   - Click on Google → Enable
   - Set support email
   - Save
3. Enable **GitHub**:
   - Click on GitHub → Enable
   - Follow instructions to create GitHub OAuth App
   - Enter Client ID and Client Secret
   - Save

### Get Firebase Credentials

#### For Frontend (Public credentials):
1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to "Your apps" → Click **Web** icon (</>) to register web app
3. Register app with nickname "CodeCollab Client"
4. Copy the config values (apiKey, authDomain, etc.)

#### For Backend (Admin SDK):
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file securely (NEVER commit this to Git!)
4. Extract values: project_id, private_key, client_email

### Add Authorized Domains
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add `localhost` (should be there by default)
3. Later, add your production domain

## Step 5: Set Up Environment Variables

### Client Environment Variables

Create `client/.env`:

```bash
cd client
cp .env.example .env
```

Edit `client/.env` with your Firebase public credentials:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

### Server Environment Variables

Create `server/.env`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/codecollab
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codecollab
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your_super_secret_random_string_at_least_32_chars_long_change_this
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# SendGrid (optional for now)
SENDGRID_API_KEY=your_sendgrid_api_key_when_ready
SENDGRID_FROM_EMAIL=noreply@codecollab.sg

# CORS
CORS_ORIGIN=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

**Important Notes:**
- Replace `yourpassword` with your actual PostgreSQL password
- Generate a strong JWT_SECRET (use an online generator or `openssl rand -base64 32`)
- For FIREBASE_PRIVATE_KEY, copy from the JSON file, keep the `\n` characters

## Step 6: Initialize Database

The database will be automatically created when you first run the server. Sequelize will sync the models.

Alternatively, create a migration script in `server/src/config/migrate.js`:

```javascript
const sequelize = require('./database');
const { User, Skill, Hackathon, Review, Match } = require('../models');

const migrate = async () => {
  try {
    await sequelize.sync({ force: true }); // WARNING: This drops all tables!
    console.log('✅ Database synchronized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  }
};

migrate();
```

Run migration (if created):
```bash
cd server
npm run migrate
```

## Step 7: Run the Application

### Option 1: Run Both Client and Server Together

From the root directory:

```bash
npm run dev
```

This starts both:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Step 8: Verify Everything Works

### Test Backend

1. Open browser: http://localhost:5000
2. You should see: `{"message": "Welcome to CodeCollab API", ...}`

### Test Frontend

1. Open browser: http://localhost:3000
2. You should see the React app homepage

### Test Database Connection

Check server logs for:
```
✅ Database connection established successfully.
🚀 Server running on port 5000
```

## Troubleshooting

### Database Connection Issues

**Error: `ECONNREFUSED ::1:5432`**
- PostgreSQL is not running
- Start PostgreSQL service:
  - **Windows**: Open Services → Find PostgreSQL → Start
  - **Mac**: `brew services start postgresql`
  - **Linux**: `sudo systemctl start postgresql`

**Error: `password authentication failed`**
- Check DB_PASSWORD in `server/.env`
- Verify PostgreSQL user credentials

### Firebase Issues

**Error: `Firebase: Error (auth/invalid-api-key)`**
- Check REACT_APP_FIREBASE_API_KEY in `client/.env`
- Ensure no extra spaces or quotes

**Error: `Firebase Admin: Credential implementation error`**
- Check FIREBASE_PRIVATE_KEY format in `server/.env`
- Ensure `\n` characters are preserved
- Key should be enclosed in double quotes

### Port Already in Use

**Error: `EADDRINUSE :::5000`**
- Backend port 5000 is already in use
- Kill the process or change PORT in `server/.env`

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install-all
```

## Development Workflow

### Making Changes

1. **Frontend changes**: Edit files in `client/src/`, React hot-reloads automatically
2. **Backend changes**: Edit files in `server/src/`, nodemon auto-restarts server
3. **Database changes**: Update models in `server/src/models/`, re-sync database

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Testing

```bash
# Test backend (when tests are added)
cd server
npm test

# Test frontend (when tests are added)
cd client
npm test
```

## Next Steps

Now that your development environment is set up:

1. ✅ Read [Architecture Documentation](docs/architecture.md)
2. ✅ Review [API Documentation](docs/api.md)
3. ✅ Study [Database Schema](docs/database-schema.md)
4. ✅ Start implementing features!
5. ✅ Refer to [Contributing Guidelines](CONTRIBUTING.md)

## Need Help?

- Check the [README.md](README.md)
- Review documentation in `docs/` folder
- Check existing issues on GitHub
- Ask your team members

---

**You're all set! Happy coding! 🚀**
