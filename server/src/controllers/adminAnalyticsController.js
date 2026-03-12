const { getHackathonById, getAnalyticsForHackathon, listAuditLogs } = require('../services/adminDataStore');

function getScopedHackathon(req) {
  const hackathon = getHackathonById(req.params.hackathonId);
  if (!hackathon || hackathon.companyId !== req.admin.companyId) return null;
  return hackathon;
}

function registrations(req, res) {
  const hackathon = getScopedHackathon(req);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const data = getAnalyticsForHackathon(hackathon.id);
  const totals = data.registrationsByDay.reduce(
    (acc, day) => {
      acc.views += day.views;
      acc.clicks += day.clicks;
      acc.signups += day.registrations;
      return acc;
    },
    { views: 0, clicks: 0, signups: 0 }
  );

  const dropOff = {
    viewsToClicks: totals.views ? Number((((totals.views - totals.clicks) / totals.views) * 100).toFixed(1)) : 0,
    clicksToSignups: totals.clicks ? Number((((totals.clicks - totals.signups) / totals.clicks) * 100).toFixed(1)) : 0
  };

  return res.json({
    success: true,
    data: {
      overTime: data.registrationsByDay,
      totals,
      dropOff
    }
  });
}

function demographics(req, res) {
  const hackathon = getScopedHackathon(req);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }
  const data = getAnalyticsForHackathon(hackathon.id);
  return res.json({ success: true, data: data.demographics });
}

function skills(req, res) {
  const hackathon = getScopedHackathon(req);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }
  const data = getAnalyticsForHackathon(hackathon.id);
  return res.json({ success: true, data: data.skills });
}

function engagement(req, res) {
  const hackathon = getScopedHackathon(req);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }
  const data = getAnalyticsForHackathon(hackathon.id);
  return res.json({ success: true, data: data.engagement });
}

function talent(req, res) {
  const hackathon = getScopedHackathon(req);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }
  const data = getAnalyticsForHackathon(hackathon.id);
  return res.json({ success: true, data: data.talentInsights });
}

function exportParticipants(req, res) {
  const hackathon = getScopedHackathon(req);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const format = String(req.query.format || 'csv').toLowerCase();

  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${hackathon.id}-participants.pdf"`);
    const text = `%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF`;
    return res.send(text);
  }

  const csv = [
    'name,email,university,major,year,teamType',
    'Alex Tan,alex@example.com,NUS,Computer Science,3,Team',
    'Priya Nair,priya@example.com,SMU,Information Systems,2,Individual',
    'Wei Ming,wei@example.com,NTU,Computer Engineering,4,Team'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${hackathon.id}-participants.csv"`);
  return res.send(csv);
}

function auditLogs(req, res) {
  const logs = listAuditLogs(req.admin.companyId);
  return res.json({ success: true, data: logs });
}

module.exports = {
  registrations,
  demographics,
  skills,
  engagement,
  talent,
  exportParticipants,
  auditLogs
};
