const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for SPA
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Enable cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration with MongoDB store
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Custom session cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// Use MongoDB session store if URI provided
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update
  });
}

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization (store user ID in session)
passport.serializeUser((user, done) => {
  // Only store essential data in session
  done(null, { 
    id: user.id, 
    provider: user.provider,
    sessionData: {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  });
});

passport.deserializeUser((sessionUser, done) => {
  // Reconstruct user from session data
  const user = {
    id: sessionUser.id,
    provider: sessionUser.provider,
    ...sessionUser.sessionData
  };
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      provider: 'google',
      name: profile.displayName,
      email: profile.emails?.[0]?.value || null,
      avatar: profile.photos?.[0]?.value || null,
      // Store tokens securely (consider encryption in production)
      tokens: {
        access: accessToken,
        refresh: refreshToken
      },
      raw: profile._json // Full profile data
    };
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: "/auth/discord/callback",
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      provider: 'discord',
      name: profile.username,
      email: profile.email || null,
      avatar: profile.avatar ? 
        `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256` : 
        null,
      discriminator: profile.discriminator,
      tokens: {
        access: accessToken,
        refresh: refreshToken
      },
      raw: profile // Full profile data
    };
    return done(null, user);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return done(error, null);
  }
}));

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'Authentication required' 
  });
};

// Routes

// Frontend SPA route (for testing)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Express OAuth2.0 (Google + Discord)</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
                background: white; padding: 2rem; border-radius: 12px; 
                box-shadow: 0 10px 40px rgba(0,0,0,0.1); max-width: 500px; width: 90%;
            }
            h1 { text-align: center; color: #333; margin-bottom: 2rem; }
            .auth-btn { 
                display: flex; align-items: center; justify-content: center;
                padding: 12px 24px; margin: 10px 0; text-decoration: none; 
                border-radius: 8px; color: white; font-weight: 500; 
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
            .google { background: #db4437; }
            .discord { background: #5865F2; }
            .logout { background: #6c757d; }
            .user-card { 
                background: #f8f9fa; padding: 1.5rem; border-radius: 8px; 
                margin: 1rem 0; border-left: 4px solid #28a745;
            }
            .user-avatar { 
                width: 64px; height: 64px; border-radius: 50%; 
                margin: 0 auto 1rem; display: block;
            }
            .user-info { text-align: center; }
            .provider-badge { 
                display: inline-block; padding: 4px 8px; border-radius: 4px; 
                font-size: 12px; color: white; margin: 5px 0;
            }
            .google-badge { background: #db4437; }
            .discord-badge { background: #5865F2; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔐 OAuth2.0 Demo</h1>
            <div id="app">
                ${req.user ? `
                    <div class="user-card">
                        <img src="${req.user.avatar || '/default-avatar.png'}" alt="Avatar" class="user-avatar">
                        <div class="user-info">
                            <h3>${req.user.name}</h3>
                            <p>${req.user.email || 'No email provided'}</p>
                            <span class="provider-badge ${req.user.provider}-badge">
                                ${req.user.provider.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <a href="/api/me" class="auth-btn google" target="_blank">View Profile JSON</a>
                    <a href="/auth/logout" class="auth-btn logout">Logout</a>
                ` : `
                    <p style="text-align: center; margin-bottom: 2rem; color: #666;">
                        Choose your preferred authentication provider:
                    </p>
                    <a href="/auth/google" class="auth-btn google">
                        📧 Continue with Google
                    </a>
                    <a href="/auth/discord" class="auth-btn discord">
                        💬 Continue with Discord
                    </a>
                `}
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    session: req.sessionID ? 'active' : 'none'
  });
});

// OAuth initiation routes
app.get('/auth/google', (req, res, next) => {
  // Store redirect URL in session
  req.session.afterLoginRedirect = req.query.redirect || '/';
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline', // Get refresh token
    prompt: 'consent' // Force consent screen for refresh token
  })(req, res, next);
});

app.get('/auth/discord', (req, res, next) => {
  // Store redirect URL in session
  req.session.afterLoginRedirect = req.query.redirect || '/';
  passport.authenticate('discord')(req, res, next);
});

// OAuth callback routes
app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/?error=google_auth_failed',
    failureMessage: true
  }),
  (req, res) => {
    // Successful authentication
    const redirectUrl = req.session.afterLoginRedirect || '/';
    delete req.session.afterLoginRedirect;
    res.redirect(redirectUrl);
  }
);

