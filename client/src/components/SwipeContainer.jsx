import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import api from '../services/api';
import User from '../models/User';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileToUser(p) {
  const skills = Array.isArray(p.profile?.skills)
    ? p.profile.skills.map((s) => s.name).filter(Boolean)
    : [];
  const hackathons = p.profile?.hackathonExperienceCount ?? 0;
  const tier = p.profile?.internalSkillTier ?? 'BEGINNER';
  const tierLabel = tier === 'ADVANCED' ? 'Advanced' : tier === 'INTERMEDIATE' ? 'Intermediate' : 'Beginner';

  return new User({
    id: p.id,
    name: p.name || 'Unknown',
    email: p.email || '',
    avatarUrl: p.avatarUrl || p.profile?.photoDataUrl || null,
    uni: [p.university, p.profile?.major].filter(Boolean).join(' · '),
    skills,
    hackathons,
    tier: tierLabel,
    match: p.compatibilityScore ?? 0,
    quote: p.bio || '',
  });
}

const GRADIENTS = [
  'linear-gradient(145deg,#ff6b6b,#ff8a65)',
  'linear-gradient(145deg,#42a5f5,#1e88e5)',
  'linear-gradient(145deg,#b39ddb,#7e57c2)',
  'linear-gradient(145deg,#66bb6a,#43a047)',
  'linear-gradient(145deg,#ffca28,#ff8a65)',
  'linear-gradient(145deg,#f06292,#e91e63)',
  'linear-gradient(145deg,#4dd0e1,#0097a7)',
];
const SKILL_COLORS = [
  { bg: 'rgba(255,138,101,0.12)', color: 'var(--peach)' },
  { bg: 'rgba(66,165,245,0.12)', color: 'var(--sky)' },
  { bg: 'rgba(179,157,219,0.12)', color: 'var(--lavender)' },
  { bg: 'rgba(102,187,106,0.12)', color: 'var(--mint)' },
  { bg: 'rgba(240,98,146,0.12)', color: 'var(--rose)' },
  { bg: 'rgba(255,202,40,0.12)', color: 'var(--honey)' },
];

function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function matchColor(score) {
  if (score >= 70) return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
  if (score >= 40) return { color: 'var(--honey)', bg: 'rgba(255,202,40,0.12)' };
  return { color: 'var(--text-soft)', bg: 'rgba(128,128,128,0.1)' };
}

function tierColor(tier) {
  if (tier === 'Advanced') return { color: 'var(--accent)', bg: 'rgba(224,93,80,0.1)' };
  if (tier === 'Intermediate') return { color: 'var(--sky)', bg: 'rgba(66,165,245,0.1)' };
  return { color: 'var(--text-soft)', bg: 'rgba(128,128,128,0.08)' };
}

// ─── Profile Detail Modal (shown on tap) ──────────────────────────────────────

