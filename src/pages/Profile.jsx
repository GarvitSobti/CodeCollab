import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const Profile = () => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@university.edu',
    university: 'National University of Singapore',
    bio: 'Full-stack developer passionate about building products that make a difference. Currently exploring AI/ML and cloud technologies.',
    skills: ['React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'AWS'],
    hackathonsCount: 8,
    projectsCount: 15,
    matchesCount: 24,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Header */}
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.university}</p>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                </div>
                <button className="btn-secondary">
                  Edit Profile
                </button>
              </div>
              
              <p className="mt-6 text-foreground/80 leading-relaxed">{user.bio}</p>
              
              {/* Skills */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-primary">{user.hackathonsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Hackathons</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-primary">{user.projectsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Projects</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-primary">{user.matchesCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Matches</p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications about matches</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-primary relative transition-colors">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary-foreground transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-primary relative transition-colors">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary-foreground transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
