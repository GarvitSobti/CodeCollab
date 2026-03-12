const {
  createHackathon,
  updateHackathon,
  listHackathonsByCompany,
  getHackathonById,
  publishHackathon,
  cloneHackathon,
  archiveHackathon,
  deleteHackathon,
  pushAuditLog
} = require('../services/adminDataStore');

async function list(req, res) {
  const data = listHackathonsByCompany(req.admin.companyId);
  return res.json({ success: true, data });
}

async function create(req, res) {
  if (!req.body?.eventName) {
    return res.status(400).json({ success: false, message: 'eventName is required' });
  }
  const hackathon = createHackathon(req.admin.companyId, req.body);

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'HACKATHON_CREATED',
    entityType: 'HACKATHON',
    entityId: hackathon.id,
    after: hackathon
  });

  return res.status(201).json({ success: true, data: hackathon });
}

async function update(req, res) {
  const existing = getHackathonById(req.params.id);
  if (!existing || existing.companyId !== req.admin.companyId) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const before = { ...existing };
  const updated = updateHackathon(req.params.id, req.body || {});

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'HACKATHON_UPDATED',
    entityType: 'HACKATHON',
    entityId: updated.id,
    before,
    after: updated
  });

  return res.json({ success: true, data: updated });
}

async function publish(req, res) {
  const existing = getHackathonById(req.params.id);
  if (!existing || existing.companyId !== req.admin.companyId) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const published = publishHackathon(req.params.id);

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'HACKATHON_PUBLISHED',
    entityType: 'HACKATHON',
    entityId: published.id,
    after: published
  });

  return res.json({ success: true, data: published });
}

async function clone(req, res) {
  const source = getHackathonById(req.params.id);
  if (!source || source.companyId !== req.admin.companyId) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const cloned = cloneHackathon(req.params.id, req.admin.companyId);

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'HACKATHON_CLONED',
    entityType: 'HACKATHON',
    entityId: cloned.id,
    after: cloned
  });

  return res.status(201).json({ success: true, data: cloned });
}

async function archive(req, res) {
  const source = getHackathonById(req.params.id);
  if (!source || source.companyId !== req.admin.companyId) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const archived = archiveHackathon(req.params.id);

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'HACKATHON_ARCHIVED',
    entityType: 'HACKATHON',
    entityId: archived.id,
    after: archived
  });

  return res.json({ success: true, data: archived });
}

async function remove(req, res) {
  const source = getHackathonById(req.params.id);
  if (!source || source.companyId !== req.admin.companyId) {
    return res.status(404).json({ success: false, message: 'Hackathon not found' });
  }

  const deleted = deleteHackathon(req.params.id);
  if (!deleted) {
    return res.status(500).json({ success: false, message: 'Failed to delete hackathon' });
  }

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'HACKATHON_DELETED',
    entityType: 'HACKATHON',
    entityId: req.params.id,
    before: source
  });

  return res.json({ success: true });
}

module.exports = {
  list,
  create,
  update,
  publish,
  clone,
  archive,
  remove
};
