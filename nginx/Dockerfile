FROM nginx:alpine

# Install certbot and envsubst
RUN apk add --no-cache certbot certbot-nginx openssl dcron bash gettext

# Create webroot for certbot challenges
RUN mkdir -p /var/www/certbot

# Copy nginx base config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy bootstrap config (used before SSL certs exist)
COPY conf.d/bootstrap.conf /etc/nginx/conf.d/bootstrap.conf

# Copy template for full SSL config
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create SSL certificate auto-renewal cron (twice daily)
RUN echo '0 0,12 * * * certbot renew --quiet && nginx -s reload 2>&1 | tee -a /var/log/certbot-renew.log' | crontab -

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
