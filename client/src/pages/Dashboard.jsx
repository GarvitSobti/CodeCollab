import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import TeamsSidebar from '../components/teams/TeamsSidebar';
import TeamWorkspace from '../components/teams/TeamWorkspace';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import InviteMemberModal from '../components/teams/InviteMemberModal';
import PendingInvites from '../components/teams/PendingInvites';
import { useChatContext } from '../contexts/ChatContext';
import { usePageLoading } from '../contexts/PageLoadingContext';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();
  const { setPageLoading } = usePageLoading();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const initialLoad = useRef(true);

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
      if (initialLoad.current) {
        initialLoad.current = false;
        setPageLoading(false);
      }
    }
  }, [selectedTeamId, setPageLoading]);

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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2, padding: '28px 40px 60px', maxWidth: 1300, margin: '0 auto' }}
      >
        <PendingInvites onRespond={fetchTeams} />

        {loading ? null : teams.length === 0 ? (
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
      </motion.div>

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
