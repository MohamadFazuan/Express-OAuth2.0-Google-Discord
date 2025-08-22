# Docker Deployment Guide

This guide covers deployment using Docker and Docker Compose for the OAuth2.0 Next.js application.

## 🚀 Quick Start

### Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd express-oauth2-demo

# Copy environment file
cp .env.docker .env

# Edit .env file with your OAuth credentials
nano .env

# Start development environment
npm run docker:dev
```

### Production Environment

```bash
# Build and start production containers
npm run docker:prod

# Or manually:
docker-compose up -d
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Next.js       │    │   Express API   │
│  (Port 80/443)  │────│  (Port 3000)    │────│  (Port 3002)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │              ┌─────────────────┐
         │                       │              │    MongoDB      │
         │                       │              │  (Port 27017)   │
         │                       │              └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │              ┌─────────────────┐
                                 │              │     Redis       │
                                 └──────────────│  (Port 6379)    │
                                                └─────────────────┘
```

## 🐳 Docker Services

### Core Services

1. **API** (`oauth-api`) - Express.js backend on port 3002
2. **Frontend** (`oauth-frontend`) - Next.js application on port 3000
3. **MongoDB** (`oauth-mongodb`) - Database on port 27017
4. **Redis** (`oauth-redis`) - Session cache on port 6379
5. **Nginx** (`oauth-nginx`) - Reverse proxy on ports 80/443

## 📋 Environment Configuration

### Required Environment Variables

```env
# OAuth2.0 Credentials (Required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Security (Required)
SESSION_SECRET=your-32-character-secret-key

# Database (Auto-configured for Docker)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/oauth_demo?authSource=admin
```

## 🛠️ Available Commands

### Development

```bash
npm run docker:dev           # Start development environment
npm run docker:dev:build     # Build and start development
```

### Production

```bash
npm run docker:build         # Build all images
npm run docker:up            # Start production containers
npm run docker:down          # Stop containers
npm run docker:logs          # View logs
```

### Maintenance

```bash
npm run docker:clean         # Clean up unused images/containers
npm run health               # Check application health
```

## 🔒 Security Features

### Network Security

- Isolated Docker network
- Rate limiting via Nginx
- Security headers configured

### Data Protection

- Session encryption
- MongoDB authentication
- Redis password protection

### Container Security

- Non-root user execution
- Multi-stage builds
- Minimal Alpine base images

## 📊 Monitoring & Health Checks

### Health Endpoints

- API: `http://localhost:3002/health`
- Frontend: `http://localhost:3000`
- Combined: `http://localhost/health`

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## 🚀 Production Deployment

### Prerequisites

1. Docker and Docker Compose installed
2. OAuth2.0 provider credentials configured
3. Domain name and SSL certificates (for HTTPS)

### Deployment Steps

1. **Prepare Environment**

   ```bash
   cp .env.docker .env
   # Edit .env with production values
   ```

2. **Build Images**

   ```bash
   docker-compose build
   ```

3. **Start Services**

   ```bash
   docker-compose up -d
   ```

4. **Verify Deployment**
   ```bash
   curl http://localhost/health
   ```

### SSL Configuration (Production)

```bash
# Add SSL certificates
mkdir ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Update nginx.conf for HTTPS
# Restart nginx container
docker-compose restart nginx
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3002

   # Change ports in docker-compose.yml if needed
   ```

2. **MongoDB Connection Issues**

   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb

   # Verify MongoDB is running
   docker-compose exec mongodb mongo -u admin -p password123
   ```

3. **OAuth Redirect Issues**

   ```bash
   # Update OAuth provider settings:
   # Google: http://localhost/auth/google/callback
   # Discord: http://localhost/auth/discord/callback
   ```

4. **Memory Issues**

   ```bash
   # Check container resources
   docker stats

   # Increase Docker memory limits if needed
   ```

### Debug Mode

```bash
# Start with debug logging
NODE_ENV=development docker-compose up

# Check specific container
docker-compose exec api bash
docker-compose exec frontend bash
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# In docker-compose.yml
services:
  api:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing

- Nginx automatically load balances multiple replicas
- Redis handles session sharing across instances
- MongoDB supports replica sets for high availability

## 🔄 CI/CD Integration

The included GitHub Actions workflow:

1. Builds and tests the application
2. Scans for vulnerabilities
3. Builds Docker images
4. Pushes to GitHub Container Registry
5. Deploys to staging/production

### GitHub Actions Setup

1. Enable GitHub Container Registry
2. Set up repository secrets:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - OAuth credentials for staging/production

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)
