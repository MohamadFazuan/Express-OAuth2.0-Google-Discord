# API Endpoints Usage Guide - Updated Architecture

This document describes the available API endpoints for user authentication and session management with the new middleware architecture.

## 🏗️ Architecture Overview

The application now uses a modular structure with dedicated middleware for authentication:

```
server.js                 # Main server configuration & Passport setup
├── middleware/
│   └── auth.js           # Authentication middleware functions
└── routes/
    ├── index.js          # Main routes (auth & system)
    └── api.js            # API routes with middleware protection
```

## 🛡️ Authentication Middleware

### Available Middleware Functions:

- **`isAuthenticated`** - Requires user to be logged in (401 if not)
- **`optionalAuth`** - Adds auth status but allows unauthenticated access
- **`requireProvider(provider)`** - Requires specific OAuth provider
- **`attachUser`** - Attaches user data to response locals
- **`handleAuthError`** - Handles authentication errors gracefully

## 📋 Available Endpoints

### 1. **User Information - `/api/me`** 🔒

**Frontend URL:** `http://localhost:3000/api/me`  
**Backend URL:** `http://localhost:3001/api/me`  
**Method:** `GET`  
**Middleware:** `isAuthenticated`

#### Authenticated Response (200):

```json
{
  "success": true,
  "user": {
    "id": "123456789",
    "provider": "google",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "authenticatedAt": "2025-08-22T..."
  },
  "session": {
    "id": "session_id_here",
    "isAuthenticated": true,
    "maxAge": 86400000
  }
}
```

### 2. **Extended Profile - `/api/profile`** 🔒

**URL:** `http://localhost:3001/api/profile`  
**Method:** `GET`  
**Middleware:** `isAuthenticated`

```json
{
  "success": true,
  "profile": {
    "id": "123456789",
    "provider": "google",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "sessionInfo": {
      "id": "session_id",
      "loginTime": "2025-08-22T...",
      "userAgent": "Mozilla/5.0...",
      "ip": "127.0.0.1"
    },
    "permissions": {
      "canRead": true,
      "canWrite": true,
      "canDelete": false
    }
  }
}
```

### 3. **Session Validation - `/api/session/validate`** 🔓

**Frontend URL:** `http://localhost:3000/api/session`  
**Backend URL:** `http://localhost:3001/api/session/validate`  
**Method:** `GET`  
**Middleware:** None (public)

### 4. **Session Info - `/api/session/info`** 🔓

**URL:** `http://localhost:3001/api/session/info`  
**Method:** `GET`  
**Middleware:** `optionalAuth`

```json
{
  "session": {
    "id": "session_id",
    "authenticated": true,
    "cookie": {
      "maxAge": 86400000,
      "expires": "2025-08-23T...",
      "secure": false,
      "httpOnly": true
    },
    "createdAt": "2025-08-22T..."
  },
  "timestamp": "2025-08-22T..."
}
```

### 5. **Logout - `/api/logout`** 🔒

**Frontend URL:** `http://localhost:3000/api/logout`  
**Backend URL:** `http://localhost:3001/api/logout`  
**Method:** `POST`  
**Middleware:** `isAuthenticated`

### 6. **API Status - `/api/status`** 🔓

**URL:** `http://localhost:3001/api/status`  
**Method:** `GET`  
**Middleware:** None (public)

```json
{
  "success": true,
  "api": {
    "status": "operational",
    "version": "1.0.0",
    "timestamp": "2025-08-22T..."
  },
  "authentication": {
    "providers": ["google", "discord"],
    "sessionBased": true,
    "middlewareActive": true
  },
  "endpoints": {
    "auth": ["/auth/google", "/auth/discord"],
    "api": [
      "/api/me",
      "/api/user",
      "/api/profile",
      "/api/session/validate",
      "/api/logout"
    ],
    "system": ["/health", "/api/status"]
  }
}
```

## 🔒 Protected vs Public Endpoints

### **Protected (Requires Authentication):**

- `/api/me` - Current user info
- `/api/user` - Legacy user endpoint
- `/api/profile` - Extended user profile
- `/api/logout` - Logout user

### **Public (No Authentication Required):**

- `/api/status` - API status
- `/api/session/validate` - Session validation
- `/api/session/info` - Session information
- `/health` - Health check

## 💻 Frontend Usage Examples

### Using the New Middleware Structure

```javascript
// Check if user is authenticated
async function checkAuth() {
  try {
    const response = await fetch("/api/session/validate", {
      credentials: "include",
    });

    const data = await response.json();
    return data.valid && data.authenticated;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
}

// Get user profile with extended data
async function getUserProfile() {
  try {
    const response = await fetch("/api/profile", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return data.profile;
    } else {
      throw new Error("Not authenticated");
    }
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return null;
  }
}

// Enhanced logout with better error handling
async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      console.log("Logout successful:", data.message);
      window.location.href = "/";
    } else {
      console.error("Logout failed:", data.error);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}
```

### React Hook for Authentication

```javascript
import { useState, useEffect } from "react";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { user, authenticated, loading, logout };
}
```

## 🧪 Testing Endpoints

Use the npm scripts to test the middleware:

```bash
# Test protected endpoint (should return 401 if not authenticated)
npm run test:me

# Test middleware functionality
npm run test:middleware

# Test session validation
npm run test:session

# Test frontend proxy
npm run test:frontend-me

# General health check
npm run health
```

## 🔧 Middleware Configuration

### Custom Middleware Usage

```javascript
const { isAuthenticated, requireProvider } = require("./middleware/auth");

// Protect route with authentication
app.get("/protected", isAuthenticated, (req, res) => {
  res.json({ message: "This is protected", user: req.user });
});

// Require specific OAuth provider
app.get("/google-only", requireProvider("google"), (req, res) => {
  res.json({ message: "Google users only", user: req.user });
});
```

## 🚀 Benefits of New Architecture

1. **🛡️ Centralized Authentication** - All auth logic in middleware
2. **🔧 Reusable Components** - Middleware can be applied to any route
3. **📋 Better Organization** - Routes separated by functionality
4. **🐛 Easier Debugging** - Clear separation of concerns
5. **🔒 Enhanced Security** - Consistent authentication checks
6. **📈 Scalability** - Easy to add new routes and middleware

## 🔗 Authentication Flow

1. User visits `/auth/google` or `/auth/discord`
2. OAuth provider redirects to callback URL
3. Server creates session with login timestamp
4. Middleware protects API routes automatically
5. Frontend can access protected endpoints with session cookies
6. Session validation available for real-time auth checks

## 🔄 Migration Notes

If migrating from the previous structure:

1. **Routes are now modular** - Check `routes/index.js` and `routes/api.js`
2. **Middleware is centralized** - Import from `middleware/auth.js`
3. **Enhanced error handling** - Better 401/403 responses
4. **More endpoint options** - Additional `/api/profile` and `/api/status` endpoints
5. **Improved testing** - Use the new npm test scripts

## 🛠️ Development Tips

- Use `isAuthenticated` for most protected routes
- Use `optionalAuth` when you want to show different content for authenticated users
- Use `requireProvider()` for provider-specific functionality
- Check the `/api/status` endpoint to verify middleware is working
- Test both authenticated and unauthenticated states
