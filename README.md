# 🔒 Express OAuth2.0 Authentication System

A modern, production-ready OAuth2.0 authentication system built with **Express.js**, **Next.js**, and **Passport.js**. Features Google and Discord OAuth providers with a clean middleware architecture.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start in production mode
npm start
```

## 🏗️ Architecture Overview

This project follows a modern, modular architecture with proper separation of concerns:

```
📁 Project Structure
├── server.js                 # Main Express server & Passport configuration
├── middleware/
│   └── auth.js               # Authentication middleware functions
├── routes/
│   ├── index.js             # Main routes (auth & system)
│   └── api.js               # API routes with middleware protection
├── pages/                    # Next.js frontend pages
├── components/               # React components with RetroUI styling
├── config/                   # Configuration files
└── docker/                   # Containerization setup
```

## 🛡️ Authentication Middleware

### Core Middleware Functions:

- **`isAuthenticated`** - Protects routes requiring login (returns 401 if not authenticated)
- **`optionalAuth`** - Adds user info if authenticated but allows unauthenticated access
- **`requireProvider(provider)`** - Requires specific OAuth provider (google/discord)
- **`attachUser`** - Attaches user data to response locals for templates
- **`handleAuthError`** - Centralized authentication error handling

### Usage Example:

```javascript
const { isAuthenticated, requireProvider } = require("./middleware/auth");

// Protect any route
app.get("/protected", isAuthenticated, (req, res) => {
  res.json({ user: req.user, message: "Welcome!" });
});

// Require Google OAuth specifically
app.get("/google-users", requireProvider("google"), (req, res) => {
  res.json({ message: "Google users only", user: req.user });
});
```

## 📋 API Endpoints

### 🔒 Protected Endpoints (Require Authentication):

- `GET /api/me` - Current user information
- `GET /api/profile` - Extended user profile with session details
- `POST /api/logout` - Logout current user

### 🔓 Public Endpoints:

- `GET /api/status` - API health and configuration status
- `GET /api/session/validate` - Validate current session
- `GET /api/session/info` - Session information (optional auth)
- `GET /health` - Basic health check

### 🔑 Authentication Endpoints:

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/discord` - Initiate Discord OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/discord/callback` - Discord OAuth callback

## 🧪 Testing

Test the middleware architecture and endpoints:

```bash
# Test all middleware functionality
npm run test:middleware

# Test specific endpoints
npm run test:me           # Test protected endpoint
npm run test:session     # Test session validation
npm run test:frontend-me  # Test Next.js proxy

# Health checks
npm run health           # Server health
```

## 🐳 Docker Deployment

### Development:

```bash
npm run docker:dev       # Start with hot reload
```

### Production:

```bash
npm run docker:build     # Build production images
npm run docker:prod      # Start production containers
```

### Available Services:

- **app**: Main Express.js API server (port 3001)
- **frontend**: Next.js frontend (port 3000)
- **nginx**: Reverse proxy and load balancer
- **mongodb**: Session storage database
- **redis**: Cache and session store

## 🔧 Configuration

### Environment Variables:

```bash
# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Session Configuration
SESSION_SECRET=your_super_secret_session_key

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001

# Database (optional - uses memory store by default)
MONGODB_URI=mongodb://localhost:27017/oauth_sessions
REDIS_URL=redis://localhost:6379
```

## 💻 Frontend Integration

### React Hook Example:

```javascript
import { useState, useEffect } from "react";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setAuthenticated(false);
  };

  return { user, authenticated, loading, logout };
}
```

### Authentication Component:

```javascript
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

export default function AuthButton() {
  const { user, authenticated, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return authenticated ? (
    <div className="flex items-center gap-4">
      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
      <span>Welcome, {user.name}!</span>
      <Button onClick={logout} variant="secondary">
        Logout
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button as="a" href="/auth/google">
        Login with Google
      </Button>
      <Button as="a" href="/auth/discord" variant="secondary">
        Login with Discord
      </Button>
    </div>
  );
}
```

## 🔒 Security Features

- **Session-based authentication** with secure cookies
- **CSRF protection** via session middleware
- **Rate limiting** on authentication endpoints
- **Secure headers** with helmet middleware
- **Input validation** on all API endpoints
- **Error handling** without information leakage

## 🚀 Benefits of This Architecture

1. **🛡️ Centralized Authentication Logic** - All auth logic in reusable middleware
2. **🔧 Modular Structure** - Easy to extend and maintain
3. **📋 Clear Separation of Concerns** - Routes, middleware, and logic separated
4. **🐛 Better Debugging** - Clear error messages and structured logging
5. **🔒 Enhanced Security** - Consistent protection across all routes
6. **📈 Scalable Design** - Easy to add new providers and endpoints
7. **🧪 Testable Components** - Each piece can be tested independently

## 📚 Documentation

- **[API Usage Guide](./API_USAGE_UPDATED.md)** - Complete API documentation
- **[Docker Deployment](./DOCKER_DEPLOYMENT.md)** - Container deployment guide
- **[Middleware Reference](./middleware/auth.js)** - Authentication middleware docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Test your changes: `npm run test:middleware`
4. Commit changes: `git commit -m "Add new feature"`
5. Push to branch: `git push origin feature/new-feature`
6. Open a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Express.js, Next.js, Passport.js, and RetroUI**
