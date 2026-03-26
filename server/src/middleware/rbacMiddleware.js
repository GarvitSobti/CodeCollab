function allowRoles(...roles) {
  return (req, res, next) => {
    const role = req.admin?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Insufficient role permissions' });
    }
    return next();
  };
}

module.exports = { allowRoles };
