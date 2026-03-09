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
      university: 'National University of Singapore',
      avatar: null,
      bio: 'Full-stack developer passionate about AI and ML. Looking for teammates to build innovative solutions at hackathons!',
      skills: ['React', 'Node.js', 'Python', 'TensorFlow'],
      hackathonsCount: 8,
      projectsCount: 15,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Sarah Tan',
      university: 'Nanyang Technological University',
      avatar: null,
      bio: 'UI/UX designer & frontend dev. Love creating beautiful, user-friendly interfaces. Let\'s build something amazing together!',
      skills: ['Figma', 'React', 'TypeScript', 'Tailwind'],
      hackathonsCount: 5,
      projectsCount: 12,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Marcus Lim',
      university: 'Singapore Management University',
      avatar: null,
      bio: 'Backend engineer & DevOps enthusiast. Experienced in building scalable systems and cloud infrastructure.',
      skills: ['Go', 'Kubernetes', 'PostgreSQL', 'Redis'],
      hackathonsCount: 12,
      projectsCount: 20,
      rating: 4.7,
    },
    {
      id: 4,
      name: 'Priya Kumar',
      university: 'National University of Singapore',
      avatar: null,
      bio: 'Data scientist & ML engineer. Passionate about solving real-world problems with AI and analytics.',
      skills: ['Python', 'PyTorch', 'Pandas', 'SQL'],
      hackathonsCount: 6,
      projectsCount: 10,
      rating: 4.6,
    },
  ];

  const mockTeams = [
    {
      id: 1,
      name: 'AI Innovators',
      university: 'National University of Singapore',
      avatar: null,
      bio: 'Building an AI-powered study assistant. Looking for a frontend developer to join our team!',
      skills: ['Python', 'TensorFlow', 'React', 'Firebase'],
      hackathonsCount: 3,
      projectsCount: 1,
      rating: 4.5,
    },
  ];

  const currentData = mode === 'teammates' ? mockTeammates : mockTeams;

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-3 tracking-tight">
              <span className="gradient-primary bg-clip-text text-transparent">Discover</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Swipe right to like, left to pass
            </p>
          </motion.div>

          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-10"
          >
            <div className="card p-1.5 flex shadow-smooth">
              <button
                onClick={() => setMode('teammates')}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                  mode === 'teammates'
                    ? 'gradient-primary text-white shadow-glow-indigo transform scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                Find Teammates
              </button>
              <button
                onClick={() => setMode('teams')}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                  mode === 'teams'
                    ? 'gradient-primary text-white shadow-glow-indigo transform scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                Find Teams
              </button>
            </div>
          </motion.div>

          {/* Swipe Container */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-24"
          >
            <SwipeContainer users={currentData} type={mode} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
