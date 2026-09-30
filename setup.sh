#!/usr/bin/env bash
set -e

echo "================================================================================"
echo "  🌿 संजीविनी (Sanjeevini) - Setup & Bootstrapper"
echo "  Federated AI Platform for National Health Resource & Supply Chain Resilience"
echo "================================================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# 1. Check Python
echo "[1/4] Checking Python environment..."
if command -v python3.12 &>/dev/null; then
    PYTHON_CMD=python3.12
elif command -v python3 &>/dev/null; then
    PYTHON_CMD=python3
else
    echo "ERROR: python3 is required."
    exit 1
fi
echo "Using: $($PYTHON_CMD --version)"

# 2. Setup Backend Virtualenv
echo "[2/4] Setting up backend virtual environment & dependencies..."
if [ ! -d "$BACKEND_DIR/venv" ]; then
    $PYTHON_CMD -m venv "$BACKEND_DIR/venv"
fi

"$BACKEND_DIR/venv/bin/pip" install --upgrade pip --quiet
"$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt" --quiet

echo "Initializing database & seeding 1,000+ national health data records..."
cd "$BACKEND_DIR"
PYTHONPATH=. "$BACKEND_DIR/venv/bin/python" app/scripts/seed_health_data.py

echo "Running backend test suite..."
PYTHONPATH=. "$BACKEND_DIR/venv/bin/pytest" tests/

# 3. Setup Frontend
echo "[3/4] Setting up frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --quiet
npm run build

echo "================================================================================"
echo "  ✅ Setup completed successfully!"
echo "================================================================================"
echo ""
echo "To run the platform concurrently:"
echo ""
echo "  Terminal 1 (FastAPI Backend):"
echo "    cd backend"
echo "    PYTHONPATH=. ./venv/bin/uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Terminal 2 (Vite React Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "Access points:"
echo "  - Frontend Portal:    http://localhost:5173"
echo "  - Backend API & Docs: http://localhost:8000/docs"
echo "  - Health Check:       http://localhost:8000/health"
echo "  - Prometheus Metrics: http://localhost:8000/metrics"
echo "================================================================================"
