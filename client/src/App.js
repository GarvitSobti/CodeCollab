import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';

// Placeholder components - will be implemented later
const Profile = () => <div><h1>Profile</h1></div>;
const Hackathons = () => <div><h1>Browse Hackathons</h1></div>;
const Messages = () => <div><h1>Messages</h1></div>;

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
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