function ProfileDetailModal({ profile, gradient, onClose, onSwipeLeft, onSwipeRight }) {
  const mc = matchColor(profile.match);
  const tc = tierColor(profile.tier);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-card)',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '88vh', overflowY: 'auto',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Banner */}
        <div style={{ height: 140, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '100%', background: gradient }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }} />
          {/* Pull handle */}
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)',
          }} />
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14, width: 30, height: 30,
              borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* Match badge */}
          <div style={{
            position: 'absolute', bottom: 12, right: 14, padding: '5px 10px',
            borderRadius: 8, fontSize: '0.72rem', fontWeight: 800,
            fontFamily: "'Fira Code', monospace",
            background: mc.bg, color: mc.color, border: `1.5px solid ${mc.color}`,
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: mc.color, animation: 'pulseDot 1.8s infinite' }} />
            {profile.match}% match
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 22px 28px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'absolute', top: -34, left: 22 }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name}
                style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'cover', border: '3px solid var(--bg-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
              />
            ) : (
              <div style={{
                width: 68, height: 68, borderRadius: 16, background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.3rem', color: 'white',
                border: '3px solid var(--bg-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}>{profile.initials}</div>
            )}
          </div>

          <div style={{ paddingTop: 44 }}>
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{profile.name}</h2>
              <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.63rem', fontWeight: 700, background: tc.bg, color: tc.color }}>{profile.tier}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', fontWeight: 500, marginBottom: 18 }}>{profile.uni}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <div style={{ padding: '10px 16px', borderRadius: 12, background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{profile.hackathons}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{profile.hackathons === 1 ? 'Hackathon' : 'Hackathons'}</span>
              </div>
            </div>

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.skills.map((s, i) => {
                    const c = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <span key={s} style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: c.bg, color: c.color }}>{s}</span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.quote && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>About</div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.7, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-warm)', borderLeft: '3px solid var(--accent)', margin: 0 }}>
                  {profile.quote}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                onClick={() => { onClose(); onSwipeLeft(); }}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: '1.5px solid var(--border-strong)',
                  background: 'transparent', color: 'var(--text-soft)', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Pass
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                onClick={() => { onClose(); onSwipeRight(); }}
                style={{
                  flex: 2, padding: '13px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), var(--peach))',
                  color: 'white', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(224,93,80,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Connect
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ProfileCard ──────────────────────────────────────────────────────────────

function ProfileCard({ profile, gradient, onSwipeLeft, onSwipeRight, onTap }) {
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const curXRef = useRef(0);
  const grabYRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const velocityXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onStart = (e) => {
      draggingRef.current = true;
      movedRef.current = false;
      const point = e.touches ? e.touches[0] : e;
      startXRef.current = point.clientX;
      startYRef.current = point.clientY;
      lastXRef.current = point.clientX;
      lastTimeRef.current = Date.now();
      const rect = card.getBoundingClientRect();
      grabYRef.current = (point.clientY - rect.top) / rect.height - 0.5;
      card.style.transition = 'none';
      if (e.cancelable) e.preventDefault();
    };

    const onMove = (e) => {
      if (!draggingRef.current) return;
      const point = e.touches ? e.touches[0] : e;
      curXRef.current = point.clientX - startXRef.current;
      const dy = point.clientY - startYRef.current;
      if (Math.abs(curXRef.current) > 6 || Math.abs(dy) > 6) movedRef.current = true;
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      if (dt > 0) {
        velocityXRef.current = (point.clientX - lastXRef.current) / dt * 1000;
        lastXRef.current = point.clientX;
        lastTimeRef.current = now;
      }
      const rotation = curXRef.current * (-grabYRef.current * 0.15 + 0.05);
      card.style.transform = `translateX(${curXRef.current}px) rotate(${rotation}deg)`;

      const connectLabel = card.querySelector('.swipe-label-connect');
      const passLabel    = card.querySelector('.swipe-label-pass');
      if (curXRef.current > 30) {
        connectLabel.style.opacity = Math.min((curXRef.current - 30) / 70, 1);
        passLabel.style.opacity = 0;
      } else if (curXRef.current < -30) {
        passLabel.style.opacity = Math.min((-curXRef.current - 30) / 70, 1);
        connectLabel.style.opacity = 0;
      } else {
        connectLabel.style.opacity = 0;
        passLabel.style.opacity = 0;
      }
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const curX = curXRef.current;
      const vel  = velocityXRef.current;

      if (!movedRef.current) {
        // It was a tap — open detail
        onTap();
        curXRef.current = 0;
        velocityXRef.current = 0;
        return;
      }

      if (curX > 90 || (curX > 30 && vel > 600)) {
        throwCard('right');
      } else if (curX < -90 || (curX < -30 && vel < -600)) {
        throwCard('left');
      } else {
        card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'scale(1) translateY(0)';
        card.querySelector('.swipe-label-connect').style.opacity = 0;
        card.querySelector('.swipe-label-pass').style.opacity = 0;
      }
      curXRef.current = 0;
      velocityXRef.current = 0;
    };

    const throwCard = (dir) => {
      const distance = dir === 'right' ? '160%' : '-160%';
      card.style.transition = 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease';
      card.style.transform = `translateX(${distance}) rotate(${dir === 'right' ? '22' : '-22'}deg)`;
      card.style.opacity = '0';
      setTimeout(() => { dir === 'right' ? onSwipeRight() : onSwipeLeft(); }, 300);
    };

    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);

    return () => {
      card.removeEventListener('mousedown', onStart);
      card.removeEventListener('touchstart', onStart);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onTap]);

  const mc = matchColor(profile.match);
  const tc = tierColor(profile.tier);

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute', width: '100%', height: '100%',
        borderRadius: 16, background: 'var(--bg-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid var(--border)',
        overflow: 'hidden', cursor: 'grab', userSelect: 'none',
        willChange: 'transform', touchAction: 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Swipe labels */}
      <div className="swipe-label-connect" style={{
        position: 'absolute', top: 24, right: 20, padding: '10px 20px',
        borderRadius: 12, fontWeight: 800, fontSize: '1.1rem',
        background: 'rgba(34,197,94,0.15)', color: '#22c55e',
        border: '2.5px solid #22c55e', transform: 'rotate(8deg)',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        backdropFilter: 'blur(8px)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Connect
      </div>
      <div className="swipe-label-pass" style={{
        position: 'absolute', top: 24, left: 20, padding: '10px 20px',
        borderRadius: 12, fontWeight: 800, fontSize: '1.1rem',
        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
        border: '2.5px solid #ef4444', transform: 'rotate(-8deg)',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        backdropFilter: 'blur(8px)',
      }}>
        Pass
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>

      {/* Banner */}
      <div style={{ height: '35%', minHeight: 130, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: '100%', height: '100%', background: gradient }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)',
        }} />
        {/* Match badge */}
        <div style={{
          position: 'absolute', top: 16, right: 16, padding: '6px 12px',
          borderRadius: 10, fontSize: '0.78rem', fontWeight: 800,
          fontFamily: "'Fira Code', monospace",
          background: mc.bg, color: mc.color,
          border: `1.5px solid ${mc.color}`,
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: mc.color, animation: 'pulseDot 1.8s infinite' }} />
          {profile.match}% match
        </div>
      </div>

      {/* Avatar — sits on card root so it's never clipped by banner overflow:hidden */}
      <div style={{ position: 'absolute', top: 'calc(35% - 36px)', left: 18, zIndex: 5 }}>
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover', border: '3px solid var(--bg-card)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
          />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: 18, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.4rem', color: 'white',
            border: '3px solid var(--bg-card)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}>{profile.initials}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '42px 18px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Name + tier */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{profile.name}</h3>
            <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.63rem', fontWeight: 700, background: tc.bg, color: tc.color }}>{profile.tier}</span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-soft)', fontWeight: 500 }}>{profile.uni}</p>
        </div>

        {/* Hackathons stat */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 10, background: 'var(--bg-warm)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{profile.hackathons}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{profile.hackathons === 1 ? 'Hackathon' : 'Hackathons'}</span>
          </div>
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {profile.skills.slice(0, 5).map((s, i) => {
              const c = SKILL_COLORS[i % SKILL_COLORS.length];
              return (
                <span key={s} style={{ padding: '5px 11px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: c.bg, color: c.color }}>{s}</span>
              );
            })}
          </div>
        )}

        {/* Tap hint */}
        <div style={{
          marginTop: 'auto', paddingTop: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 500,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Tap card to see full profile
        </div>
      </div>
    </div>
  );
}

// ─── Match Modal ──────────────────────────────────────────────────────────────

function MatchModal({ profile, gradient, onMessage, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          background: 'var(--bg-card)', borderRadius: 28,
          padding: '44px 40px', textAlign: 'center', maxWidth: 380, width: '90%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          border: '1px solid var(--border)',
          position: 'relative', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 260, height: 260, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(224,93,80,0.15) 0%, transparent 70%)',
        }} />

        <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>🎉</div>
        <h2 style={{
          fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.04em',
          marginBottom: 6, background: 'linear-gradient(135deg, var(--accent), var(--peach))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          It's a Match!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: 28, lineHeight: 1.65 }}>
          You and <strong>{profile.name}</strong> both want to collaborate.<br />
          Start building something great together.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--peach), var(--coral))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.2rem', color: 'white',
            border: '3px solid var(--bg-card)', boxShadow: '0 4px 16px rgba(224,93,80,0.3)',
            zIndex: 2,
          }}>YO</div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-warm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', zIndex: 3, margin: '0 -8px',
            border: '2px solid var(--bg-card)',
          }}>💬</div>
          <div style={{
            width: 68, height: 68, borderRadius: 20, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.2rem', color: 'white',
            border: '3px solid var(--bg-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 2,
          }}>{profile.initials}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onMessage}
            style={{
              padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--accent), var(--peach))',
              color: 'white', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700,
              boxShadow: '0 6px 20px rgba(224,93,80,0.35)',
            }}
          >
            Message {profile.name.split(' ')[0]}
          </motion.button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 0', borderRadius: 14, border: '1.5px solid var(--border-strong)',
              cursor: 'pointer', background: 'transparent', color: 'var(--text-soft)',
              fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRefresh, loading }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center',
      padding: 32, borderRadius: 24, background: 'var(--bg-card)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🌟</div>
      <h3 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', margin: 0 }}>
        You've seen everyone!
      </h3>
      <p style={{ color: 'var(--text-soft)', fontSize: '0.84rem', margin: 0, maxWidth: 260, lineHeight: 1.65 }}>
        New profiles are added regularly. Come back soon or refresh to see if anyone new joined.
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onRefresh}
        disabled={loading}
        style={{
          padding: '11px 28px', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: 'white',
          fontFamily: 'inherit', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1, fontSize: '0.85rem',
        }}
      >
        {loading ? 'Loading…' : 'Refresh'}
      </motion.button>
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

