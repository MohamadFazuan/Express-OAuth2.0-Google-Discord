const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const cors = require("cors");
const path = require("path");

// Import routes and middleware
const indexRouter = require("./routes/index");
const { handleAuthError } = require("./middleware/auth");

require("dotenv").config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// ======================
// MIDDLEWARE CONFIGURATION
// ======================

// CORS configuration for Next.js frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Core middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    name: "sessionId", // Custom session cookie name
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ======================
// PASSPORT CONFIGURATION
// ======================

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.API_URL || "http://localhost:3001"
      }/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        provider: "google",
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      };
      return done(null, user);
    }
  )
);

// Discord OAuth Strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${
        process.env.API_URL || "http://localhost:3001"
      }/auth/discord/callback`,
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        provider: "discord",
        name: profile.username,
        email: profile.email,
        avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
      };
      return done(null, user);
    }
  )
);

// ======================
// ROUTES
// ======================

// Use routes from routes/index.js
app.use("/", indexRouter);

// ======================
// ERROR HANDLING
// ======================

// Authentication error handler
app.use(handleAuthError);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// ======================
// SERVER STARTUP
// ======================

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
  console.log(`🔐 OAuth Providers: Google, Discord`);
  console.log(`🛡️  Authentication middleware: Active`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Auth: /auth/google, /auth/discord`);
  console.log(
    `   - API: /api/me, /api/user, /api/session/validate, /api/logout`
  );
  console.log(`   - System: /health, /api/status`);
});
