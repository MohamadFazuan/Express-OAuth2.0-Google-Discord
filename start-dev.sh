#!/bin/bash

# Start Express server on port 3001
echo "Starting Express OAuth server on port 3001..."
node server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Start Next.js on port 3000
echo "Starting Next.js frontend on port 3000..."
npm run dev &
NEXTJS_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "🚀 Both servers are running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 API: http://localhost:3001"
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait
