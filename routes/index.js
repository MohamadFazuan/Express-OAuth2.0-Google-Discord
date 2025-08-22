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
      `${process.env.FRONTEND_URL || "http://localhost:3000"}?success=true`
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
      `${process.env.FRONTEND_URL || "http://localhost:3000"}?success=true`
    );
  }
);

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
