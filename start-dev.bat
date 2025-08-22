@echo off
echo Starting Express OAuth server on port 3001...
start /B node server.js

echo Waiting for server to start...
timeout /t 2 /nobreak > nul

echo Starting Next.js frontend on port 3000...
start /B npm run dev

echo.
echo 🚀 Both servers are running!
echo 📱 Frontend: http://localhost:3000
echo 🔗 API: http://localhost:3001
echo.
echo Press any key to stop both servers...
pause > nul

echo Shutting down servers...
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im npm.cmd > nul 2>&1
