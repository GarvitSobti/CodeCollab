import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Hackathons from './pages/Hackathons';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/team" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
