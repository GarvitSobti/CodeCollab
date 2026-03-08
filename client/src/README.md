# Client Source Directory Structure

This directory contains the React frontend application.

## Directory Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── services/        # API service layer
├── utils/           # Helper functions and utilities
├── hooks/           # Custom React hooks
├── contexts/        # React Context providers
├── assets/          # Static assets (images, fonts, etc.)
├── App.js           # Main App component
├── App.css          # App styles
├── index.js         # Entry point
└── index.css        # Global styles
```

## Component Organization

### components/
Reusable UI components that can be used across multiple pages:
- `Header.jsx`
- `Footer.jsx`
- `Button.jsx`
- `Card.jsx`
- `Modal.jsx`
- `ProfileCard.jsx`
- `HackathonCard.jsx`
- etc.

### pages/
Page-level components corresponding to routes:
- `Home.jsx`
- `Login.jsx`
- `Dashboard.jsx`
- `Profile.jsx`
- `Discover.jsx`
- `Hackathons.jsx`
- `Messages.jsx`
- etc.

### services/
API service layer for making HTTP requests:
- `api.js` - Axios configuration
- `authService.js` - Authentication API calls
- `userService.js` - User-related API calls
- `hackathonService.js` - Hackathon-related API calls
- `matchingService.js` - Matching algorithm API calls
- `messageService.js` - Messaging API calls

### utils/
Helper functions and utilities:
- `validation.js` - Form validation helpers
- `formatters.js` - Data formatting functions
- `constants.js` - Application constants

### hooks/
Custom React hooks:
- `useAuth.js` - Authentication hook
- `useSocket.js` - Socket.io hook
- `useLocalStorage.js` - Local storage hook

### contexts/
React Context providers:
- `AuthContext.jsx` - Authentication context
- `SocketContext.jsx` - Socket.io context
- `ThemeContext.jsx` - Theme context

### assets/
Static assets:
- `images/` - Image files
- `icons/` - Icon files
- `fonts/` - Custom fonts
