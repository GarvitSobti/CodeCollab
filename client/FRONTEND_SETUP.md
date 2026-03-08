# CodeCollab Frontend Setup

## Installation

1. **Install dependencies** (if you haven't already):
   ```bash
   cd client
   npm install -D tailwindcss postcss autoprefixer framer-motion
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** to `http://localhost:3000`

## Features Implemented

### 🎨 **Unique Modern Design**
- Dark theme with gradient accents (blue/purple)
- Glass-morphism effects for cards
- Smooth animations and transitions
- Custom color palette (primary blue, accent purple)

### 💫 **Swipe Interface**
- Tinder-style card swiping with drag gestures
- Visual feedback (MATCH/NOPE overlays)
- Smooth animations using Framer Motion
- Undo functionality
- Action buttons (Pass ❌, Match ✅, Undo ↩️)

### 📱 **Pages Created**

1. **Home/Landing Page** (`/`)
   - Hero section with CTA
   - Features showcase
   - How it works
   - Call to action

2. **Login Page** (`/login`)
   - Email/password login
   - Google OAuth button
   - GitHub OAuth button
   - Beautiful gradient background

3. **Dashboard** (`/dashboard`)
   - Welcome section
   - Quick stats (matches, hackathons, messages)
   - Prominent "For You" CTA
   - Recent matches list
   - Upcoming hackathons

4. **For You/Discover Page** (`/discover`)
   - Mode toggle: Find Teammates vs Find Teams
   - Swipe card stack with smooth animations
   - Counter showing progress
   - Instructions card
   - End message when no more profiles

### 🧩 **Components Created**

1. **Navigation** - Top navigation bar with active state
2. **SwipeCard** - Individual profile card with drag functionality
3. **SwipeContainer** - Manages card stack and swipe logic

## Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and gestures
- **React Router** - Navigation

## Design Features

### Color Palette
- **Primary**: Blue gradient (#0ea5e9 → #0284c7)
- **Accent**: Purple/Pink gradient (#d946ef → #c026d3)
- **Dark**: Navy/Slate shades for backgrounds

### UI Elements
- Glass-morphism cards (`glass-card` class)
- Gradient buttons (`btn-primary`, `btn-secondary`)
- Gradient text (`gradient-text` class)
- Smooth hover effects and transforms

## Testing the Swipe Feature

1. Navigate to `/discover` or click "Start Swiping" from dashboard
2. Toggle between "Find Teammates" and "Find Teams"
3. **Drag cards** left/right or use buttons:
   - Drag right = Match ✅
   - Drag left = Pass ❌
   - Click Undo = Go back ↩️

## Mock Data

Currently using mock data for:
- User profiles (teammates)
- Team listings
- Dashboard stats
- Recent matches
- Upcoming hackathons

**TODO**: Connect to backend API endpoints

## Next Steps

1. ✅ Install dependencies
2. ✅ Test the app locally
3. Implement authentication (Firebase)
4. Connect to backend API
5. Add real-time messaging
6. Implement profile creation/editing
7. Add hackathon browsing
8. Implement matching algorithm integration

## Structure

```
src/
├── components/
│   ├── Navigation.jsx      # Top navigation bar
│   ├── SwipeCard.jsx       # Individual swipeable card
│   └── SwipeContainer.jsx  # Card stack manager
├── pages/
│   ├── Home.jsx           # Landing page
│   ├── Login.jsx          # Authentication
│   ├── Dashboard.jsx      # Main dashboard
│   └── Discover.jsx       # For You swipe section
├── App.js                 # Main app with routing
├── index.css              # Tailwind config + custom styles
└── App.css                # Minimal app styles
```

## Customization

To customize colors, edit `tailwind.config.js`:
- Change `primary` colors for main accent
- Change `accent` colors for secondary accent
- Modify animations and keyframes
