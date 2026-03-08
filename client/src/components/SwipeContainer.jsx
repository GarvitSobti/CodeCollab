import React, { useState } from 'react';
import SwipeCard from './SwipeCard';
import { motion, AnimatePresence } from 'framer-motion';

const SwipeContainer = ({ users, type = 'teammates' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedUsers, setSwipedUsers] = useState([]);

  const handleSwipe = (user, direction) => {
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipedUsers((prev) => [...prev, { user, direction }]);
      
      // TODO: Send swipe data to backend
      console.log(`Swiped ${direction} on ${user.name}`);
    }, 300);
  };

  const handleUndo = () => {
    if (currentIndex > 0 && swipedUsers.length > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSwipedUsers((prev) => prev.slice(0, -1));
    }
  };

  const currentUser = users[currentIndex];
  const noMoreUsers = currentIndex >= users.length;

  return (
    <div className="w-full max-w-md mx-auto h-[600px] relative">
      {/* Card Stack */}
      <div className="relative w-full h-full">
        <AnimatePresence>
          {!noMoreUsers && currentUser && (
            <SwipeCard
              key={currentUser.id}
              user={currentUser}
              onSwipe={handleSwipe}
              isLast={currentIndex === users.length - 1}
            />
          )}
        </AnimatePresence>

        {/* Next card preview (slightly visible behind) */}
        {currentIndex + 1 < users.length && (
          <motion.div
            className="absolute w-full h-full top-2 left-0 pointer-events-none"
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 0.95, opacity: 0.5 }}
          >
            <div className="glass-card h-full p-6" />
          </motion.div>
        )}
      </div>

      {/* No more users message */}
      {noMoreUsers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 glass-card flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">You've seen everyone!</h3>
          <p className="text-dark-300 mb-6">
            Check back later for new {type === 'teammates' ? 'teammates' : 'teams'} to connect with.
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="btn-primary"
          >
            Review Again
          </button>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!noMoreUsers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-20 left-0 right-0 flex justify-center items-center gap-4"
        >
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={swipedUsers.length === 0}
            className="w-12 h-12 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          {/* Pass Button */}
          <button
            onClick={() => handleSwipe(currentUser, 'left')}
            className="w-16 h-16 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Match Button */}
          <button
            onClick={() => handleSwipe(currentUser, 'right')}
            className="w-16 h-16 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Counter */}
      {!noMoreUsers && (
        <div className="absolute -top-12 left-0 right-0 text-center">
          <p className="text-dark-400 text-sm">
            {currentIndex + 1} / {users.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default SwipeContainer;
