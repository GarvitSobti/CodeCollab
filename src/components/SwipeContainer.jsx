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
      console.log(`Swiped ${direction} on ${user.name}`);
    }, 200);
  };

  const handleUndo = () => {
    if (currentIndex > 0 && swipedUsers.length > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSwipedUsers((prev) => prev.slice(0, -1));
    }
  };

  const handleButtonSwipe = (direction) => {
    if (currentIndex < users.length) {
      handleSwipe(users[currentIndex], direction);
    }
  };

  const noMoreUsers = currentIndex >= users.length;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Counter */}
      {!noMoreUsers && (
        <div className="text-center mb-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {users.length}
          </span>
        </div>
      )}

      {/* Card Stack */}
      <div className="relative w-full aspect-[3/4] mb-6">
        <AnimatePresence>
          {!noMoreUsers && (
            <>
              {/* Background card (next) */}
              {currentIndex + 1 < users.length && (
                <motion.div
                  key={`bg-${currentIndex + 1}`}
                  className="absolute inset-0"
                  initial={{ scale: 0.95, y: 10, opacity: 0.5 }}
                  animate={{ scale: 0.95, y: 10, opacity: 0.5 }}
                >
                  <div className="swipe-card h-full" />
                </motion.div>
              )}
              
              {/* Top card (current) */}
              <SwipeCard
                key={users[currentIndex].id}
                user={users[currentIndex]}
                onSwipe={handleSwipe}
                isTop={true}
              />
            </>
          )}
        </AnimatePresence>

        {/* No more users */}
        {noMoreUsers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 card flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground mb-6">
              You have seen all available {type === 'teammates' ? 'teammates' : 'teams'}. Check back later for more.
            </p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="btn-secondary"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {!noMoreUsers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center gap-4"
        >
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={swipedUsers.length === 0}
            className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            aria-label="Undo"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          {/* Nope Button */}
          <button
            onClick={() => handleButtonSwipe('left')}
            className="w-16 h-16 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Pass"
          >
            <svg className="w-7 h-7 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Like Button */}
          <button
            onClick={() => handleButtonSwipe('right')}
            className="w-16 h-16 rounded-full bg-success/10 hover:bg-success/20 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Like"
          >
            <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Super Like Button */}
          <button
            onClick={() => handleButtonSwipe('right')}
            className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all"
            aria-label="Super Like"
          >
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeContainer;
