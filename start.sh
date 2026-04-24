#!/bin/bash

# ========================================
# Sweet Rise Bakery - Production Manager
# Start Script
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║   🧁 Sweet Rise Bakery                    ║"
echo "  ║   Production Management System            ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Clean up ports ----
echo -e "${YELLOW}[1/6] Cleaning up ports...${NC}"
kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

kill_port 3000
kill_port 4000
echo -e "${GREEN}  ✓ Ports 3000 and 4000 cleared${NC}"

# ---- Check .env ----
echo -e "${YELLOW}[2/6] Checking environment...${NC}"
if [ ! -f .env ]; then
  echo -e "${RED}  ✗ .env file not found! Creating default...${NC}"
  cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bakery_production
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-haiku-4.5
JWT_SECRET=bakery_super_secret_jwt_key_2024
BACKEND_PORT=4000
FRONTEND_PORT=3000
EOF
fi
echo -e "${GREEN}  ✓ Environment configured${NC}"

# ---- Load env vars ----
export $(grep -v '^#' .env | xargs)

# ---- Setup Database ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"

# Check if postgres is running
if ! pg_isready -q 2>/dev/null; then
  echo -e "${RED}  ✗ PostgreSQL is not running! Please start it first.${NC}"
  exit 1
fi

# Create database if not exists
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'bakery_production'" | grep -q 1 || \
  psql -U postgres -c "CREATE DATABASE bakery_production" 2>/dev/null || true

# Run schema
echo -e "  Running schema..."
psql -U postgres -d bakery_production -f backend/schema.sql -q 2>/dev/null

# Run seed data
echo -e "  Seeding data..."
psql -U postgres -d bakery_production -f backend/seed.sql -q 2>/dev/null

echo -e "${GREEN}  ✓ Database schema and seed data loaded${NC}"

# ---- Install Dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
(cd backend && npm install --silent 2>/dev/null) &
(cd frontend && npm install --silent 2>/dev/null) &
wait
echo -e "${GREEN}  ✓ Dependencies installed${NC}"

# ---- Seed Users with proper bcrypt hash ----
echo -e "${YELLOW}[5/6] Seeding user accounts...${NC}"
(cd backend && node seed-users.js 2>/dev/null)
echo -e "${GREEN}  ✓ Users seeded (admin@sweetrise.com / password123)${NC}"

# ---- Start Services ----
echo -e "${YELLOW}[6/6] Starting services...${NC}"

# Start backend with nodemon for hot-reload
echo -e "  Starting backend on port 4000..."
(cd backend && npx nodemon --quiet server.js 2>&1 | sed 's/^/  [backend] /') &
BACKEND_PID=$!

# Start frontend with Vite (auto-reload built in)
echo -e "  Starting frontend on port 3000..."
(cd frontend && npx vite --port 3000 2>&1 | sed 's/^/  [frontend] /') &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}  ╔═══════════════════════════════════════════╗"
echo -e "  ║   ✅ Application Started Successfully!    ║"
echo -e "  ╠═══════════════════════════════════════════╣"
echo -e "  ║                                           ║"
echo -e "  ║   Frontend:  http://localhost:3000         ║"
echo -e "  ║   Backend:   http://localhost:4000         ║"
echo -e "  ║                                           ║"
echo -e "  ║   Login:     admin@sweetrise.com          ║"
echo -e "  ║   Password:  password123                  ║"
echo -e "  ║                                           ║"
echo -e "  ║   Hot-reload enabled for both services    ║"
echo -e "  ║   Press Ctrl+C to stop                    ║"
echo -e "  ╚═══════════════════════════════════════════╝${NC}"
echo ""

# Handle graceful shutdown
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  kill_port 3000
  kill_port 4000
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
