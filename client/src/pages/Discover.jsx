import React from 'react';
import Navigation from '../components/Navigation';
import SwipeContainer from '../components/SwipeContainer';

export default function Discover() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      <Navigation />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 72,
      }}>
        <SwipeContainer />
      </div>
    </div>
  );
}
