# Deployment Guide

This guide covers deploying CodeCollab to production using Vercel for both frontend and backend.

## Prerequisites

- GitHub account with the CodeCollab repository
- Vercel account (free tier works fine)
- PostgreSQL database (e.g., Heroku Postgres, AWS RDS, or Railway)
- Firebase project set up with Authentication enabled
- SendGrid account for email notifications

---

## 1. Database Setup

### Option A: Railway (Recommended for Students)

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Click "New" → "Database" → "PostgreSQL"
4. Copy the connection string from the "Connect" tab

### Option B: Heroku Postgres

1. Go to [Heroku](https://heroku.com)
2. Create a new app
3. Add "Heroku Postgres" addon (free tier)
4. Go to Settings → Reveal Config Vars → Copy `DATABASE_URL`

### Option C: AWS RDS

1. Create a PostgreSQL instance in AWS RDS
2. Note the endpoint, username, and password
3. Construct connection string: `postgresql://username:password@endpoint:5432/dbname`

### Initialize Database

```bash
# Connect to your database
psql <your_database_url>

# Run migrations
cd server
npm run migrate
```

---

## 2. Environment Variables

### Frontend Environment Variables (Vercel)

Create these in Vercel dashboard for the client:

```
REACT_APP_API_URL=https://your-api-domain.vercel.app
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Backend Environment Variables (Vercel)

Create these in Vercel dashboard for the server:

```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_very_secure_random_string_min_32_chars
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_private_key_with_newlines"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@codecollab.sg
GITHUB_API_TOKEN=your_github_token
CORS_ORIGIN=https://your-frontend-domain.vercel.app
SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

---

## 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication → Sign-in methods → Google & GitHub
4. Add authorized domains in Authentication settings
5. Go to Project Settings → Service Accounts → Generate new private key
6. Save the JSON file (you'll need values from it for backend env vars)

---

## 4. Deploy Backend to Vercel

### Step 1: Prepare Backend for Vercel

Create `server/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.js"
    }
  ]
}
```

### Step 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
6. Add all backend environment variables
7. Click "Deploy"

### Alternative: Vercel CLI

```bash
cd server
npm install -g vercel
vercel login
vercel --prod
```

---

## 5. Deploy Frontend to Vercel

### Step 1: Deploy via GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add all frontend environment variables
6. Click "Deploy"

### Alternative: Vercel CLI

```bash
cd client
vercel --prod
```

---

## 6. Custom Domain (Optional)

### Add Custom Domain on Vercel

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `codecollab.sg`)
4. Follow DNS configuration instructions
5. Update CORS settings in backend to allow your custom domain

### Update Environment Variables

After deploying, update:
- Backend `CORS_ORIGIN` to your frontend domain
- Frontend `REACT_APP_API_URL` to your backend domain

---

## 7. Post-Deployment Checklist

### Backend Verification

- [ ] Visit `https://your-backend.vercel.app/` - Should return API welcome message
- [ ] Check logs in Vercel dashboard for errors
- [ ] Test API endpoints with Postman/Insomnia
- [ ] Verify database connection

### Frontend Verification

- [ ] Visit your frontend URL
- [ ] Test user registration/login
- [ ] Check browser console for errors
- [ ] Test real-time messaging
- [ ] Verify API calls are reaching backend

### Security Checklist

- [ ] All environment variables are set correctly
- [ ] JWT secret is strong and secure
- [ ] CORS is configured to allow only your frontend domain
- [ ] Firebase Admin SDK credentials are correct
- [ ] Database connection uses SSL
- [ ] API rate limiting is enabled (add if needed)

---

## 8. Continuous Deployment

Vercel automatically deploys on every push to your main branch.

### Branch Deployments

- **main branch** → Production deployment
- **develop branch** → Preview deployment
- **feature branches** → Temporary preview URLs

Configure branch settings in Vercel dashboard.

---

## 9. Monitoring & Logging

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to project settings
2. Enable "Web Analytics"
3. View metrics in dashboard

### Error Tracking (Optional)

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for infrastructure monitoring

---

## 10. Scaling Considerations

### When to Scale

Monitor these metrics:
- Response times > 2 seconds
- Database connection pool exhausted
- Vercel function timeout errors

### Scaling Options

1. **Upgrade Vercel Plan**: Pro plan offers more resources
2. **Database Optimization**: Add indexes, connection pooling
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use Vercel's built-in CDN for static assets
5. **Load Balancing**: Split backend into microservices if needed

---

## 11. Backup Strategy

### Database Backups

**Railway**: Automatic daily backups included

**Heroku Postgres**:
```bash
heroku pg:backups:capture --app your-app-name
heroku pg:backups:download --app your-app-name
```

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore from Backup

```bash
psql $DATABASE_URL < backup.sql
```

---

## 12. Environment-Specific Configs

### Development
```bash
npm run dev
```

### Staging
```bash
VERCEL_ENV=preview vercel --prod
```

### Production
```bash
vercel --prod
```

---

## Troubleshooting

### Common Issues

**Issue**: "Cannot connect to database"
- **Solution**: Check `DATABASE_URL` format and SSL settings

**Issue**: "Firebase Auth not working"
- **Solution**: Verify authorized domains in Firebase console

**Issue**: "CORS errors"
- **Solution**: Check `CORS_ORIGIN` matches frontend URL exactly

**Issue**: "Vercel function timeout"
- **Solution**: Optimize database queries, add indexes

### View Logs

```bash
# Backend logs
vercel logs <deployment-url>

# Frontend logs
Check browser console and Network tab
```

---

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Vercel Community](https://github.com/vercel/vercel/discussions)
- Contact team via codecollab.sg@example.com

---

**Deployment Checklist Summary**
1. ✅ Database created and initialized
2. ✅ Environment variables configured
3. ✅ Firebase project set up
4. ✅ Backend deployed to Vercel
5. ✅ Frontend deployed to Vercel
6. ✅ Domain configured (if applicable)
7. ✅ All features tested in production
8. ✅ Monitoring enabled
