import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, githubProvider, googleProvider } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          await api.post('/api/v1/auth/register-or-sync');
        } catch (error) {
          console.error('Failed to sync user profile:', error?.response?.data || error.message);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    user: firebaseUser,
    loading,
    isAuthenticated: Boolean(firebaseUser),
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signInWithGithub: () => signInWithPopup(auth, githubProvider),
    signInWithEmailPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
    registerWithEmailPassword: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    fetchProvidersByEmail: (email) => fetchSignInMethodsForEmail(auth, email),
    logout: () => signOut(auth),
  }), [firebaseUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
