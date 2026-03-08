import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Hackathons from './pages/Hackathons';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
