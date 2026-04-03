import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const PageLoadingContext = createContext();

export function usePageLoading() {
  return useContext(PageLoadingContext);
}

function LoadingBar({ isLoading }) {
  const [phase, setPhase] = useState('idle'); // idle | running | completing
  const timerRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      clearTimeout(timerRef.current);
      setPhase('running');
    } else if (phase === 'running') {
      setPhase('completing');
      timerRef.current = setTimeout(() => setPhase('idle'), 500);
    }
    return () => clearTimeout(timerRef.current);
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'idle') return null;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 200,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        key={phase === 'running' ? 'running' : 'completing'}
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent), var(--peach))',
          borderRadius: '0 2px 2px 0',
          transformOrigin: 'left',
        }}
        initial={{ scaleX: phase === 'completing' ? 0.7 : 0 }}
        animate={{
          scaleX: phase === 'completing' ? 1 : 0.7,
          opacity: phase === 'completing' ? [1, 1, 0] : 1,
        }}
        transition={{
          scaleX: {
            duration: phase === 'completing' ? 0.25 : 2.5,
            ease: phase === 'completing'
              ? [0.16, 1, 0.3, 1]
              : [0.1, 0.6, 0.2, 0.95],
          },
          opacity: {
            duration: phase === 'completing' ? 0.4 : 0,
            delay: phase === 'completing' ? 0.15 : 0,
          },
        }}
      />
    </motion.div>
  );
}

export function PageLoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const setPageLoading = useCallback((value) => {
    setIsLoading(value);
  }, []);

  return (
    <PageLoadingContext.Provider value={{ isLoading, setPageLoading }}>
      {children}
    </PageLoadingContext.Provider>
  );
}

export function NavLoadingBar() {
  const { isLoading } = usePageLoading();
  return <LoadingBar isLoading={isLoading} />;
}
