import React, { useState } from 'react';
import Navigation from '../components/Navigation';

const conversations = [
  { initials: 'JT', name: 'Jamie Tan', preview: "Let's sync up before the hackathon!", time: '2m', unread: 3, online: true, gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', messages: [
    { text: 'Hey! Did you see the new problem statement?', self: false, time: '10:02' },
    { text: 'Just saw it. The AI track looks really interesting', self: true, time: '10:04' },
    { text: 'Yeah! I was thinking we could build something with LLMs', self: false, time: '10:05' },
    { text: "That's exactly what I had in mind. Let's do it 🚀", self: true, time: '10:06' },
    { text: "Let's sync up before the hackathon!", self: false, time: '10:08' },
  ]},
  { initials: 'WM', name: 'Wei Ming Chen', preview: 'ML model is looking great!', time: '1h', unread: 0, online: true, gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', messages: [
    { text: 'Just finished training the matching model', self: false, time: '09:12' },
    { text: 'How is the accuracy?', self: true, time: '09:15' },
    { text: 'ML model is looking great!', self: false, time: '09:16' },
  ]},
  { initials: 'PS', name: 'Priya Sharma', preview: 'Database schema is ready', time: '3h', unread: 1, online: false, gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', messages: [
    { text: 'I finished the migrations', self: false, time: '07:30' },
    { text: 'Database schema is ready', self: false, time: '07:31' },
  ]},
  { initials: 'AN', name: 'Alex Ng', preview: "I'll have the mobile build ready by tonight", time: '5h', unread: 0, online: false, gradient: 'linear-gradient(135deg,#66bb6a,#43a047)', messages: [
    { text: "I'll have the mobile build ready by tonight", self: false, time: '05:00' },
  ]},
];

export default function Messages() {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(conversations.map(c => [...c.messages]));

  const send = () => {
    if (!input.trim()) return;
    const updated = msgs.map((m, i) => i === active ? [...m, { text: input, self: true, time: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) }] : m);
    setMsgs(updated);
    setInput('');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg"><div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" /></div>
      <div className="noise" />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>
            💌 <span className="flowing-text">Messages</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>Stay connected with your collaborators and teams.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, minHeight: 600 }}>
          {/* Conversation list */}
          <div style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 18, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <input placeholder="Search conversations..." style={{ width: '100%', padding: '10px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.06)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map((c, i) => (
                <div key={c.name} onClick={() => setActive(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.25s', borderLeft: `3px solid ${active === i ? 'var(--peach)' : 'transparent'}`, background: active === i ? 'rgba(255,138,101,0.06)' : 'transparent' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: 'white' }}>{c.initials}</div>
                    {c.online && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--mint)', border: '2px solid var(--bg-card)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 2 }}>{c.name}</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.preview}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginBottom: 4 }}>{c.time}</div>
                    {c.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--coral)', color: 'white', fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>{c.unread}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: conversations[active].gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: 'white' }}>{conversations[active].initials}</div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{conversations[active].name}</h3>
                <p style={{ fontSize: '0.7rem', color: conversations[active].online ? 'var(--mint)' : 'var(--text-soft)', fontWeight: 500 }}>{conversations[active].online ? 'Online now' : 'Offline'}</p>
              </div>
            </div>
            <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', minHeight: 0 }}>
              {msgs[active].map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.self ? 'row-reverse' : 'row' }}>
                  {!m.self && <div style={{ width: 32, height: 32, borderRadius: 10, background: conversations[active].gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{conversations[active].initials}</div>}
                  <div style={{ padding: '10px 16px', borderRadius: 16, fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '70%', background: m.self ? 'linear-gradient(135deg, var(--peach), var(--coral))' : 'var(--bg)', color: m.self ? 'white' : 'var(--text-body)', borderTopRightRadius: m.self ? 4 : 16, borderTopLeftRadius: m.self ? 16 : 4 }}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '18px 24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." style={{ flex: 1, padding: '12px 18px', borderRadius: 14, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.06)', fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text-dark)', outline: 'none' }} />
              <button onClick={send} style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
