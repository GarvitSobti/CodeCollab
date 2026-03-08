import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const Dashboard = () => {
  // Mock data
  const stats = {
    matches: 12,
    hackathons: 5,
    messages: 8,
  };

  const recentMatches = [
    { id: 1, name: 'Alex Chen', avatar: null, university: 'NUS', skills: ['React', 'Python'] },
    { id: 2, name: 'Sarah Tan', avatar: null, university: 'NTU', skills: ['Figma', 'TypeScript'] },
    { id: 3, name: 'Marcus Lim', avatar: null, university: 'SMU', skills: ['Go', 'Kubernetes'] },
  ];

  const upcomingHackathons = [
    {
      id: 1,
      name: 'NUS Hack&Roll 2026',
      date: 'March 15-16',
      participants: 500,
    },
    {
      id: 2,
      name: 'NTU AI Hackathon',
      date: 'March 22-23',
      participants: 300,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">
              Ready to find your next hackathon teammate?
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Matches</p>
                  <p className="text-3xl font-bold">{stats.matches}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hackathons</p>
                  <p className="text-3xl font-bold">{stats.hackathons}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-3xl font-bold">{stats.messages}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/discover" className="block">
              <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Start Discovering</h2>
                    <p className="text-muted-foreground">
                      Swipe through profiles to find your perfect teammate
                    </p>
                  </div>
                  <button className="btn-primary whitespace-nowrap">
                    Go to Discover
                    <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            {/* Recent Matches */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Recent Matches</h2>
                  <Link to="/messages" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                        {match.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{match.name}</p>
                        <p className="text-sm text-muted-foreground">{match.university}</p>
                      </div>
                      <div className="hidden sm:flex gap-1">
                        {match.skills.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="badge text-xs">{skill}</span>
                        ))}
                      </div>
                      <Link
                        to="/messages"
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Hackathons */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Upcoming Hackathons</h2>
                  <Link to="/hackathons" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {upcomingHackathons.map((hackathon) => (
                    <div
                      key={hackathon.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{hackathon.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {hackathon.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {hackathon.participants}
                            </span>
                          </div>
                        </div>
                        <button className="btn-secondary text-sm py-1.5 px-3">
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
