import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import TeamsSidebar from '../components/teams/TeamsSidebar';
import TeamWorkspace from '../components/teams/TeamWorkspace';
import { useChatContext } from '../contexts/ChatContext';
import teamsData from '../data/teamsData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();
  const [selectedTeamId, setSelectedTeamId] = useState(teamsData[0]?.id || '');

  const selectedTeam = useMemo(
    () => teamsData.find((team) => team.id === selectedTeamId) || teamsData[0],
    [selectedTeamId],
  );

  const handleDM = async (member) => {
    await openOrCreateDM(member.id);
    navigate('/messages');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="teams-dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          <TeamsSidebar teams={teamsData} selectedTeamId={selectedTeamId} onSelectTeam={setSelectedTeamId} />
          <TeamWorkspace team={selectedTeam} onOpenMessages={() => navigate('/messages')} onDM={handleDM} />
        </div>

      </div>
    </div>
  );
}