function ActionButtons({ onLeft, onRight }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
      {/* Pass */}
      <motion.button
        whileHover={{ scale: 1.08, borderColor: '#ef4444' }}
        whileTap={{ scale: 0.92 }}
        onClick={onLeft}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          border: '2px solid var(--border-strong)',
          background: 'var(--bg-card)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-soft)', boxShadow: 'var(--shadow-card)',
          transition: 'border-color 0.2s ease, color 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-soft)'; }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </motion.button>

      {/* Connect */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRight}
        style={{
          width: 68, height: 68, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, var(--accent), var(--peach))',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: '0 6px 24px rgba(224,93,80,0.4)',
        }}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </motion.button>
    </div>
  );
}

// ─── SwipeContainer ───────────────────────────────────────────────────────────

export default function SwipeContainer() {
  const [profiles, setProfiles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [detailProfile, setDetailProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/v1/discover');
      setProfiles((data.profiles || []).map(profileToUser));
      setIdx(0);
    } catch {
      setError('Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const recordSwipe = useCallback(async (profile, direction) => {
    try {
      const { data } = await api.post('/api/v1/discover/swipe', { targetId: profile.id, direction });
      if (data.matched) setMatchedProfile(profile);
    } catch { }
  }, []);

  const advance = useCallback(() => setIdx((i) => i + 1), []);

  const handleSwipeLeft = useCallback(() => {
    const current = profiles[idx];
    if (current) recordSwipe(current, 'left');
    advance();
  }, [profiles, idx, recordSwipe, advance]);

  const handleSwipeRight = useCallback(() => {
    const current = profiles[idx];
    if (current) recordSwipe(current, 'right');
    advance();
  }, [profiles, idx, recordSwipe, advance]);

  const handleMessage = async () => {
    if (!matchedProfile) return;
    await openOrCreateDM(matchedProfile.id);
    setMatchedProfile(null);
    navigate('/messages');
  };

  const hasMore = idx < profiles.length;
  const remaining = profiles.length - idx;
  const visible = hasMore ? profiles.slice(idx, idx + 3) : [];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', height: '100%',
      padding: '10px 12px 14px',
    }}>
      <AnimatePresence>
        {matchedProfile && (
          <MatchModal
            profile={matchedProfile}
            gradient={gradientFor(matchedProfile.id)}
            onMessage={handleMessage}
            onClose={() => setMatchedProfile(null)}
          />
        )}
        {detailProfile && (
          <ProfileDetailModal
            profile={detailProfile}
            gradient={gradientFor(detailProfile.id)}
            onClose={() => setDetailProfile(null)}
            onSwipeLeft={() => { setDetailProfile(null); handleSwipeLeft(); }}
            onSwipeRight={() => { setDetailProfile(null); handleSwipeRight(); }}
          />
        )}
      </AnimatePresence>

      {/* Counter */}
      {hasMore && !loading && (
        <div style={{
          marginBottom: 10, fontSize: '0.72rem', fontWeight: 600,
          color: 'var(--text-faint)', letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: Math.min(remaining, 5) }).map((_, i) => (
              <div key={i} style={{
                width: i === 0 ? 14 : 6, height: 5, borderRadius: 3,
                background: i === 0 ? 'var(--accent)' : 'var(--border-strong)',
              }} />
            ))}
          </div>
          {remaining} {remaining === 1 ? 'profile' : 'profiles'} left
        </div>
      )}

      {/* Card stack */}
      <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, marginBottom: 12 }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.9s linear infinite',
            }} />
            <p style={{ color: 'var(--text-soft)', fontWeight: 600, fontSize: '0.82rem' }}>Finding your matches...</p>
          </div>
        )}

        {!loading && error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
            padding: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem' }}>⚠️</div>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.84rem', lineHeight: 1.6 }}>{error}</p>
            <button onClick={fetchProfiles} style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: 'white',
              fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
            }}>Retry</button>
          </div>
        )}

        {!loading && !error && !hasMore && (
          <EmptyState onRefresh={fetchProfiles} loading={loading} />
        )}

        {!loading && !error && hasMore && [...visible].reverse().map((p, i) => {
          const isTop = i === visible.length - 1;
          const depth = visible.length - 1 - i;
          const scale = 1 - depth * 0.05;
          const translateY = depth * 10;

          return (
            <div key={p.id + i} style={{
              position: 'absolute', width: '100%', height: '100%',
              transform: isTop ? undefined : `scale(${scale}) translateY(${translateY}px)`,
              zIndex: i,
              pointerEvents: isTop ? 'auto' : 'none',
              transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1)',
            }}>
              {isTop ? (
                <ProfileCard
                  profile={p}
                  gradient={gradientFor(p.id)}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onTap={() => setDetailProfile(p)}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%', borderRadius: 20,
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)',
                  opacity: depth === 1 ? 0.65 : 0.35,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      {hasMore && !loading && (
        <div style={{ flexShrink: 0 }}>
          <ActionButtons onLeft={handleSwipeLeft} onRight={handleSwipeRight} />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