app.get('/auth/discord/callback',
  passport.authenticate('discord', { 
    failureRedirect: '/?error=discord_auth_failed',
    failureMessage: true
  }),
  (req, res) => {
    // Successful authentication
    const redirectUrl = req.session.afterLoginRedirect || '/';
    delete req.session.afterLoginRedirect;
    res.redirect(redirectUrl);
  }
);

// API Routes for SPA

// Get current user (equivalent to /api/me)
app.get('/api/me', requireAuth, (req, res) => {
  const userResponse = {
    id: req.user.id,
    provider: req.user.provider,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    sessionId: req.sessionID
  };
  
  // Include Discord-specific data if applicable
  if (req.user.provider === 'discord' && req.user.discriminator) {
    userResponse.discriminator = req.user.discriminator;
    userResponse.tag = `${req.user.name}#${req.user.discriminator}`;
  }
  
  res.json({ user: userResponse });
});

// Get user profile (more detailed)
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({
    user: req.user,
    session: {
      id: req.sessionID,
      cookie: req.session.cookie
    }
  });
});

// Logout endpoint
app.post('/auth/logout', requireAuth, (req, res) => {
  const sessionId = req.sessionID;
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Logout failed', 
        message: err.message 
      });
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ 
          error: 'Session cleanup failed' 
        });
      }
      
      // Clear session cookie
      res.clearCookie('sessionId');
      res.status(204).send(); // No Content
    });
  });
});

// Alternative logout for web interface
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('sessionId');
      res.redirect('/?message=logged_out');
    });
  });
});

