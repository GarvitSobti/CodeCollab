import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Smart Matching',
      description: 'Get matched with teammates based on skills, interests, and availability',
    },
    {
      icon: '✨',
      title: 'Swipe to Connect',
      description: 'Tinder-style interface makes finding teammates fun and intuitive',
    },
    {
      icon: '🚀',
      title: 'Discover Hackathons',
      description: 'Browse and join hackathons from universities across Singapore',
    },
    {
      icon: '💬',
      title: 'Real-time Chat',
      description: 'Connect instantly with your matches and build your dream team',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <span className="text-xl font-bold gradient-text">CodeCollab</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-dark-200 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/login" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Find Your Perfect
              <br />
              <span className="gradient-text">Hackathon Teammates</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-200 mb-10">
              Swipe. Match. Build. The easiest way to connect with talented developers at Singapore's top universities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="btn-primary text-lg">
                Start Swiping →
              </Link>
              <button className="btn-secondary text-lg">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div>
                <p className="text-4xl font-bold gradient-text">500+</p>
                <p className="text-dark-400 mt-1">Active Students</p>
              </div>
              <div>
                <p className="text-4xl font-bold gradient-text">1000+</p>
                <p className="text-dark-400 mt-1">Matches Made</p>
              </div>
              <div>
                <p className="text-4xl font-bold gradient-text">50+</p>
                <p className="text-dark-400 mt-1">Hackathons</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">CodeCollab</span>?
            </h2>
            <p className="text-xl text-dark-300">
              Everything you need to build your dream hackathon team
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-dark-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple. Fast. <span className="gradient-text">Effective.</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Tell us about your skills, experience, and what you\'re looking for in a teammate.',
              },
              {
                step: '2',
                title: 'Swipe Through Profiles',
                description: 'Browse teammates or teams looking for members. Swipe right to match, left to pass.',
              },
              {
                step: '3',
                title: 'Connect & Build',
                description: 'Chat with your matches, form teams, and register for hackathons together!',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-lg text-dark-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 text-center bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to find your <span className="gradient-text">dream team</span>?
          </h2>
          <p className="text-xl text-dark-200 mb-8">
            Join hundreds of students already building amazing projects together
          </p>
          <Link to="/login" className="btn-primary text-lg">
            Get Started for Free →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-dark-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-xl">🤝</span>
            </div>
            <span className="font-bold text-white">CodeCollab</span>
          </div>
          <p>© 2026 CodeCollab. Built with ❤️ for Singapore's hackathon community.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
