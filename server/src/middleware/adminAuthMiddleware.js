const jwt = require('jsonwebtoken');
const { findAdminByEmail } = require('../services/adminDataStore');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing admin token' });
  }

  try {
    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-admin-secret';
    const payload = jwt.verify(token, secret);
    const admin = findAdminByEmail(payload.email);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      companyId: admin.companyId,
      fullName: admin.fullName
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
}

module.exports = adminAuthMiddleware;
