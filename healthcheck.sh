#!/bin/bash

# Docker health check script for OAuth2.0 application

set -e

# Check if API server is responding
echo "Checking API health..."
HEALTH_CHECK=$(curl -f http://localhost:3001/health 2>/dev/null || echo "FAILED")

if [ "$HEALTH_CHECK" = "FAILED" ]; then
    echo "❌ API health check failed"
    exit 1
fi

echo "✅ API health check passed"

# Check if frontend is responding (if running)
if [ "$CHECK_FRONTEND" = "true" ]; then
    echo "Checking Frontend health..."
    FRONTEND_CHECK=$(curl -f http://localhost:3000 2>/dev/null || echo "FAILED")
    
    if [ "$FRONTEND_CHECK" = "FAILED" ]; then
        echo "❌ Frontend health check failed"
        exit 1
    fi
    
    echo "✅ Frontend health check passed"
fi

echo "🎉 All health checks passed!"
exit 0
