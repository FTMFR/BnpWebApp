# Docker Deployment Guide

This is a quick reference guide for deploying BnpWebApp using Docker.

## Quick Start

### Build and Run (Development)
```bash
docker compose up -d --build
```

### Build and Run (Production)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### View Logs
```bash
docker compose logs -f web
```

### Stop Containers
```bash
docker compose down
```

## Access the Application

After running, the application will be available at:
- **Development**: `http://localhost:8080`
- **Production**: `http://localhost:80` (or your server IP)

## Configuration

### API Backend Configuration

The Vue.js app uses environment variables for API configuration. By default, it expects the API at `/api` path.

#### Option 1: Build-time Environment Variables
Set `VITE_API_BASE_URL` during build:
```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

#### Option 2: Nginx Proxy (Recommended for same-server backend)
Edit `nginx.conf` and uncomment the API proxy section:
```nginx
location /api {
    proxy_pass http://backend-server:5117;
    # ... other proxy settings
}
```

Then rebuild the Docker image:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## File Structure

- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Development configuration (port 8080)
- `docker-compose.prod.yml` - Production configuration (port 80)
- `nginx.conf` - Nginx server configuration
- `.dockerignore` - Files to exclude from Docker build context
- `DEPLOYMENT.md` - Complete deployment guide in Persian

## Troubleshooting

### Container won't start
```bash
docker compose logs web
```

### Port already in use
Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Change 8080 to 8081
```

### Rebuild without cache
```bash
docker compose build --no-cache
```

## For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

