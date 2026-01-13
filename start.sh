#!/bin/bash

echo "🚀 Starting BlockWitness..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Initialize database
echo "🗄️  Initializing database..."
cd backend
python -c "from app import init_db; init_db()"
cd ..

# Start backend
echo "🔧 Starting backend on port 8000..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 5000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ BlockWitness is running!"
echo "   Frontend: http://localhost:5000"
echo "   Backend:  http://localhost:8000"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait