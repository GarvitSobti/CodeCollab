import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';


const ease = [0.16, 1, 0.3, 1];

const FREE_FEATURES = [
  { label: 'Swipe & match with teammates', included: true },
  { label: 'Basic profile & skill listing', included: true },
  { label: 'Join hackathon teams', included: true },
  { label: 'Team chat & messaging', included: true },
  { label: 'Up to 30 swipes per day', included: true },
  { label: 'Profile boost in discovery feed', included: false },
  { label: 'See who swiped right on you', included: false },
  { label: 'Hackathon deadline alerts', included: false },
  { label: 'Priority team invitations', included: false },
  { label: 'Premium profile badge', included: false },
];

const PREMIUM_FEATURES = [
  { label: 'Unlimited swipes per day', included: true },
  { label: 'Profile boost in discovery feed', included: true },
  { label: 'See who swiped right on you', included: true },
  { label: 'Hackathon deadline & registration alerts', included: true },
  { label: 'Priority team invitations', included: true },
  { label: 'Premium profile badge', included: true },
  { label: 'Advanced skill & compatibility insights', included: true },
  { label: 'Early access to new features', included: true },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel your subscription at any time. You keep access until the end of your billing period.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'Payments are processed by Stripe, an industry-standard payment provider. We never store your card details.',
  },
  {
    q: 'What happens to my matches if I downgrade?',
    a: 'All your existing matches and conversations are kept. You just lose access to premium-only features going forward.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'We\'re working on a verified student pricing tier. Stay tuned — sign up for updates.',
  },
];

function CheckIcon({ color = 'var(--accent)' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden',
        background: 'var(--bg-card)', transition: 'border-color 0.2s ease',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', border: 'none', background: 'transparent',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)',
          gap: 12,
        }}
      >
        {q}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ flexShrink: 0, transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-soft)' }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.65 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function Billing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  const monthlyPrice = 9;
  const yearlyPrice = 6; // billed as 72/yr
  const price = billing === 'monthly' ? monthlyPrice : yearlyPrice;
  const priceSuffix = billing === 'monthly' ? '/mo' : '/mo, billed yearly';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-dark)' }}>
      <div style={{ paddingTop: 72 }}>

        {/* ─── Hero ─── */}
        <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 40px) 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <span style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: 100,
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--lavender) 15%, transparent))',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)',
              letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20,
            }}>
              Free Plan
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800,
              letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16,
            }}
          >
            Find your team faster with{' '}
            <span style={{ color: 'var(--accent)' }}>Premium</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-body)',
              maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.6,
            }}
          >
            Boost your profile, get notified about hackathons, and see who's already interested in teaming up with you.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 56 }}
          >
            <button
              onClick={() => setBilling('monthly')}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.2s ease',
                background: billing === 'monthly' ? 'var(--bg-card)' : 'transparent',
                color: billing === 'monthly' ? 'var(--text-dark)' : 'var(--text-soft)',
                boxShadow: billing === 'monthly' ? 'var(--shadow-soft)' : 'none',
              }}
            >
              Monthly
            </button>
            <div style={{
              position: 'relative', width: 44, height: 24, borderRadius: 12,
              background: billing === 'yearly' ? 'var(--accent)' : 'var(--border)',
              cursor: 'pointer', transition: 'background 0.25s ease', flexShrink: 0,
            }} onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}>
              <div style={{
                position: 'absolute', top: 3, left: billing === 'yearly' ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                transition: 'left 0.25s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <button
              onClick={() => setBilling('yearly')}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.2s ease',
                background: billing === 'yearly' ? 'var(--bg-card)' : 'transparent',
                color: billing === 'yearly' ? 'var(--text-dark)' : 'var(--text-soft)',
                boxShadow: billing === 'yearly' ? 'var(--shadow-soft)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Yearly
              <span style={{
                padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                background: 'linear-gradient(135deg, var(--peach), var(--coral))',
                color: 'white',
              }}>
                Save 33%
              </span>
            </button>
          </motion.div>
        </div>

        {/* ─── Plan Cards ─── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20, maxWidth: 780, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 64px',
        }}>

          {/* Free Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease }}
            style={{
              borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--bg-card)', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Free
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>$0</span>
                <span style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-body)', lineHeight: 1.5, margin: 0 }}>
                Everything you need to get started and find your first teammate.
              </p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {FREE_FEATURES.map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.83rem', color: f.included ? 'var(--text-body)' : 'var(--text-faint)' }}>
                  {f.included ? <CheckIcon /> : <CrossIcon />}
                  {f.label}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/discover')}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, fontSize: '0.85rem',
                fontWeight: 700, border: '1.5px solid var(--border)', background: 'transparent',
                color: 'var(--text-body)', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-warm)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Continue with Free
            </button>
          </motion.div>

          {/* Premium Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25, ease }}
            style={{
              borderRadius: 'var(--radius)', border: '2px solid var(--accent)',
              background: 'var(--bg-card)', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 0 0 4px color-mix(in srgb, var(--accent) 10%, transparent)',
            }}
          >
            {/* Popular badge */}
            <div style={{
              position: 'absolute', top: 18, right: 18,
              padding: '4px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700,
              background: 'var(--accent)', color: 'white', letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              Most Popular
            </div>

            {/* Subtle gradient blob */}
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 180, height: 180,
              borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%)',
            }} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Premium
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>${price}</span>
                <span style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>{priceSuffix}</span>
              </div>
              {billing === 'yearly' && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: 8 }}>
                  Billed as <strong style={{ color: 'var(--text-body)' }}>$72/year</strong> — save $36
                </div>
              )}
              <p style={{ fontSize: '0.83rem', color: 'var(--text-body)', lineHeight: 1.5, margin: 0 }}>
                Get discovered faster, stay on top of hackathons, and stand out from the crowd.
              </p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {PREMIUM_FEATURES.map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.83rem', color: 'var(--text-body)' }}>
                  <CheckIcon color="var(--accent)" />
                  {f.label}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {}}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, fontSize: '0.85rem',
                fontWeight: 700, border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--coral))',
                color: 'white', cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent)',
              }}
            >
              Upgrade to Premium
            </motion.button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 10, marginBottom: 0 }}>
              Payments coming soon via Stripe
            </p>
          </motion.div>
        </div>

        {/* ─── Feature Highlights ─── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 80px' }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 40 }}
          >
            What you unlock with Premium
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              {
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                title: 'Profile Boost',
                desc: 'Your profile appears at the top of the discovery feed, so the right teammates find you first.',
                color: 'var(--peach)',
              },
              {
                icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
                title: 'Hackathon Alerts',
                desc: 'Never miss a registration deadline. Get instant alerts when new hackathons open in Singapore.',
                color: 'var(--lavender)',
              },
              {
                icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
                title: 'See Your Admirers',
                desc: 'Know who already swiped right on you — reach out before they find someone else.',
                color: 'var(--coral)',
              },
              {
                icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
                title: 'Premium Badge',
                desc: 'Stand out with a verified premium badge on your profile — signals commitment to serious teams.',
                color: 'var(--mint)',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07, ease }}
                style={{
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  background: 'var(--bg-card)', padding: '22px 22px 20px',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, marginBottom: 14,
                  background: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.55 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── FAQ ─── */}
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 96px' }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 28 }}
          >
            Frequently asked questions
          </motion.h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
