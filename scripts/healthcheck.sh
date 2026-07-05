#!/bin/bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────
BACKEND_URL="${HEALTHCHECK_BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${HEALTHCHECK_FRONTEND_URL:-http://localhost:80}"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/guardianai}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
TIMEOUT="${HEALTHCHECK_TIMEOUT:-5}"

# ── Utils ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
FAILED=0

check() {
  local name="$1"
  local status="$2"
  if [ "$status" -eq 0 ]; then
    echo -e "  ${GREEN}[PASS]${NC} $name"
  else
    echo -e "  ${RED}[FAIL]${NC} $name"
    FAILED=1
  fi
}

# ── Backend Health ──────────────────────────────────────
echo "Checking services..."

if command -v curl &>/dev/null; then
  CMD="curl -sf --max-time $TIMEOUT"
elif command -v wget &>/dev/null; then
  CMD="wget -qO- --timeout=$TIMEOUT"
else
  echo -e "  ${RED}[FAIL]${NC} Neither curl nor wget available"
  exit 1
fi

# Backend
$CMD "${BACKEND_URL}/health" &>/dev/null
check "Backend (${BACKEND_URL}/health)" $?

# Frontend
$CMD "${FRONTEND_URL}" &>/dev/null
check "Frontend (${FRONTEND_URL})" $?

# MongoDB
if command -v mongosh &>/dev/null; then
  mongosh "${MONGODB_URI}" --quiet --eval "db.runCommand({ping:1}).ok" 2>/dev/null | grep -q "1"
  check "MongoDB (${MONGODB_URI})" $?
elif command -v mongo &>/dev/null; then
  mongo "${MONGODB_URI}" --quiet --eval "db.runCommand({ping:1}).ok" 2>/dev/null | grep -q "1"
  check "MongoDB (${MONGODB_URI})" $?
else
  echo -e "  ${YELLOW}[SKIP]${NC} MongoDB client not installed"
fi

# Redis
if command -v redis-cli &>/dev/null; then
  redis-cli -u "${REDIS_URL}" ping 2>/dev/null | grep -q "PONG"
  check "Redis (${REDIS_URL})" $?
else
  echo -e "  ${YELLOW}[SKIP]${NC} Redis CLI not installed"
fi

# ── Summary ──────────────────────────────────────────────
echo ""
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}All services healthy${NC}"
  exit 0
else
  echo -e "${RED}One or more services unhealthy${NC}"
  exit 1
fi
