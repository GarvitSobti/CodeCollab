import React from 'react';
import { useNavigate } from 'react-router-dom';

const petalColors = ['var(--peach)', 'var(--coral)', 'var(--lavender)', 'var(--mint)', 'var(--sky)'];
const petalAngles = [270, 342, 54, 126, 198];

const features = [
  { icon: '🎯', title: 'Smart Matching', desc: 'Get matched with teammates based on skills, interests, and availability.' },
  { icon: '✨', title: 'Swipe to Connect', desc: 'Tinder-style interface makes finding teammates fun and intuitive.' },
  { icon: '🚀', title: 'Discover Hackathons', desc: 'Browse and join hackathons from universities across Singapore.' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Connect instantly with your matches and build your dream team.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="mesh-blob blob-4" />
        <div className="mesh-blob blob-5" />
      </div>
      <div className="noise" />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 72, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px',
        background: 'rgba(250,247,242,0.85)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, position: 'relative' }}>
            {petalColors.map((bg, i) => {
              const r = 10;
              const angle = (petalAngles[i] * Math.PI) / 180;
              const x = 50 + r * Math.cos(angle);
              const y = 50 + r * Math.sin(angle);
              return <div key={i} style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: bg, top: `${y}%`, left: `${x}%`, transform: 'translate(-50%,-50%)' }} />;
            })}
            <div style={{ position: 'absolute', width: 9, height: 9, borderRadius: '50%', background: 'var(--honey)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }} />
          </div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-dark)' }}>CodeCollab</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ padding: '8px 20px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'var(--text-body)', cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/login')} style={{ padding: '9px 22px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,138,101,0.3)' }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 2, padding: '160px 40px 80px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="stagger">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,138,101,0.15), rgba(179,157,219,0.15))', fontSize: '0.75rem', fontWeight: 600, color: 'var(--peach)', marginBottom: 20 }}>
            🌸 500+ students already matched
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
            Find people who<br />
            <span className="flowing-text">make ideas bloom</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Connect with talented students, discover hackathons you'll love, and build teams that bring out the best in everyone.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '14px 32px', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', color: 'white', cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,138,101,0.35)' }}>
              Start Swiping →
            </button>
            <button onClick={() => navigate('/discover')} style={{ padding: '14px 32px', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, border: '1.5px solid rgba(0,0,0,0.1)', background: 'var(--bg-card)', color: 'var(--text-dark)', cursor: 'pointer' }}>
              Browse Profiles
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stagger d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 560, margin: '60px auto 0' }}>
          {[{ val: '500+', lbl: 'Active Students', c: 'var(--coral)' }, { val: '1000+', lbl: 'Matches Made', c: 'var(--mint)' }, { val: '50+', lbl: 'Hackathons', c: 'var(--sky)' }].map(s => (
            <div key={s.lbl} style={{ padding: '20px 16px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, display: 'block', color: s.c }}>{s.val}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 4 }}>{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="stagger d3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 80 }}>
          {features.map(f => (
            <div key={f.title} style={{ padding: 28, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'left', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-heavy)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="stagger d4" style={{ marginTop: 80, padding: '48px 40px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Ready to find your <span className="flowing-text">dream team</span>?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', marginBottom: 28 }}>Join hundreds of students already building amazing projects together.</p>
          <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', color: 'white', cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,138,101,0.3)' }}>
            Get Started for Free →
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.78rem', color: 'var(--text-faint)' }}>
          © 2026 CodeCollab. Built with love for Singapore's hackathon community.
        </div>
      </div>
    </div>
  );
}
