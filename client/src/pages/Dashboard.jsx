import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const Dashboard = () => {
  // Mock data - will be replaced with API calls
  const stats = {
    matches: 12,
    hackathons: 5,
    messages: 8,
  };

  const recentMatches = [
    { id: 1, name: 'Alex Chen', avatar: null, university: 'NUS' },
    { id: 2, name: 'Sarah Tan', avatar: null, university: 'NTU' },
    { id: 3, name: 'Marcus Lim', avatar: null, university: 'SMU' },
  ];

  const upcomingHackathons = [
    {
      id: 1,
      name: 'NUS Hack&Roll 2026',
      date: 'March 15-16, 2026',
      participants: 500,
    },
    {
      id: 2,
      name: 'NTU AI Hackathon',
      date: 'March 22-23, 2026',
      participants: 300,
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-dark-300">
              Ready to find your next hackathon teammate?
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🤝</span>
                <span className="text-3xl font-bold gradient-text">{stats.matches}</span>
              </div>
              <h3 className="text-lg font-semibold">Active Matches</h3>
              <p className="text-sm text-dark-400">People you've connected with</p>
            </div>

            <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🚀</span>
                <span className="text-3xl font-bold gradient-text">{stats.hackathons}</span>
              </div>
              <h3 className="text-lg font-semibold">Hackathons Joined</h3>
              <p className="text-sm text-dark-400">Your hackathon journey</p>
            </div>

            <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">💬</span>
                <span className="text-3xl font-bold gradient-text">{stats.messages}</span>
              </div>
              <h3 className="text-lg font-semibold">Unread Messages</h3>
              <p className="text-sm text-dark-400">New conversations</p>
            </div>
          </motion.div>

          {/* CTA Section - For You */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 md:p-12 mb-12 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20 relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 animate-pulse" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">✨</span>
                <h2 className="text-3xl font-bold gradient-text">Your personalized For You section</h2>
              </div>
              <p className="text-lg text-dark-200 mb-6">
                Discover teammates and teams matched to your skills and interests. Swipe to connect!
              </p>
              <Link to="/discover" className="btn-primary inline-block">
                Start Swiping →
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Matches */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Recent Matches</h2>
                  <Link to="/matches" className="text-primary-400 hover:text-primary-300 text-sm">
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-xl">{match.name?.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{match.name}</h3>
                        <p className="text-sm text-dark-400">{match.university}</p>
                      </div>
                      <button className="text-primary-400 hover:text-primary-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Hackathons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Upcoming Hackathons</h2>
                  <Link to="/hackathons" className="text-primary-400 hover:text-primary-300 text-sm">
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingHackathons.map((hackathon) => (
                    <div
                      key={hackathon.id}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <h3 className="font-semibold mb-2">{hackathon.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          📅 {hackathon.date}
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {hackathon.participants} participants
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
