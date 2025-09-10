# 🐳 Docker Deployment Guide

This guide covers how to run the Polygon Management Application using Docker containers.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

## 🚀 Quick Start

### Production Deployment

```bash
# 1. Clone and navigate to the project
cd /path/to/polygon-management

# 2. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start production environment
./scripts/docker-setup.sh prod
```

**Access the application:**

- 🌐 **Frontend**: http://localhost
- 🔧 **Backend API**: http://localhost:3001
- ❤️ **Health Check**: http://localhost:3001/health

### Development Environment

```bash
# Start development environment with hot reload
./scripts/docker-setup.sh dev
```

**Access the development environment:**

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3001

## 📁 Docker Architecture

### Multi-Stage Builds

Both frontend and backend use optimized multi-stage Docker builds:

**Backend Dockerfile:**

- `base` - Base Node.js with dependencies
- `development` - Development environment with hot reload
- `build` - TypeScript compilation stage
- `production` - Minimal production image

**Frontend Dockerfile:**

- `base` - Base Node.js with dependencies
- `development` - Vite dev server
- `build` - React build stage
- `production` - Nginx serving static files

### Services

| Service    | Container        | Port | Description             |
| ---------- | ---------------- | ---- | ----------------------- |
| `backend`  | polygon-backend  | 3001 | Node.js API server      |
| `frontend` | polygon-frontend | 80   | Nginx serving React app |

## 🔧 Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

**Key variables:**

```env
# Application
NODE_ENV=production
BACKEND_PORT=3001

# Database
DATABASE_URL=file:/app/data/database.db

# CORS
CORS_ORIGIN=http://localhost

# Frontend
VITE_API_URL=http://localhost:3001
VITE_BACKGROUND_IMAGE_URL=https://picsum.photos/1920/1080
```

### Docker Compose Profiles

**Production** (`docker-compose.yml`):

- Optimized builds
- Multi-stage production images
- Health checks enabled
- Persistent volumes
- Security hardened

**Development** (`docker-compose.dev.yml`):

- Hot reload enabled
- Source code mounted as volumes
- Development dependencies included
- Debug ports exposed

## 🛠️ Management Commands

### Using the Setup Script

```bash
# Production environment
./scripts/docker-setup.sh prod

# Development environment
./scripts/docker-setup.sh dev

# Check container status
./scripts/docker-setup.sh status

# View logs
./scripts/docker-setup.sh logs
./scripts/docker-setup.sh logs backend
./scripts/docker-setup.sh logs frontend

# Clean up resources
./scripts/docker-setup.sh cleanup
```

### Manual Docker Compose Commands

```bash
# Production
docker-compose up -d
docker-compose down
docker-compose logs -f

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Build only
docker-compose build --no-cache
```

## 📊 Health Monitoring

### Health Check Endpoints

Both services include comprehensive health checks:

**Backend Health Check:**

```bash
curl http://localhost:3001/health
```

**Frontend Health Check:**

```bash
curl http://localhost/
```

### Docker Health Checks

Health checks are configured in Docker Compose:

```yaml
healthcheck:
  test:
    [
      "CMD",
      "node",
      "-e",
      "require('http').get('http://localhost:3001/health', ...)",
    ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 💾 Data Persistence

### Volumes

- `backend_data`: SQLite database persistence
- `backend_data_dev`: Development database

### Database Location

- **Production**: `/app/data/database.db`
- **Development**: `./backend/data/database.db`

## 🔒 Security Features

### Production Security

- Non-root user execution
- Minimal base images (Alpine Linux)
- Security headers in Nginx
- CORS configuration
- Rate limiting enabled
- No development dependencies

### Network Security

- Isolated Docker networks
- Internal service communication
- Only necessary ports exposed

## 🚀 Performance Optimizations

### Frontend (Nginx)

- Gzip compression enabled
- Static asset caching (1 year)
- HTML cache disabled (always fresh)
- Optimized worker processes

### Backend (Node.js)

- Production-only dependencies
- Compiled TypeScript (no runtime compilation)
- Process management
- Memory optimization

## 🔍 Troubleshooting

### Common Issues

**Port conflicts:**

```bash
# Check what's using the ports
lsof -i :80
lsof -i :3001

# Stop conflicting services
sudo systemctl stop nginx
sudo systemctl stop apache2
```

**Permission issues:**

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Logout and login again
```

**Build failures:**

```bash
# Clean build cache
docker system prune -f
docker-compose build --no-cache
```

**Database issues:**

```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

### Debugging

**View container logs:**

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Execute into containers:**

```bash
docker exec -it polygon-backend sh
docker exec -it polygon-frontend sh
```

**Check container stats:**

```bash
docker stats polygon-backend polygon-frontend
```

## 📈 Monitoring

### Container Status

```bash
docker ps --filter "name=polygon"
```

### Resource Usage

```bash
docker stats --no-stream
```

### Logs

```bash
# Follow all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Tail specific number of lines
docker-compose logs --tail=100 backend
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Database

```bash
# Copy database from container
docker cp polygon-backend:/app/data/database.db ./backup-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Copy database to container
docker cp ./backup.db polygon-backend:/app/data/database.db
docker-compose restart backend
```

## 🎯 Production Deployment

### Recommended Setup

1. **Reverse Proxy**: Use Nginx or Traefik in front
2. **SSL/TLS**: Configure HTTPS certificates
3. **Monitoring**: Add Prometheus/Grafana
4. **Logging**: Centralized logging with ELK stack
5. **Backups**: Automated database backups
6. **Updates**: CI/CD pipeline for deployments

### Example Production docker-compose.yml

```yaml
version: "3.8"
services:
  backend:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
      restart_policy:
        condition: on-failure
        max_attempts: 3

  frontend:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 128M
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `./scripts/docker-setup.sh logs`
2. Verify health checks: `curl http://localhost:3001/health`
3. Check container status: `./scripts/docker-setup.sh status`
4. Try cleanup and restart: `./scripts/docker-setup.sh cleanup && ./scripts/docker-setup.sh prod`

---

🎉 **Your Polygon Management Application is now containerized and ready for production deployment!**
