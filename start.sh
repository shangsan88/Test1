#!/bin/bash
# Start both the backend and frontend dev servers

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting School Timetable..."
echo "   Backend  → http://localhost:3001"
echo "   Frontend → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

npm run dev
