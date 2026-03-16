import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandFlower from '../components/BrandFlower';

const bloomColors = [
  'var(--peach)',     // b
  'var(--accent)',    // l
  'var(--lavender)',  // o
  'var(--mint)',      // o
  'var(--sky)',       // m
];

const steps = [
  { label: 'Swipe', desc: 'Browse students with complementary skills — your next teammate is one flick away.', color: 'var(--peach)' },
  { label: 'Match', desc: 'When the interest is mutual, you\'re instantly connected and ready to chat.', color: 'var(--lavender)' },
  { label: 'Build', desc: 'Form your dream team, join a hackathon, and ship something real — together.', color: 'var(--mint)' },
];

const ease = [0.16, 1, 0.3, 1];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ─── Nav ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 72, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 40px)', background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandFlower />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-dark)' }}>CodeCollab</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 18px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid var(--border-strong)', background: 'transparent', color: 'var(--text-body)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign In
          </motion.button>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: '9px 22px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 40px 0', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 800,
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: 'var(--text-dark)', marginBottom: 32,
            }}
          >
            Find people who<br />make ideas{' '}
            <span style={{ display: 'inline-block', fontSize: 'clamp(2.6rem, 7vw, 4.8rem)', lineHeight: 0.95, letterSpacing: '-0.05em' }}>
              {'bloom'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.65, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease }}
                  whileHover={{
                    scale: 1.3,
                    y: -6,
                    transition: { type: 'spring', stiffness: 500, damping: 12 },
                  }}
                  style={{ display: 'inline-block', color: bloomColors[i], cursor: 'default' }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
            style={{
              fontSize: '1.05rem', color: 'var(--text-body)',
              maxWidth: 420, margin: '0 auto 44px', lineHeight: 1.7,
            }}
          >
            Swipe to match with talented students, form teams, and compete in hackathons across Singapore.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
            whileHover={{ scale: 1.06, boxShadow: '0 14px 44px rgba(224, 93, 80, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 44px', borderRadius: 14, fontSize: '1rem', fontWeight: 700,
              border: 'none', background: 'var(--accent)', color: 'white',
              cursor: 'pointer', boxShadow: 'var(--shadow-heavy)', fontFamily: 'inherit',
            }}
          >
            Get Started
          </motion.button>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            position: 'absolute', bottom: 32, left: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            zIndex: 2, transform: 'translateX(-50%)',
          }}
        >
          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <motion.svg
            width="18" height="10" viewBox="0 0 18 10"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M2 2 L9 8 L16 2" stroke="var(--text-faint)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </motion.svg>
        </motion.div>
      </div>

      {/* ─── How it works ─── */}
      <div style={{ padding: '60px clamp(24px, 8vw, 100px) 100px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, delay: i * 0.12, ease }}
            style={{ marginBottom: i < steps.length - 1 ? 56 : 0 }}
          >
            <h3 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800,
              letterSpacing: '-0.03em', color: 'var(--text-dark)',
              marginBottom: 6,
            }}>
              {step.label}<span style={{ color: step.color }}>.</span>
            </h3>
            <p style={{
              fontSize: '0.95rem', color: 'var(--text-soft)', lineHeight: 1.65,
            }}>
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ─── Bottom CTA ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease }}
        style={{ textAlign: 'center', padding: '20px 24px 80px' }}
      >
        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 20, letterSpacing: '-0.02em' }}>
          Ready to find your team?
        </p>
        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.06, boxShadow: '0 14px 44px rgba(224, 93, 80, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          style={{
            padding: '14px 36px', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700,
            border: 'none', background: 'var(--accent)', color: 'white',
            cursor: 'pointer', boxShadow: 'var(--shadow-heavy)', fontFamily: 'inherit',
          }}
        >
          Start Matching
        </motion.button>
      </motion.div>

      {/* ─── Footer ─── */}
      <div style={{ padding: '24px 40px', fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        2026 CodeCollab
      </div>
    </div>
  );
}
