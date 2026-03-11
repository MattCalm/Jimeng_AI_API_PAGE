function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthed) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: '请先登录后再使用。'
    }
  });
}

module.exports = {
  requireAuth
};
