import React, { useState } from 'react';
import api from '../../services/api';

export default function InviteMemberModal({ teamId, teamName, onClose, onInvited }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/v1/teams/${teamId}/invite`, {
        email: email.trim(),
        message: message.trim() || undefined,
      });
      onInvited();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-heavy)' }}
      >
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>Invite to {teamName}</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: 20 }}>
          Enter the email of a registered CodeCollab user.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-body)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@university.edu"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)',
              background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.88rem', marginBottom: 16,
              outline: 'none', color: 'var(--text-dark)', boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-body)' }}>
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey, want to join our team?"
            rows={2}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)',
              background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.88rem', marginBottom: 16,
              outline: 'none', color: 'var(--text-dark)', resize: 'vertical', boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-soft)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              style={{
                padding: '10px 24px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700,
                border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer',
                fontFamily: 'inherit', opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
