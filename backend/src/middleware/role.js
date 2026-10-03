const { sendError } = require('../utils/responseHandler');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 401, 'Unauthorized request.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
