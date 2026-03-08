# Components Directory

This directory contains reusable React components.

## Structure

Organize components by feature or type:

```
components/
├── common/              # Shared components used across the app
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Input.jsx
│   └── Spinner.jsx
├── layout/              # Layout components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Sidebar.jsx
│   └── Navigation.jsx
├── profile/             # Profile-related components
│   ├── ProfileCard.jsx
│   ├── SkillTag.jsx
│   └── ReviewCard.jsx
├── hackathon/           # Hackathon-related components
│   ├── HackathonCard.jsx
│   ├── HackathonFilter.jsx
│   └── HackathonDetail.jsx
├── matching/            # Matching-related components
│   ├── SwipeCard.jsx
│   ├── MatchCard.jsx
│   └── FilterPanel.jsx
└── messaging/           # Messaging-related components
    ├── ChatBubble.jsx
    ├── ConversationList.jsx
    └── MessageInput.jsx
```

## Component Naming Convention

- Use PascalCase for component files: `ProfileCard.jsx`
- Export as default: `export default ProfileCard;`
- Keep components focused and single-responsibility

## Example Component

```jsx
import React from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```
