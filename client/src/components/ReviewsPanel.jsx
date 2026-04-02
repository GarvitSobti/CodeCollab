import React, { useEffect, useMemo, useState } from 'react';

function formatReviewDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
}

function RatingPill({ rating }) {
  const positive = rating === 'POSITIVE';

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: '0.64rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: positive ? 'rgba(102,187,106,0.14)' : 'rgba(224,93,80,0.12)',
        color: positive ? 'var(--mint)' : 'var(--accent)',
      }}
    >
      {positive ? 'Positive' : 'Needs Work'}
    </span>
  );
}

export default function ReviewsPanel({
  title = 'Peer Reviews',
  reviews = [],
  positiveCount = 0,
  negativeCount = 0,
  total = 0,
  loading = false,
  error = '',
  compose = null,
}) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState('POSITIVE');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const availableTeams = useMemo(
    () => (compose?.eligibility?.sharedTeams || []).filter((team) => !team.alreadyReviewed),
    [compose?.eligibility?.sharedTeams]
  );

  useEffect(() => {
    if (!compose?.enabled) {
      return;
    }

    if (availableTeams.length === 1) {
      setSelectedTeamId(availableTeams[0].id);
      return;
    }

    setSelectedTeamId((current) => (
      availableTeams.some((team) => team.id === current) ? current : (availableTeams[0]?.id || '')
    ));
  }, [availableTeams, compose?.enabled]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!compose?.enabled || !compose?.onSubmit) {
      return;
    }

    await compose.onSubmit({
      rating,
      content,
      isAnonymous,
      teamId: availableTeams.length > 1 ? selectedTeamId : undefined,
    });

    setContent('');
    setRating('POSITIVE');
    setIsAnonymous(false);
  };

  return (
    <div className="profile-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <h3 className="profile-section-title" style={{ marginBottom: 0 }}>{title}</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)' }}>
            {positiveCount} positive
          </span>
          <span style={{ padding: '6px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(224,93,80,0.1)', color: 'var(--accent)' }}>
            {negativeCount} negative
          </span>
          <span style={{ padding: '6px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: 'var(--bg)', color: 'var(--text-soft)' }}>
            {total} total
          </span>
        </div>
      </div>

      {compose && (
        <div style={{ marginBottom: 18, padding: 16, borderRadius: 16, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-dark)' }}>Leave a teammate review</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 2 }}>
                {compose.eligibility?.reason || 'Share honest feedback after collaborating together.'}
              </div>
            </div>
            {compose.loading && <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>Loading...</span>}
          </div>

          {compose.enabled ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {['POSITIVE', 'NEGATIVE'].map((option) => {
                  const active = rating === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRating(option)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: active
                          ? (option === 'POSITIVE' ? 'rgba(102,187,106,0.14)' : 'rgba(224,93,80,0.12)')
                          : 'var(--bg-card)',
                        color: active
                          ? (option === 'POSITIVE' ? 'var(--mint)' : 'var(--accent)')
                          : 'var(--text-soft)',
                      }}
                    >
                      {option === 'POSITIVE' ? 'Positive' : 'Needs Work'}
                    </button>
                  );
                })}
              </div>

              {availableTeams.length > 1 && (
                <select
                  value={selectedTeamId}
                  onChange={(event) => setSelectedTeamId(event.target.value)}
                  style={{
                    width: '100%',
                    marginBottom: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-card)',
                    fontFamily: 'inherit',
                    fontSize: '0.8rem',
                    color: 'var(--text-dark)',
                  }}
                >
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}{team.hackathon?.name ? ` · ${team.hackathon.name}` : ''}
                    </option>
                  ))}
                </select>
              )}

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="What was this person like to build with?"
                rows={4}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-card)',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  resize: 'vertical',
                  color: 'var(--text-dark)',
                }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                />
                Submit anonymously
              </label>

              {compose.error && (
                <p style={{ margin: '0 0 10px', padding: '10px 12px', borderRadius: 10, background: 'rgba(224,93,80,0.1)', color: 'var(--accent)', fontSize: '0.74rem', fontWeight: 600 }}>
                  {compose.error}
                </p>
              )}
              {compose.success && (
                <p style={{ margin: '0 0 10px', padding: '10px 12px', borderRadius: 10, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)', fontSize: '0.74rem', fontWeight: 600 }}>
                  {compose.success}
                </p>
              )}

              <button
                type="submit"
                disabled={compose.submitting || !content.trim() || (availableTeams.length > 1 && !selectedTeamId)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), var(--peach))',
                  color: 'white',
                  cursor: compose.submitting ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  opacity: compose.submitting || !content.trim() || (availableTeams.length > 1 && !selectedTeamId) ? 0.6 : 1,
                }}
              >
                {compose.submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
              {compose.eligibility?.reason || 'You cannot review this user yet.'}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="profile-empty">Loading reviews...</div>
      ) : error ? (
        <div className="profile-empty">
          Could not load reviews.
          <div className="profile-empty-hint">{error}</div>
        </div>
      ) : reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((review) => (
            <div key={review.id} className="exp-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 11, background: review.isAnonymous ? 'linear-gradient(135deg,#9e9e9e,#757575)' : 'linear-gradient(135deg,var(--accent),var(--peach))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.7rem' }}>
                    {review.isAnonymous ? 'AN' : getInitials(review.author?.name)}
                  </div>
                  <div>
                    <div className="exp-card-title" style={{ marginBottom: 2 }}>
                      {review.isAnonymous ? 'Anonymous teammate' : review.author?.name || 'Teammate'}
                    </div>
                    <div className="exp-card-meta">
                      {[review.team?.name, review.team?.hackathon?.name, formatReviewDate(review.createdAt)].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
                <RatingPill rating={review.rating} />
              </div>
              <div className="exp-card-desc">{review.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-empty">
          No reviews yet.
          <div className="profile-empty-hint">Reviews will appear here after teammates leave feedback.</div>
        </div>
      )}
    </div>
  );
}
