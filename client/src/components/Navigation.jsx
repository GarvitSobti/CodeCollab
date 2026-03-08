import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/discover', icon: '✨', label: 'For You' },
    { path: '/hackathons', icon: '🚀', label: 'Hackathons' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">🤝</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">
            CodeCollab
          </span>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="relative px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <span className={`hidden md:block text-sm font-medium ${
                  isActive(item.path) ? 'text-white' : 'text-dark-300'
                }`}>
                  {item.label}
                </span>
              </span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <span className="text-xl">👤</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
