#!/bin/bash
set -euo pipefail

# GuardianAI Pro MongoDB Restore Script
# Usage: ./scripts/restore.sh [backup_path] [database_name]

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_path> [database_name]"
  echo "  backup_path  - Path to mongodump output directory or 'latest' to use ./backups/latest"
  echo "  database_name - Target database name (default: guardianai)"
  exit 1
fi

BACKUP_PATH="${1}"
DATABASE_NAME="${2:-guardianai}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017}"

if [ "${BACKUP_PATH}" = "latest" ]; then
  BACKUP_PATH="./backups/latest"
fi

if [ ! -d "${BACKUP_PATH}" ]; then
  echo "Error: Backup directory not found: ${BACKUP_PATH}"
  exit 1
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: This will DROP the '${DATABASE_NAME}' database and restore from backup."
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Dropping database: ${DATABASE_NAME}"
mongosh "${MONGO_URI}/${DATABASE_NAME}" --eval "db.dropDatabase()" --quiet

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting restore from: ${BACKUP_PATH}"
mongorestore \
  --uri="${MONGO_URI}" \
  --nsInclude="${DATABASE_NAME}.*" \
  --nsFrom=".*" \
  --nsTo="${DATABASE_NAME}.*" \
  --dir="${BACKUP_PATH}" \
  --gzip \
  --drop \
  --quiet

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restore completed successfully"
exit 0
