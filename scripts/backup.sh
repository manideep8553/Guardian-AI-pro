#!/bin/bash
set -euo pipefail

# GuardianAI Pro MongoDB Backup Script
# Usage: ./scripts/backup.sh [backup_dir]

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/mongodb_backup_${TIMESTAMP}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/guardianai}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"

mkdir -p "${BACKUP_PATH}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting MongoDB backup..."

mongodump \
  --uri="${MONGO_URI}" \
  --out="${BACKUP_PATH}" \
  --gzip \
  --quiet

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup completed: ${BACKUP_PATH}"

BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup size: ${BACKUP_SIZE}"

# Create a latest symlink
ln -sfn "${BACKUP_PATH}" "${BACKUP_DIR}/latest"

# Cleanup old backups
find "${BACKUP_DIR}" -maxdepth 1 -type d -name "mongodb_backup_*" -mtime "+${RETENTION_DAYS}" -exec rm -rf {} \;
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Cleaned up backups older than ${RETENTION_DAYS} days"

# Upload to S3 if configured
if [ -n "${S3_BUCKET}" ]; then
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] Uploading to S3 bucket: ${S3_BUCKET}"
  if command -v aws &> /dev/null; then
    tar czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "$(basename "${BACKUP_PATH}")"
    aws s3 cp "${BACKUP_PATH}.tar.gz" "s3://${S3_BUCKET}/backups/$(basename "${BACKUP_PATH}.tar.gz")"
    rm "${BACKUP_PATH}.tar.gz"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Upload completed"
  else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] AWS CLI not found, skipping S3 upload"
  fi
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup process completed successfully"
exit 0
