import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  const fetchOnboardingStatus = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/profile/me');
      setOnboardingCompleted(Boolean(response?.data?.profile?.onboardingCompleted));
    } catch (error) {
      console.error('Failed to load onboarding status:', error?.response?.data || error.message);
      setOnboardingCompleted(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setOnboardingLoading(true);
      setFirebaseUser(user);

      if (user) {
        try {
          await api.post('/api/v1/auth/register-or-sync');
          await fetchOnboardingStatus();
        } catch (error) {
          console.error('Failed to sync user profile:', error?.response?.data || error.message);
          setOnboardingCompleted(false);
        }
      } else {
        setOnboardingCompleted(false);
      }

      setLoading(false);
      setOnboardingLoading(false);
    });

    return unsubscribe;
  }, [fetchOnboardingStatus]);

  const value = useMemo(() => ({
    user: firebaseUser,
    loading,
    onboardingLoading,
    onboardingCompleted,
    isAuthenticated: Boolean(firebaseUser),
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signInWithGithub: () => signInWithPopup(auth, githubProvider),
    signInWithEmailPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
    registerWithEmailPassword: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    checkUserExistsByEmail: async (email) => {
      const response = await api.get('/api/v1/auth/user-exists', { params: { email } });
      return Boolean(response?.data?.exists);
    },
    fetchProvidersByEmail: (email) => fetchSignInMethodsForEmail(auth, email),
    refreshOnboardingStatus: fetchOnboardingStatus,
    logout: () => signOut(auth),
  }), [firebaseUser, loading, onboardingLoading, onboardingCompleted]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
