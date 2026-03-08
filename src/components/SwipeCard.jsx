import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const SwipeCard = ({ user, onSwipe, isTop }) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

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
      className={`absolute w-full h-full ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ x, rotate }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="swipe-card h-full flex flex-col">
        {/* User Avatar Section */}
        <div className="relative h-1/2 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-card border-4 border-background shadow-lg flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-5xl font-semibold text-primary">
                {user.name?.charAt(0)}
              </span>
            )}
          </div>
          
          {/* Swipe Indicators */}
          <motion.div
            className="absolute top-6 left-6 px-4 py-2 rounded-lg border-2 border-success text-success font-bold text-xl rotate-[-12deg]"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 px-4 py-2 rounded-lg border-2 border-destructive text-destructive font-bold text-xl rotate-[12deg]"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </motion.div>
        </div>

        {/* User Info Section */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground">{user.university || 'University'}</p>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {user.skills?.slice(0, 5).map((skill, idx) => (
                <span key={idx} className="badge badge-primary">
                  {skill}
                </span>
              ))}
              {user.skills?.length > 5 && (
                <span className="badge">+{user.skills.length - 5}</span>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {user.bio || 'No bio available'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{user.hackathonsCount || 0}</p>
              <p className="text-xs text-muted-foreground">Hackathons</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{user.projectsCount || 0}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">
                {user.rating ? user.rating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
