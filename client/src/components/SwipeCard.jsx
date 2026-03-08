import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const SwipeCard = ({ user, onSwipe, isLast }) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const handleDragEnd = (_, info) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setExitX(info.offset.x > 0 ? 1000 : -1000);
      onSwipe(user, direction);
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="glass-card h-full p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent z-0" />
        
        {/* Profile Image */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-1">
            <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">{user.name?.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="relative z-10 space-y-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
            <p className="text-primary-400 text-lg">{user.university || 'NUS'}</p>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {user.skills?.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="text-dark-300 line-clamp-3">{user.bio || 'No bio available'}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{user.hackathonsCount || 0}</p>
              <p className="text-xs text-dark-400">Hackathons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-400">{user.projectsCount || 0}</p>
              <p className="text-xs text-dark-400">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {user.rating ? user.rating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs text-dark-400">Rating</p>
            </div>
          </div>
        </div>

        {/* Swipe indicators (appear on drag) */}
        <motion.div
          className="absolute top-8 left-8 text-6xl font-bold text-green-400 rotate-[-20deg] opacity-0"
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
        >
          MATCH
        </motion.div>
        <motion.div
          className="absolute top-8 right-8 text-6xl font-bold text-red-400 rotate-[20deg] opacity-0"
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
        >
          NOPE
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
