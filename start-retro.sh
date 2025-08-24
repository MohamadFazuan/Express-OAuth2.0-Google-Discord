#!/bin/bash

# Start both frontend and backend servers for development

echo "🚀 Starting Retro OAuth Demo..."
echo "📦 Backend (Express): http://localhost:3001"
echo "🎨 Frontend (Next.js): http://localhost:3000"
echo ""

# Start backend server in background
echo "Starting backend server..."
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Trap cleanup function on script exit
trap cleanup INT TERM

# Wait for any process to exit
wait
