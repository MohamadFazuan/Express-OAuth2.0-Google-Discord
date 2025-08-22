/**
 * Authentication Middleware
 * Provides middleware functions for protecting routes and handling authentication
 */

/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: "Not authenticated",
    message: "Please log in to access this resource",
    authenticated: false,
  });
};

/**
 * Middleware to check authentication but allow unauthenticated users to continue
 * Adds user info to request if authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = (req, res, next) => {
  // Always continue, but mark authentication status
  req.isAuth = req.isAuthenticated() && req.user;
  return next();
};

/**
 * Middleware to check if user is authenticated and has specific provider
 * @param {string} provider - OAuth provider ('google', 'discord')
 * @returns {Function} Express middleware function
 */
const requireProvider = (provider) => {
  return (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
        message: "Please log in to access this resource",
      });
    }

    if (req.user.provider !== provider) {
      return res.status(403).json({
        success: false,
        error: "Invalid provider",
        message: `This resource requires ${provider} authentication`,
        currentProvider: req.user.provider,
      });
    }

    return next();
  };
};

/**
 * Middleware to attach user info to response locals for templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const attachUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    res.locals.user = req.user;
    res.locals.isAuthenticated = true;
  } else {
    res.locals.user = null;
    res.locals.isAuthenticated = false;
  }
  return next();
};

/**
 * Middleware for handling authentication errors gracefully
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleAuthError = (err, req, res, next) => {
  if (err.name === "AuthenticationError") {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: err.message || "Invalid credentials",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Session expired",
      message: "Please log in again",
    });
  }

  // Pass other errors to default error handler
  return next(err);
};

module.exports = {
  isAuthenticated,
  optionalAuth,
  requireProvider,
  attachUser,
  handleAuthError,
};
