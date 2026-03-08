# Hooks Directory

Custom React hooks for reusable logic.

## Structure

```
hooks/
├── useAuth.js          # Authentication hook
├── useSocket.js        # Socket.io connection hook
├── useLocalStorage.js  # Local storage management hook
├── useDebounce.js      # Debouncing hook
└── usePagination.js    # Pagination logic hook
```

## Examples

### `useAuth.js`

```javascript
import { useState, useEffect, useContext, createContext } from 'react';
import { login, register, logout, verifyToken } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken()
        .then((userData) => setUser(userData))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (credentials) => {
    const { token, user } = await login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### `useDebounce.js`

```javascript
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### `useLocalStorage.js`

```javascript
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};
```

### `useSocket.js`

```javascript
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
};
```
