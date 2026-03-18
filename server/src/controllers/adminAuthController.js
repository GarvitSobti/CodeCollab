const jwt = require('jsonwebtoken');
const {
  findAdminByEmail,
  getCompanyById,
  updateCompanyProfile,
  pushAuditLog
} = require('../services/adminDataStore');

function signAdminToken(admin) {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-admin-secret';
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      companyId: admin.companyId
    },
    secret,
    { expiresIn: '12h' }
  );
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const admin = findAdminByEmail(email);
  if (!admin || admin.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signAdminToken(admin);
  const company = getCompanyById(admin.companyId);

  return res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      fullName: admin.fullName,
      companyId: admin.companyId
    },
    company
  });
}

async function me(req, res) {
  const company = getCompanyById(req.admin.companyId);
  return res.json({
    success: true,
    admin: req.admin,
    company
  });
}

async function updateProfile(req, res) {
  const allowed = ['name', 'website', 'email', 'logoUrl', 'description'];
  const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));

  const company = updateCompanyProfile(req.admin.companyId, patch);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company profile not found' });
  }

  pushAuditLog({
    companyId: req.admin.companyId,
    adminId: req.admin.id,
    action: 'COMPANY_PROFILE_UPDATED',
    entityType: 'COMPANY',
    entityId: req.admin.companyId,
    after: patch
  });

  return res.json({ success: true, company });
}

module.exports = {
  login,
  me,
  updateProfile
};
