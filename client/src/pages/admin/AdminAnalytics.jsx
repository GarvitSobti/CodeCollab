import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

const COLORS = ['#ff8a65', '#42a5f5', '#66bb6a', '#b39ddb', '#ffca28'];

export default function AdminAnalytics() {
  const { id } = useParams();

  const [registrations, setRegistrations] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [skills, setSkills] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [talent, setTalent] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [compareId, setCompareId] = useState('');
  const [compareRegistrations, setCompareRegistrations] = useState(null);
  const [compareEngagement, setCompareEngagement] = useState(null);

  useEffect(() => {
    adminApi.listHackathons().then((response) => {
      setHackathons((response.data || []).filter((item) => item.id !== id));
    });

    Promise.all([
      adminApi.getRegistrationsAnalytics(id),
      adminApi.getDemographicsAnalytics(id),
      adminApi.getSkillsAnalytics(id),
      adminApi.getEngagementAnalytics(id),
      adminApi.getTalentAnalytics(id)
    ]).then(([r, d, s, e, t]) => {
      setRegistrations(r.data);
      setDemographics(d.data);
      setSkills(s.data);
      setEngagement(e.data);
      setTalent(t.data);
    });
  }, [id]);

  useEffect(() => {
    if (!compareId) {
      setCompareRegistrations(null);
      setCompareEngagement(null);
      return;
    }

    Promise.all([
      adminApi.getRegistrationsAnalytics(compareId),
      adminApi.getEngagementAnalytics(compareId)
    ]).then(([registrationsResponse, engagementResponse]) => {
      setCompareRegistrations(registrationsResponse.data);
      setCompareEngagement(engagementResponse.data);
    });
  }, [compareId]);

  const topMetrics = useMemo(() => {
    if (!registrations || !engagement) return [];
    return [
      { label: 'Views', value: registrations.totals.views },
      { label: 'Clicks', value: registrations.totals.clicks },
      { label: 'Signups', value: registrations.totals.signups },
      { label: 'Profile Completion', value: `${engagement.profileCompletionRate}%` },
      { label: 'Team Formation', value: `${engagement.teamFormationProgress}%` }
    ];
  }, [registrations, engagement]);

  if (!registrations || !demographics || !skills || !engagement || !talent) {
    return (
      <AdminLayout>
        <div>Loading analytics...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: '1.35rem' }}>Analytics</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={compareId} onChange={(event) => setCompareId(event.target.value)} style={{ ...buttonLinkStyle, minWidth: 220 }}>
            <option value="">Compare with another hackathon</option>
            {hackathons.map((hackathon) => (
              <option key={hackathon.id} value={hackathon.id}>{hackathon.eventName}</option>
            ))}
          </select>
          <a href={adminApi.exportParticipantsUrl(id, 'csv')} target="_blank" rel="noreferrer" style={buttonLinkStyle}>Export CSV</a>
          <a href={adminApi.exportParticipantsUrl(id, 'pdf')} target="_blank" rel="noreferrer" style={buttonLinkStyle}>Export PDF</a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 10, marginBottom: 14 }}>
        {topMetrics.map((metric) => (
          <div key={metric.label} style={{ background: 'white', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)', padding: 12 }}>
            <div style={{ color: 'var(--text-soft)', fontSize: '0.72rem' }}>{metric.label}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <section style={panelStyle}>
          <h3 style={titleStyle}>Registrations Over Time</h3>
          <SimpleLineChart data={registrations.overTime} />
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-soft)' }}>
            Drop-off: views→clicks {registrations.dropOff.viewsToClicks}% · clicks→signups {registrations.dropOff.clicksToSignups}%
          </div>
        </section>

        <section style={panelStyle}>
          <h3 style={titleStyle}>University Distribution</h3>
          <SimplePieChart data={demographics.universityDistribution} colors={COLORS} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <section style={panelStyle}>
          <h3 style={titleStyle}>Major Breakdown</h3>
          <SimpleBarChart data={demographics.majorBreakdown} valueKey="value" labelKey="label" color="#b39ddb" />
        </section>

        <section style={panelStyle}>
          <h3 style={titleStyle}>Common Skills</h3>
          <SimpleBarChart data={skills.commonSkills} valueKey="value" labelKey="skill" color="#66bb6a" />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
        <section style={panelStyle}>
          <h3 style={titleStyle}>Year of Study</h3>
          <SimpleBarChart data={demographics.yearBreakdown} valueKey="value" labelKey="label" color="#42a5f5" />
        </section>
        <section style={panelStyle}>
          <h3 style={titleStyle}>Team vs Individual</h3>
          <SimpleBarChart data={demographics.teamVsIndividual} valueKey="value" labelKey="label" color="#ff8a65" />
        </section>
        <section style={panelStyle}>
          <h3 style={titleStyle}>Stack Preferences</h3>
          <SimpleBarChart data={skills.stackPreferences} valueKey="value" labelKey="stack" color="#ffca28" />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
        <section style={panelStyle}>
          <h3 style={titleStyle}>Engagement</h3>
          <p style={listText}>Active Participants: {engagement.activeParticipants}%</p>
          <p style={listText}>Messages/Day: {engagement.messageFrequencyPerDay}</p>
          <p style={listText}>Profile Completion: {engagement.profileCompletionRate}%</p>
        </section>

        <section style={panelStyle}>
          <h3 style={titleStyle}>Talent Insights</h3>
          <p style={listText}>Skill Diversity Score: {talent.skillDiversityScore}</p>
          <p style={listText}>Most Active Participants: {talent.mostActiveParticipants}</p>
          {talent.topPerformers.map((performer) => (
            <p key={performer.name} style={listText}>{performer.name}: {performer.score}</p>
          ))}
        </section>

        <section style={panelStyle}>
          <h3 style={titleStyle}>Skill Gaps</h3>
          {skills.gapAreas.map((gap) => (
            <p key={gap} style={listText}>{gap}</p>
          ))}
          <p style={listText}>Avg Skill Level: {skills.averageSkillLevel}</p>
        </section>
      </div>

      {compareRegistrations && compareEngagement && (
        <div style={{ ...panelStyle, marginTop: 12 }}>
          <h3 style={titleStyle}>Comparative Snapshot</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10 }}>
            <CompareCard
              label="Registrations"
              primary={registrations.totals.signups}
              secondary={compareRegistrations.totals.signups}
            />
            <CompareCard
              label="Views"
              primary={registrations.totals.views}
              secondary={compareRegistrations.totals.views}
            />
            <CompareCard
              label="Profile Completion"
              primary={engagement.profileCompletionRate}
              secondary={compareEngagement.profileCompletionRate}
              suffix="%"
            />
            <CompareCard
              label="Team Formation"
              primary={engagement.teamFormationProgress}
              secondary={compareEngagement.teamFormationProgress}
              suffix="%"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const panelStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.06)',
  padding: 14
};

const titleStyle = {
  fontSize: '0.95rem',
  marginBottom: 10
};

const listText = {
  fontSize: '0.82rem',
  color: 'var(--text-body)',
  marginBottom: 6
};

const buttonLinkStyle = {
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.1)',
  background: 'white',
  color: 'var(--text-body)',
  fontSize: '0.78rem'
};

