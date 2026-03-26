import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const SwipeCard = ({ user, onSwipe }) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
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
      <div className="card h-full overflow-hidden relative shadow-smooth-xl">
        {/* Profile Image */}
        <div className="absolute inset-0">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-coral to-peach flex items-center justify-center">
              <span className="text-8xl text-white font-bold">{user.name?.charAt(0)}</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* User Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
          <p className="text-white/90 text-lg mb-3">{user.university || 'NUS'}</p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {user.skills?.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-lg text-xs font-semibold border border-white/20"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="text-white/80 text-sm line-clamp-2">{user.bio}</p>

          {/* Stats */}
          <div className="flex gap-3 mt-4 text-xs">
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="font-semibold">{user.hackathonsCount || 0}</span>
              <span className="text-white/80 ml-1">Hackathons</span>
            </div>
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="font-semibold">{user.projectsCount || 0}</span>
              <span className="text-white/80 ml-1">Projects</span>
            </div>
          </div>
        </div>

        {/* Swipe indicators */}
        <motion.div
          className="absolute top-6 right-6 bg-mint text-white font-bold text-xl px-5 py-2.5 rounded-xl shadow-smooth-lg rotate-12"
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
        >
          ✓ LIKE
        </motion.div>
        <motion.div
          className="absolute top-6 left-6 bg-accent text-white font-bold text-xl px-5 py-2.5 rounded-xl shadow-smooth-lg -rotate-12"
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
        >
          ✕ PASS
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;

