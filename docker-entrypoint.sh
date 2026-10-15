#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL:-http://localhost:8001}",
  SOCKET_BASE_URL: "${SOCKET_BASE_URL:-ws://localhost:8001}",
  CONSENT_API_BASE_URL: "${CONSENT_API_BASE_URL:-http://localhost:8000}"
};
EOF

exec nginx -g "daemon off;"
