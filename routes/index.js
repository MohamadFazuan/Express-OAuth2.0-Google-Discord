const express = require("express");
const passport = require("passport");
const { optionalAuth, attachUser } = require("../middleware/auth");
const apiRoutes = require("./api");
const router = express.Router();

// Apply user attachment middleware to all routes
router.use(attachUser);

/* GET home page. */
router.get("/", optionalAuth, function (req, res, next) {
  res.render("index", {
    title: "Express OAuth2.0 Demo",
    user: req.isAuth ? req.user : null,
    authenticated: req.isAuth,
  });
});

// ======================
// AUTHENTICATION ROUTES
// ======================

// Google OAuth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }?error=auth_failed`,
  }),
  (req, res) => {
    // Store login time in session
    req.session.loginTime = new Date().toISOString();
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/success`
    );
  }
);

// Discord OAuth Routes
router.get("/auth/discord", passport.authenticate("discord"));

router.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }?error=auth_failed`,
  }),
  (req, res) => {
    // Store login time in session
    req.session.loginTime = new Date().toISOString();
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/success`
    );
  }
);

// ======================
// LOGOUT ROUTES
// ======================

// GET logout route - for direct browser navigation
router.get("/auth/logout", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}?message=already_logged_out`
    );
  }

  const userId = req.user ? req.user.id : "unknown";
  const sessionId = req.sessionID;

  req.logout((err) => {
    if (err) {
      console.error("GET Logout error:", err);
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}?error=logout_failed`
      );
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
      }

      console.log(
        `User ${userId} logged out via GET, session ${sessionId} destroyed`
      );

      // Clear session cookie
      res.clearCookie("sessionId", {
        path: "/",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN
            : undefined,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}?message=logged_out`
      );
    });
  });
});

// POST logout route - for API calls
router.post("/auth/logout", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      success: true,
      message: "Already logged out",
      timestamp: new Date().toISOString(),
    });
  }

  const userId = req.user.id;
  const sessionId = req.sessionID;

  req.logout((err) => {
    if (err) {
      console.error("POST Logout error:", err);
      return res.status(500).json({
        success: false,
        error: "Logout failed",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Unable to logout",
        timestamp: new Date().toISOString(),
      });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
        // Don't return error here, logout was successful
      }

      console.log(
        `User ${userId} logged out via POST, session ${sessionId} destroyed`
      );

      // Clear session cookie
      res.clearCookie("sessionId", {
        path: "/",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN
            : undefined,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
      });
    });
  });
});

// ======================
// API ROUTES
// ======================

// Use API routes from routes/api.js
router.use("/api", apiRoutes);

// ======================
// SYSTEM ROUTES
// ======================

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  });
});

module.exports = router;
