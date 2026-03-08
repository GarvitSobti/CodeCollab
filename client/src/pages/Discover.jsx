import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import SwipeContainer from '../components/SwipeContainer';

const Discover = () => {
  const [mode, setMode] = useState('teammates'); // 'teammates' or 'teams'
  
  // Mock data - will be replaced with API calls
  const mockTeammates = [
    {
      id: 1,
      name: 'Alex Chen',
      university: 'NUS',
      avatar: null,
      bio: 'Full-stack developer passionate about AI and ML. Looking for teammates to build innovative solutions at hackathons!',
      skills: ['React', 'Node.js', 'Python', 'TensorFlow', 'AWS', 'Docker'],
      hackathonsCount: 8,
      projectsCount: 15,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Sarah Tan',
      university: 'NTU',
      avatar: null,
      bio: 'UI/UX designer & frontend dev. Love creating beautiful, user-friendly interfaces. Let\'s build something amazing together!',
      skills: ['Figma', 'React', 'TypeScript', 'Tailwind', 'Animation'],
      hackathonsCount: 5,
      projectsCount: 12,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Marcus Lim',
      university: 'SMU',
      avatar: null,
      bio: 'Backend engineer & DevOps enthusiast. Experienced in building scalable systems and cloud infrastructure.',
      skills: ['Go', 'Kubernetes', 'PostgreSQL', 'Redis', 'gRPC'],
      hackathonsCount: 12,
      projectsCount: 20,
      rating: 4.7,
    },
    {
      id: 4,
      name: 'Priya Kumar',
      university: 'NUS',
      avatar: null,
      bio: 'Data scientist & ML engineer. Passionate about solving real-world problems with AI and analytics.',
      skills: ['Python', 'PyTorch', 'Pandas', 'SQL', 'Jupyter'],
      hackathonsCount: 6,
      projectsCount: 10,
      rating: 4.6,
    },
  ];

  const mockTeams = [
    {
      id: 1,
      name: 'AI Innovators',
      university: 'NUS',
      avatar: null,
      bio: 'Building an AI-powered study assistant. Looking for a frontend developer to join our team!',
      skills: ['Python', 'TensorFlow', 'React', 'Firebase'],
      hackathonsCount: 3,
      projectsCount: 1,
      rating: 4.5,
      membersCount: 3,
      lookingFor: 'Frontend Developer',
    },
    {
      id: 2,
      name: 'GreenTech Squad',
      university: 'NTU',
      avatar: null,
      bio: 'Creating a sustainability tracking app. Need a backend engineer with database experience.',
      skills: ['React Native', 'Node.js', 'MongoDB'],
      hackathonsCount: 2,
      projectsCount: 1,
      rating: 4.7,
      membersCount: 2,
      lookingFor: 'Backend Engineer',
    },
  ];

  const currentData = mode === 'teammates' ? mockTeammates : mockTeams;

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-3">
              <span className="gradient-text">For You</span>
            </h1>
            <p className="text-dark-300 text-lg">
              Swipe right to connect, left to pass
            </p>
          </motion.div>

          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-12"
          >
            <div className="glass-card p-1 flex">
              <button
                onClick={() => setMode('teammates')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  mode === 'teammates'
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                🤝 Find Teammates
              </button>
              <button
                onClick={() => setMode('teams')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  mode === 'teams'
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                👥 Find Teams
              </button>
            </div>
          </motion.div>

          {/* Swipe Container */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-20"
          >
            <SwipeContainer users={currentData} type={mode} />
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto mt-16 text-center"
          >
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">How it works</h3>
              <div className="space-y-3 text-sm text-dark-300">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👈</span>
                  <p className="text-left">Swipe left or tap ❌ to pass</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👉</span>
                  <p className="text-left">Swipe right or tap ✅ to match</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">↩️</span>
                  <p className="text-left">Tap undo to review your last swipe</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
