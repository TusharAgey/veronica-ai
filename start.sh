#!/bin/bash
# Start both the backend server and frontend UI
# Make sure to activate your Python virtual environment first

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Flask server..."
cd "$REPO_DIR/Server" && python app.py &
SERVER_PID=$!

echo "Starting Vite dev server..."
cd "$REPO_DIR/magic-ui" && npm run dev &
UI_PID=$!

echo "Server PID: $SERVER_PID | UI PID: $UI_PID"
wait