function SimpleLineChart({ data }) {
  if (!data?.length) {
    return <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>No line chart data.</div>;
  }

  const width = 700;
  const height = 220;
  const padding = 28;
  const maxValue = Math.max(...data.flatMap((item) => [item.registrations || 0, item.clicks || 0, item.views || 0]), 1);

  const buildPoints = (key) => data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((item[key] || 0) / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 220, background: '#fafafa', borderRadius: 10 }}>
        <polyline fill="none" stroke="#66bb6a" strokeWidth="2" points={buildPoints('views')} />
        <polyline fill="none" stroke="#42a5f5" strokeWidth="2" points={buildPoints('clicks')} />
        <polyline fill="none" stroke="#ff8a65" strokeWidth="2" points={buildPoints('registrations')} />
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', marginTop: 6 }}>
        <span style={{ color: '#66bb6a' }}>● Views</span>
        <span style={{ color: '#42a5f5' }}>● Clicks</span>
        <span style={{ color: '#ff8a65' }}>● Registrations</span>
      </div>
    </div>
  );
}

function SimplePieChart({ data, colors }) {
  if (!data?.length) {
    return <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>No pie chart data.</div>;
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  let current = 0;
  const segments = data.map((item, index) => {
    const from = (current / total) * 100;
    current += item.value;
    const to = (current / total) * 100;
    return `${colors[index % colors.length]} ${from}% ${to}%`;
  }).join(', ');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center' }}>
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `conic-gradient(${segments})`
      }} />
      <div>
        {data.map((item, index) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[index % colors.length], display: 'inline-block' }} />
            <span>{item.name} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({ data, valueKey, labelKey, color }) {
  if (!data?.length) {
    return <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>No bar chart data.</div>;
  }
  const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((item) => {
        const width = ((item[valueKey] || 0) / maxValue) * 100;
        return (
          <div key={item[labelKey]}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
              <span>{item[labelKey]}</span>
              <span>{item[valueKey]}</span>
            </div>
            <div style={{ width: '100%', height: 10, background: '#f1f1f1', borderRadius: 999 }}>
              <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 999 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompareCard({ label, primary, secondary, suffix = '' }) {
  const diff = primary - secondary;
  const positive = diff >= 0;
  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, padding: 12, background: '#fcfcfc' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{primary}{suffix}</div>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-soft)' }}>Compared event: {secondary}{suffix}</div>
      <div style={{ fontSize: '0.78rem', color: positive ? 'var(--mint)' : 'var(--coral)', marginTop: 4 }}>
        {positive ? '+' : ''}{diff}{suffix}
      </div>
    </div>
  );
}
