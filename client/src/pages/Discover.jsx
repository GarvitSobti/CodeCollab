import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import SwipeContainer from '../components/SwipeContainer';

const Discover = () => {
  const [mode, setMode] = useState('teammates');

  // Mock data
  const mockTeammates = [
    {
      id: 1,
      name: 'Alex Chen',
      university: 'National University of Singapore',
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
      university: 'Nanyang Technological University',
      avatar: null,
      bio: 'UI/UX designer and frontend developer. Love creating beautiful, user-friendly interfaces.',
      skills: ['Figma', 'React', 'TypeScript', 'Tailwind', 'Animation'],
      hackathonsCount: 5,
      projectsCount: 12,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Marcus Lim',
      university: 'Singapore Management University',
      avatar: null,
      bio: 'Backend engineer and DevOps enthusiast. Experienced in building scalable systems.',
      skills: ['Go', 'Kubernetes', 'PostgreSQL', 'Redis', 'gRPC'],
      hackathonsCount: 12,
      projectsCount: 20,
      rating: 4.7,
    },
    {
      id: 4,
      name: 'Priya Kumar',
      university: 'National University of Singapore',
      avatar: null,
      bio: 'Data scientist and ML engineer. Passionate about solving real-world problems with AI.',
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
      bio: 'Building an AI-powered study assistant. Looking for a frontend developer!',
      skills: ['Python', 'TensorFlow', 'React', 'Firebase'],
      hackathonsCount: 3,
      projectsCount: 1,
      rating: 4.5,
    },
    {
      id: 2,
      name: 'GreenTech Squad',
      university: 'NTU',
      avatar: null,
      bio: 'Creating a sustainability tracking app. Need a backend engineer.',
      skills: ['React Native', 'Node.js', 'MongoDB'],
      hackathonsCount: 2,
      projectsCount: 1,
      rating: 4.7,
    },
  ];

  const currentData = mode === 'teammates' ? mockTeammates : mockTeams;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
            {/* Main Content */}
            <div>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h1 className="text-3xl font-bold mb-2">Discover</h1>
                <p className="text-muted-foreground">
                  Swipe to find your perfect {mode === 'teammates' ? 'teammate' : 'team'}
                </p>
              </motion.div>

              {/* Mode Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 mb-8"
              >
                <button
                  onClick={() => setMode('teammates')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'teammates'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Find Teammates
                </button>
                <button
                  onClick={() => setMode('teams')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'teams'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Find Teams
                </button>
              </motion.div>

              {/* Swipe Container */}
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <SwipeContainer users={currentData} type={mode} />
              </motion.div>
            </div>

            {/* Sidebar - How it Works */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="card p-6 sticky top-24">
                <h3 className="font-semibold mb-4">How it works</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Swipe Left</p>
                      <p className="text-sm text-muted-foreground">Pass on this profile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Swipe Right</p>
                      <p className="text-sm text-muted-foreground">Show interest and match</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Undo</p>
                      <p className="text-sm text-muted-foreground">Go back to previous</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium text-sm mb-3">Tips for matching</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">1.</span>
                      Complete your profile to increase visibility
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">2.</span>
                      Add relevant skills and experience
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">3.</span>
                      Write a compelling bio about your interests
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Discover;
