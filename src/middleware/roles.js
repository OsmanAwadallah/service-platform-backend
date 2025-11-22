const asyncHandler = require('express-async-handler');

const authorize = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient role');
    }
    next();
  });
};

module.exports = { authorize };