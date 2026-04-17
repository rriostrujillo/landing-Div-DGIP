// Auth guard middleware
exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/admin/login');
  }
  res.locals.currentUser = req.session.user;
  next();
};

// Role guard
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      req.flash('error', 'No tienes permisos para esta acción');
      return res.redirect('/admin');
    }
    next();
  };
};
