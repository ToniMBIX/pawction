#!/usr/bin/env bash
set -e

cd /app

echo "Starting PHP server on :${PORT:-10000} ..."
exec php -S 0.0.0.0:${PORT:-10000} -t public public/index.php