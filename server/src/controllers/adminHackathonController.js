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
const fs = require('fs');
const path = require('path');

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function sanitizeFileName(value) {
  return String(value || 'logo')
    .replace(/[^a-zA-Z0-9_.-]/g, '-')
    .toLowerCase();
}

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

async function uploadSponsorLogo(req, res) {
  const { fileName, mimeType, base64Data } = req.body || {};

  if (!mimeType || !base64Data) {
    return res.status(400).json({ success: false, message: 'mimeType and base64Data are required' });
  }

  if (!ALLOWED_MIME_TYPES.has(String(mimeType))) {
    return res.status(400).json({ success: false, message: 'Only png, jpeg, and webp files are allowed' });
  }

  const buffer = Buffer.from(String(base64Data), 'base64');
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) {
    return res.status(400).json({ success: false, message: 'File must be non-empty and <= 2MB' });
  }

  const extension = mimeType === 'image/png' ? 'png' : (mimeType === 'image/webp' ? 'webp' : 'jpg');
  const safeName = sanitizeFileName(fileName);
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'sponsor-logos', req.admin.companyId);
  fs.mkdirSync(uploadDir, { recursive: true });

  const storedName = `${Date.now()}-${safeName}.${extension}`;
  const targetPath = path.join(uploadDir, storedName);
  fs.writeFileSync(targetPath, buffer);

  const relativePath = `/uploads/sponsor-logos/${req.admin.companyId}/${storedName}`;

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'SPONSOR_LOGO_UPLOADED',
    entityType: 'SPONSOR_LOGO',
    entityId: storedName,
    after: { path: relativePath, mimeType, size: buffer.length }
  });

  return res.status(201).json({
    success: true,
    data: {
      path: relativePath,
      mimeType,
      size: buffer.length
    }
  });
}

module.exports = {
  list,
  create,
  update,
  publish,
  clone,
  archive,
  remove,
  uploadSponsorLogo
};
