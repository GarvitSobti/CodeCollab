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
            />
          )}
        </AnimatePresence>

        {/* Next card preview */}
        {currentIndex + 1 < users.length && (
          <motion.div
            className="absolute w-full h-full top-2 left-0 pointer-events-none"
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 0.95, opacity: 0.5 }}
          >
            <div className="card h-full bg-gray-100 dark:bg-gray-800" />
          </motion.div>
        )}
      </div>

      {/* No more users message */}
      {noMoreUsers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 card flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">You're all caught up!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
          className="absolute -bottom-24 left-0 right-0 flex justify-center items-center gap-3"
        >
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={swipedUsers.length === 0}
            className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          {/* Pass Button */}
          <button
            onClick={() => handleSwipe(currentUser, 'left')}
            className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Like Button */}
          <button
            onClick={() => handleSwipe(currentUser, 'right')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          {/* Info Button */}
          <button
            className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeContainer;

