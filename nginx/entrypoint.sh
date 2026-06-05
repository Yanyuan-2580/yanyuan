#!/bin/bash
set -e

DOMAIN="${DOMAIN:-psyaihelp.xin}"
EMAIL="${EMAIL:-3186551424@qq.com}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
CERTBOT_WEBROOT="/var/www/certbot"

echo "================================================"
echo "  psyaihelp.xin — Entrypoint"
echo "  Domain: ${DOMAIN}"
echo "================================================"

# Function: generate full SSL config from template
generate_ssl_config() {
    echo "[nginx] Generating SSL config for ${DOMAIN}..."
    export DOMAIN
    envsubst '${DOMAIN}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
    # Remove bootstrap config if exists
    rm -f /etc/nginx/conf.d/bootstrap.conf
}

# Function: use bootstrap (HTTP-only) config
use_bootstrap_config() {
    echo "[nginx] Using HTTP-only bootstrap config..."
    rm -f /etc/nginx/conf.d/default.conf
    # bootstrap.conf is already in place from Docker build
}

# Check if SSL certificate exists
if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
    echo "[ssl] SSL certificate found for ${DOMAIN}"
    generate_ssl_config

    # Check if renewal is needed (within 30 days of expiry)
    if ! certbot certificates 2>/dev/null | grep -q "Domains:.*${DOMAIN}"; then
        echo "[ssl] WARNING: certbot doesn't know about this cert, attempting renewal check..."
    fi
else
    echo "[ssl] No SSL certificate found. Starting bootstrap process..."

    # Step 1: Use HTTP-only config for certbot challenge
    use_bootstrap_config

    # Step 2: Start nginx in background (HTTP only)
    echo "[nginx] Starting nginx in bootstrap mode..."
    nginx -g "daemon off;" &
    NGINX_PID=$!

    # Wait for nginx to be ready
    sleep 2
    if ! kill -0 $NGINX_PID 2>/dev/null; then
        echo "[nginx] ERROR: nginx failed to start!"
        exit 1
    fi
    echo "[nginx] Nginx is running (PID: $NGINX_PID)"

    # Step 3: Request SSL certificate via Let's Encrypt
    echo "[ssl] Requesting certificate for ${DOMAIN}..."
    certbot certonly --webroot \
        -w "${CERTBOT_WEBROOT}" \
        -d "${DOMAIN}" \
        --email "${EMAIL}" \
        --agree-tos \
        --non-interactive \
        --force-renewal

    CERTBOT_EXIT=$?
    if [ $CERTBOT_EXIT -ne 0 ]; then
        echo "[ssl] ERROR: certbot failed with exit code ${CERTBOT_EXIT}"
        echo "[ssl] Keeping nginx running in HTTP-only mode..."
        wait $NGINX_PID
        exit $CERTBOT_EXIT
    fi

    echo "[ssl] Certificate obtained successfully!"

    # Step 4: Stop nginx
    echo "[nginx] Stopping bootstrap nginx..."
    nginx -s quit
    wait $NGINX_PID 2>/dev/null || true
    sleep 1

    # Step 5: Generate SSL config
    generate_ssl_config
fi

# Start crond for auto-renewal
echo "[cron] Starting certificate renewal cron..."
crond -b -l 2

# Start nginx in foreground with full config
echo "[nginx] Starting nginx with full SSL config..."
exec nginx -g "daemon off;"
