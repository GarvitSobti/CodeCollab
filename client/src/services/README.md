# Services Directory

This directory contains API service modules for communicating with the backend.

## Structure

```
services/
├── api.js              # Axios configuration and interceptors
├── authService.js      # Authentication API calls
├── userService.js      # User-related API calls
├── hackathonService.js # Hackathon-related API calls
├── matchingService.js  # Matching algorithm API calls
├── reviewService.js    # Review-related API calls
└── messageService.js   # Messaging API calls
```

## API Service Pattern

Each service file should export functions for specific API operations.

### Example: `api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example: `userService.js`

```javascript
import api from './api';

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
```

## Usage in Components

```javascript
import { getUserProfile, updateUserProfile } from '../services/userService';

const ProfilePage = () => {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);
};
```
