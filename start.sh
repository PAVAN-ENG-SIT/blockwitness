#!/bin/bash

# Start the Flask backend on port 8000
cd backend && python -c "from app import init_db; init_db()" && cd ..
python -m flask --app backend.app run --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start the Vite frontend on port 5000
cd frontend && npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
