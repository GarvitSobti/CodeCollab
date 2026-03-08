# Utilities Directory

Helper functions and utilities used across the application.

## Structure

```
utils/
├── validation.js    # Form validation helpers
├── formatters.js    # Data formatting functions
├── constants.js     # Application constants
└── helpers.js       # General helper functions
```

## Examples

### `validation.js`

```javascript
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!formData.password || !validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return errors;
};
```

### `formatters.js`

```javascript
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
```

### `constants.js`

```javascript
export const UNIVERSITIES = [
  'SMU', 'NUS', 'NTU', 'SUTD', 'SIT', 'SUSS'
];

export const SKILL_CATEGORIES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  MOBILE: 'mobile',
  DATA_SCIENCE: 'data_science',
  DESIGN: 'design',
};

export const EXPERIENCE_LEVELS = [
  'beginner',
  'intermediate',
  'advanced'
];

export const HACKATHON_DIFFICULTIES = [
  'beginner',
  'intermediate',
  'advanced'
];
```

### `helpers.js`

```javascript
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
```
