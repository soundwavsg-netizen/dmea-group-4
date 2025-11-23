#!/bin/bash
set -e

echo "Starting MUFE Backend..."
echo "PORT: $PORT"
echo "Python version: $(python --version)"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

# Check if required files exist
if [ ! -f "server.py" ]; then
    echo "ERROR: server.py not found!"
    exit 1
fi

# Test import
echo "Testing imports..."
python -c "import fastapi; import uvicorn; import firebase_admin; print('✓ Core imports successful')"

# Start the server
echo "Starting uvicorn server on 0.0.0.0:$PORT"
exec uvicorn server:app --host 0.0.0.0 --port $PORT --log-level info
