import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Placeholder components - will be implemented later
const Home = () => <div><h1>Welcome to CodeCollab</h1><p>Find your perfect hackathon teammates</p></div>;
const Login = () => <div><h1>Login</h1></div>;
const Dashboard = () => <div><h1>Dashboard</h1></div>;
const Profile = () => <div><h1>Profile</h1></div>;
const Discover = () => <div><h1>Discover Teammates</h1></div>;
const Hackathons = () => <div><h1>Browse Hackathons</h1></div>;
const Messages = () => <div><h1>Messages</h1></div>;

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
