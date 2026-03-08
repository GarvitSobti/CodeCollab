import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const Hackathons = () => {
  const [filter, setFilter] = useState('all');

  const hackathons = [
    {
      id: 1,
      name: 'NUS Hack&Roll 2026',
      date: 'March 15-16, 2026',
      location: 'NUS Campus',
      participants: 500,
      prizePool: '$10,000',
      status: 'upcoming',
      description: 'Singapore\'s largest student-run hackathon. Build anything in 24 hours!',
      tags: ['Open Theme', '24 Hours', 'Beginner Friendly'],
    },
    {
      id: 2,
      name: 'NTU AI Hackathon',
      date: 'March 22-23, 2026',
      location: 'NTU Innovation Centre',
      participants: 300,
      prizePool: '$8,000',
      status: 'upcoming',
      description: 'Focus on AI/ML solutions for real-world problems.',
      tags: ['AI/ML', '36 Hours', 'Industry Mentors'],
    },
    {
      id: 3,
      name: 'SMU FinTech Challenge',
      date: 'April 5-6, 2026',
      location: 'SMU Campus',
      participants: 200,
      prizePool: '$15,000',
      status: 'upcoming',
      description: 'Build innovative financial technology solutions.',
      tags: ['FinTech', 'Banking APIs', 'Networking'],
    },
    {
      id: 4,
      name: 'SUTD IoT Hackathon',
      date: 'February 20-21, 2026',
      location: 'SUTD Campus',
      participants: 150,
      prizePool: '$5,000',
      status: 'past',
      description: 'Hardware and IoT focused hackathon.',
      tags: ['IoT', 'Hardware', 'Prototyping'],
    },
  ];

  const filteredHackathons = filter === 'all' 
    ? hackathons 
    : hackathons.filter(h => h.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Hackathons</h1>
              <p className="text-muted-foreground">Discover upcoming hackathons and find teammates</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {['all', 'upcoming', 'past'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Hackathon Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredHackathons.map((hackathon, index) => (
                <motion.div
                  key={hackathon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{hackathon.name}</h3>
                      <p className="text-sm text-muted-foreground">{hackathon.location}</p>
                    </div>
                    <span className={`badge ${hackathon.status === 'upcoming' ? 'badge-primary' : ''}`}>
                      {hackathon.status}
                    </span>
                  </div>
                  
                  <p className="text-foreground/80 mb-4">{hackathon.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hackathon.tags.map((tag, idx) => (
                      <span key={idx} className="badge">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {hackathon.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {hackathon.participants}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">{hackathon.prizePool}</span>
                  </div>
                  
                  {hackathon.status === 'upcoming' && (
                    <button className="btn-primary w-full mt-4">
                      Find Teammates
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Hackathons;
