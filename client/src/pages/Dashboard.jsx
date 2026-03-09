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
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Ready to find your next hackathon teammate?
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
          >
            <div className="card-hover p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-smooth">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">{stats.matches}</span>
              </div>
              <h3 className="text-base font-semibold mb-0.5 tracking-tight">Active Matches</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">People you've connected with</p>
            </div>

            <div className="card-hover p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-smooth">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-br from-accent-500 to-accent-600 bg-clip-text text-transparent">{stats.hackathons}</span>
              </div>
              <h3 className="text-base font-semibold mb-0.5 tracking-tight">Hackathons Joined</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your hackathon journey</p>
            </div>

            <div className="card-hover p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-smooth">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-br from-success-500 to-success-600 bg-clip-text text-transparent">{stats.messages}</span>
              </div>
              <h3 className="text-base font-semibold mb-0.5 tracking-tight">Unread Messages</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">New conversations</p>
            </div>
          </motion.div>

          {/* CTA Section - For You */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card-hover p-8 md:p-10 mb-10 gradient-mesh border-primary-200/50 dark:border-primary-800/50"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-indigo">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Discover Your Perfect Match</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">
              Find teammates and teams matched to your skills and interests. Swipe to connect!
            </p>
            <Link to="/discover" className="btn-primary inline-block">
              Start Discovering
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Matches */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card-hover p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold tracking-tight">Recent Matches</h2>
                  <Link to="/matches" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold">
                    View All
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-150 cursor-pointer border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60"
                    >
                      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-smooth">
                        <span className="text-white font-semibold text-sm">{match.name?.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm tracking-tight">{match.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{match.university}</p>
                      </div>
                      <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="card-hover p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold tracking-tight">Upcoming Hackathons</h2>
                  <Link to="/hackathons" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingHackathons.map((hackathon) => (
                    <div
                      key={hackathon.id}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-150 cursor-pointer border border-gray-200/40 dark:border-gray-700/40 hover:border-primary-300/60 dark:hover:border-primary-700/60 hover:shadow-smooth"
                    >
                      <h3 className="font-semibold text-sm mb-2.5 tracking-tight">{hackathon.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {hackathon.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {hackathon.participants} participants
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
