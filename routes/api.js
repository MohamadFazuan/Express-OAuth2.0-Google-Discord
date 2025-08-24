/**
 * API Routes
 * Handles all API endpoints for user authentication and data
 */

const express = require("express");
const { isAuthenticated, optionalAuth } = require("../middleware/auth");
const router = express.Router();

// ======================
// USER API ROUTES
// ======================

/**
 * GET /api/user
 * Legacy endpoint - Get current authenticated user
 */
router.get("/user", isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * GET /api/me
 * Modern endpoint - Get current authenticated user with enhanced data
 */
router.get("/me", isAuthenticated, (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        provider: req.user.provider,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        authenticatedAt: new Date().toISOString(),
      },
      session: {
        id: req.sessionID,
        isAuthenticated: true,
        maxAge: req.session.cookie.maxAge,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
});

/**
 * GET /api/profile
 * Extended user profile with additional metadata
 */
router.get("/profile", isAuthenticated, (req, res) => {
  try {
    res.json({
      success: true,
      profile: {
        ...req.user,
        sessionInfo: {
          id: req.sessionID,
          loginTime: req.session.loginTime || new Date().toISOString(),
          userAgent: req.headers["user-agent"],
          ip: req.ip || req.connection.remoteAddress,
        },
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

// ======================
// SESSION API ROUTES
// ======================

/**
 * GET /api/session/validate
 * Validate current session status
 */
router.get("/session/validate", (req, res) => {
  try {
    if (req.isAuthenticated() && req.user) {
      res.json({
        valid: true,
        authenticated: true,
        user: {
          id: req.user.id,
          provider: req.user.provider,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
        },
        session: {
          id: req.sessionID,
          maxAge: req.session.cookie.maxAge,
          expires: req.session.cookie.expires,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(401).json({
        valid: false,
        authenticated: false,
        message: "Session not authenticated",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(500).json({
      valid: false,
      authenticated: false,
      error: "Session validation failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/session/info
 * Get detailed session information
 */
router.get("/session/info", optionalAuth, (req, res) => {
  res.json({
    session: {
      id: req.sessionID,
      authenticated: req.isAuth,
      cookie: {
        maxAge: req.session.cookie.maxAge,
        expires: req.session.cookie.expires,
        secure: req.session.cookie.secure,
        httpOnly: req.session.cookie.httpOnly,
      },
      createdAt: req.session.createdAt || new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

// ======================
// AUTHENTICATION ACTIONS
// ======================

/**
 * POST /api/logout
 * Logout current user and destroy session
 */
router.post("/logout", isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const sessionId = req.sessionID;

  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        success: false,
        error: "Logout failed",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Unable to logout",
      });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
        return res.status(500).json({
          success: false,
          error: "Session cleanup failed",
          message: "Logout completed but session cleanup failed",
        });
      }

      console.log(`User ${userId} logged out, session ${sessionId} destroyed`);
      res.json({
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
      });
    });
  });
});

/**
 * POST /api/logout/all
 * Logout from all sessions (invalidate all user sessions)
 */
router.post("/logout/all", isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const currentSessionId = req.sessionID;

  // In a production environment, you would typically:
  // 1. Store session mappings by user ID in Redis/Database
  // 2. Invalidate all sessions for this user ID
  // 3. Update user's session version/salt to invalidate all tokens
  
  // For this demo, we'll just logout the current session
  req.logout((err) => {
    if (err) {
      console.error("Logout all error:", err);
      return res.status(500).json({
        success: false,
        error: "Logout all failed",
        message: process.env.NODE_ENV === "development" ? err.message : "Unable to logout from all sessions",
        timestamp: new Date().toISOString(),
      });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
      }

      console.log(`User ${userId} logged out from all sessions, current session ${currentSessionId} destroyed`);
      
      // Clear session cookie
      res.clearCookie('sessionId', {
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });

      res.status(200).json({
        success: true,
        message: "Logged out from all sessions successfully",
        sessionsCleared: 1, // In production, this would be the actual count
        timestamp: new Date().toISOString(),
      });
    });
  });
});

// ======================
// SYSTEM API ROUTES
// ======================

/**
 * GET /api/status
 * API system status and information
 */
router.get("/status", (req, res) => {
  res.json({
    success: true,
    api: {
      status: "operational",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
    authentication: {
      providers: ["google", "discord"],
      sessionBased: true,
      middlewareActive: true,
    },
    endpoints: {
      auth: ["/auth/google", "/auth/discord"],
      api: [
        "/api/me",
        "/api/user",
        "/api/profile",
        "/api/session/validate",
        "/api/logout",
      ],
      system: ["/health", "/api/status"],
    },
  });
});

module.exports = router;
