#!/bin/bash
# Start both the backend server and frontend UI
# Make sure to activate your Python virtual environment first

echo "Starting Flask server..."
cd Server && python app.py &
SERVER_PID=$!

echo "Starting Vite dev server..."
cd ../magic-ui && npm run host &
UI_PID=$!

echo "Server PID: $SERVER_PID | UI PID: $UI_PID"
wait