// Session validation endpoint
app.get('/api/session/validate', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      valid: true, 
      user: {
        id: req.user.id,
        provider: req.user.provider,
        name: req.user.name
      }
    });
  } else {
    res.status(401).json({ 
      valid: false, 
      message: 'No active session' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  
  // OAuth specific errors
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message,
      provider: err.provider || 'unknown'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/me`);
  
  // Environment check
  const requiredVars = [
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
    'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('   Please add them to your .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  if (process.env.MONGODB_URI) {
    console.log('✅ MongoDB session store configured');
  } else {
    console.warn('⚠️  Using memory session store (not recommended for production)');
  }
});

module.exports = app;const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for SPA
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Enable cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration with MongoDB store
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Custom session cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// Use MongoDB session store if URI provided
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update
  });
}

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization (store user ID in session)
passport.serializeUser((user, done) => {
  // Only store essential data in session
  done(null, { 
    id: user.id, 
    provider: user.provider,
    sessionData: {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  });
});

passport.deserializeUser((sessionUser, done) => {
  // Reconstruct user from session data
  const user = {
    id: sessionUser.id,
    provider: sessionUser.provider,
    ...sessionUser.sessionData
  };
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      provider: 'google',
      name: profile.displayName,
      email: profile.emails?.[0]?.value || null,
      avatar: profile.photos?.[0]?.value || null,
      // Store tokens securely (consider encryption in production)
      tokens: {
        access: accessToken,
        refresh: refreshToken
      },
      raw: profile._json // Full profile data
    };
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: "/auth/discord/callback",
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      provider: 'discord',
      name: profile.username,
      email: profile.email || null,
      avatar: profile.avatar ? 
        `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256` : 
        null,
      discriminator: profile.discriminator,
      tokens: {
        access: accessToken,
        refresh: refreshToken
      },
      raw: profile // Full profile data
    };
    return done(null, user);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return done(error, null);
  }
}));

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'Authentication required' 
  });
};

// Routes

// Frontend SPA route (for testing)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Express OAuth2.0 (Google + Discord)</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
                background: white; padding: 2rem; border-radius: 12px; 
                box-shadow: 0 10px 40px rgba(0,0,0,0.1); max-width: 500px; width: 90%;
            }
            h1 { text-align: center; color: #333; margin-bottom: 2rem; }
            .auth-btn { 
                display: flex; align-items: center; justify-content: center;
                padding: 12px 24px; margin: 10px 0; text-decoration: none; 
                border-radius: 8px; color: white; font-weight: 500; 
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
            .google { background: #db4437; }
            .discord { background: #5865F2; }
            .logout { background: #6c757d; }
            .user-card { 
                background: #f8f9fa; padding: 1.5rem; border-radius: 8px; 
                margin: 1rem 0; border-left: 4px solid #28a745;
            }
            .user-avatar { 
                width: 64px; height: 64px; border-radius: 50%; 
                margin: 0 auto 1rem; display: block;
            }
            .user-info { text-align: center; }
            .provider-badge { 
                display: inline-block; padding: 4px 8px; border-radius: 4px; 
                font-size: 12px; color: white; margin: 5px 0;
            }
            .google-badge { background: #db4437; }
            .discord-badge { background: #5865F2; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔐 OAuth2.0 Demo</h1>
            <div id="app">
                ${req.user ? `
                    <div class="user-card">
                        <img src="${req.user.avatar || '/default-avatar.png'}" alt="Avatar" class="user-avatar">
                        <div class="user-info">
                            <h3>${req.user.name}</h3>
                            <p>${req.user.email || 'No email provided'}</p>
                            <span class="provider-badge ${req.user.provider}-badge">
                                ${req.user.provider.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <a href="/api/me" class="auth-btn google" target="_blank">View Profile JSON</a>
                    <a href="/auth/logout" class="auth-btn logout">Logout</a>
                ` : `
                    <p style="text-align: center; margin-bottom: 2rem; color: #666;">
                        Choose your preferred authentication provider:
                    </p>
                    <a href="/auth/google" class="auth-btn google">
                        📧 Continue with Google
                    </a>
                    <a href="/auth/discord" class="auth-btn discord">
                        💬 Continue with Discord
                    </a>
                `}
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    session: req.sessionID ? 'active' : 'none'
  });
});

// OAuth initiation routes
app.get('/auth/google', (req, res, next) => {
  // Store redirect URL in session
  req.session.afterLoginRedirect = req.query.redirect || '/';
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline', // Get refresh token
    prompt: 'consent' // Force consent screen for refresh token
  })(req, res, next);
});

app.get('/auth/discord', (req, res, next) => {
  // Store redirect URL in session
  req.session.afterLoginRedirect = req.query.redirect || '/';
  passport.authenticate('discord')(req, res, next);
});

// OAuth callback routes
app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/?error=google_auth_failed',
    failureMessage: true
  }),
  (req, res) => {
    // Successful authentication
    const redirectUrl = req.session.afterLoginRedirect || '/';
    delete req.session.afterLoginRedirect;
    res.redirect(redirectUrl);
  }
);

app.get('/auth/discord/callback',
  passport.authenticate('discord', { 
    failureRedirect: '/?error=discord_auth_failed',
    failureMessage: true
  }),
  (req, res) => {
    // Successful authentication
    const redirectUrl = req.session.afterLoginRedirect || '/';
    delete req.session.afterLoginRedirect;
    res.redirect(redirectUrl);
  }
);

// API Routes for SPA

// Get current user (equivalent to /api/me)
app.get('/api/me', requireAuth, (req, res) => {
  const userResponse = {
    id: req.user.id,
    provider: req.user.provider,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    sessionId: req.sessionID
  };
  
  // Include Discord-specific data if applicable
  if (req.user.provider === 'discord' && req.user.discriminator) {
    userResponse.discriminator = req.user.discriminator;
    userResponse.tag = `${req.user.name}#${req.user.discriminator}`;
  }
  
  res.json({ user: userResponse });
});

// Get user profile (more detailed)
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({
    user: req.user,
    session: {
      id: req.sessionID,
      cookie: req.session.cookie
    }
  });
});

// Logout endpoint
app.post('/auth/logout', requireAuth, (req, res) => {
  const sessionId = req.sessionID;
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Logout failed', 
        message: err.message 
      });
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ 
          error: 'Session cleanup failed' 
        });
      }
      
      // Clear session cookie
      res.clearCookie('sessionId');
      res.status(204).send(); // No Content
    });
  });
});

// Alternative logout for web interface
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('sessionId');
      res.redirect('/?message=logged_out');
    });
  });
});

// Session validation endpoint
app.get('/api/session/validate', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      valid: true, 
      user: {
        id: req.user.id,
        provider: req.user.provider,
        name: req.user.name
      }
    });
  } else {
    res.status(401).json({ 
      valid: false, 
      message: 'No active session' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  
  // OAuth specific errors
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message,
      provider: err.provider || 'unknown'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/me`);
  
  // Environment check
  const requiredVars = [
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
    'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('   Please add them to your .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  if (process.env.MONGODB_URI) {
    console.log('✅ MongoDB session store configured');
  } else {
    console.warn('⚠️  Using memory session store (not recommended for production)');
  }
});

module.exports = app;