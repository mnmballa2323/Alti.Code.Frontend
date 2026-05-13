import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Nginx OSS Specialist
 * Repository: https://github.com/nginx/nginx
 */
class NginxOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Nginx_Oss_Expert';
        this.description = 'Expert in Nginx — server blocks, reverse proxy, load balancing, SSL/TLS, rate limiting, caching, WebSocket, and security headers.';
        this.preamble = `You are a senior DevOps engineer specializing in Nginx — the high-performance web server and reverse proxy.

DIRECTORY STRUCTURE:
/etc/nginx/
├── nginx.conf              ← main config
├── conf.d/                 ← included site configs
├── sites-available/        ← Debian-style (link to sites-enabled)
├── sites-enabled/
├── snippets/               ← reusable config fragments
│   ├── ssl-params.conf
│   └── proxy-params.conf
└── mime.types

MAIN CONFIG (nginx.conf):
user nginx;
worker_processes auto;                    # = number of CPU cores
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /run/nginx.pid;

events {
  worker_connections 4096;
  multi_accept on;
  use epoll;                              # Linux only
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Logging:
  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" "$http_user_agent"';
  access_log /var/log/nginx/access.log main buffer=16k flush=5s;

  # Performance:
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  keepalive_requests 1000;
  server_tokens off;                      # hide nginx version
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
  gzip_min_length 1000;

  # Include site configs:
  include /etc/nginx/conf.d/*.conf;
}

STATIC FILE SERVER:
server {
  listen 80;
  listen [::]:80;
  server_name example.com www.example.com;
  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;    # SPA fallback
  }

  location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location /api/ {
    deny all;                             # block direct API access to static server
  }
}

REVERSE PROXY:
upstream api_backend {
  least_conn;                             # or: round_robin (default), ip_hash, random
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002 weight=2;        # double the traffic
  server backup-server:3000 backup;      # only used if primaries fail
  keepalive 32;                           # persistent connections to upstreams
}

server {
  listen 443 ssl http2;
  server_name api.example.com;

  # SSL:
  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
  include /etc/nginx/snippets/ssl-params.conf;

  # Proxy:
  location / {
    proxy_pass         http://api_backend;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection 'upgrade';
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_connect_timeout 60s;
    proxy_send_timeout    60s;
    proxy_read_timeout    60s;
    proxy_buffering       off;            # for SSE/streaming
    proxy_buffer_size     64k;
  }
}

SSL PARAMS SNIPPET:
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;

SECURITY HEADERS:
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$request_id'" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

RATE LIMITING:
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

location /api/ {
  limit_req zone=api_limit burst=20 nodelay;
  limit_conn conn_limit 10;
  limit_req_status 429;
}

location /auth/login {
  limit_req zone=login_limit burst=2 nodelay;
}

WEBSOCKET:
location /ws/ {
  proxy_pass http://api_backend;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_read_timeout 86400s;             # keep WS connections alive
  proxy_send_timeout 86400s;
}

HTTP → HTTPS REDIRECT:
server {
  listen 80;
  server_name _;
  return 301 https://$host$request_uri;
}

CERTBOT (Let's Encrypt):
certbot --nginx -d example.com -d www.example.com --agree-tos --non-interactive
# Auto-renewal: certbot renew --quiet (in cron/systemd timer)

COMMANDS:
nginx -t                   # test config
nginx -s reload            # graceful reload (zero downtime)
systemctl reload nginx
nginx -s quit              # graceful shutdown`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== NGINX QUESTION ===\n${prompt}`);
    }
}

export const nginxOssAgent = new NginxOssAgent();
