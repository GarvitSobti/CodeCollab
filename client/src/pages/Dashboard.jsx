import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TeamsSidebar from '../components/teams/TeamsSidebar';
import TeamWorkspace from '../components/teams/TeamWorkspace';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import InviteMemberModal from '../components/teams/InviteMemberModal';
import PendingInvites from '../components/teams/PendingInvites';
import { useChatContext } from '../contexts/ChatContext';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/teams');
      const fetched = res.data.teams || [];
      setTeams(fetched);
      if (fetched.length > 0 && !fetched.find((t) => t.id === selectedTeamId)) {
        setSelectedTeamId(fetched[0].id);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

  const handleDM = async (member) => {
    // Chat system uses Firebase UIDs, not Prisma UUIDs
    const firebaseUid = member.user?.firebaseUid || member.firebaseUid;
    if (!firebaseUid) {
      console.error('No firebaseUid found for member:', member);
      return;
    }
    await openOrCreateDM(firebaseUid);
    navigate('/messages');
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      await api.post(`/api/v1/teams/${teamId}/leave`);
      await fetchTeams();
    } catch (err) {
      console.error('Failed to leave team:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <PendingInvites onRespond={fetchTeams} />

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
            {/* Skeleton sidebar */}
            <div style={{
              borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
              padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 14, background: 'var(--bg-warm)',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--border)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.1}s`, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ height: 12, width: '70%', borderRadius: 6, background: 'var(--border)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                    <div style={{ height: 10, width: '45%', borderRadius: 6, background: 'var(--border)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Skeleton workspace */}
            <div style={{
              borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{ height: 6, background: 'var(--bg-warm)' }} />
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ height: 22, width: '40%', borderRadius: 6, background: 'var(--bg-warm)', animation: 'pulse 1.8s ease-in-out infinite' }} />
                <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--bg-warm)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: '0.1s' }} />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      width: 56, height: 56, borderRadius: 14, background: 'var(--bg-warm)',
                      animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.1}s`,
                    }} />
                  ))}
                </div>
                <div style={{ height: 1, background: 'var(--border)', marginTop: 8 }} />
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 14, width: `${80 - i * 15}%`, borderRadius: 6, background: 'var(--bg-warm)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>👥</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>No teams yet</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', marginBottom: 24 }}>
              Create a team for a hackathon or accept an invite to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 28px', borderRadius: 14, fontSize: '0.88rem', fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: 'var(--accent)', color: 'white',
              }}
            >
              + Create a Team
            </button>
          </div>
        ) : (
          <div className="teams-dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
            <TeamsSidebar
              teams={teams}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
              onCreateTeam={() => setShowCreateModal(true)}
            />
            <TeamWorkspace
              team={selectedTeam}
              onOpenMessages={() => navigate('/messages')}
              onDM={handleDM}
              onInviteMember={() => setShowInviteModal(true)}
              onLeaveTeam={handleLeaveTeam}
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(team) => {
            setShowCreateModal(false);
            fetchTeams().then(() => setSelectedTeamId(team.id));
          }}
        />
      )}

      {showInviteModal && selectedTeam && (
        <InviteMemberModal
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            setShowInviteModal(false);
            fetchTeams();
          }}
        />
      )}
    </div>
  );
}
