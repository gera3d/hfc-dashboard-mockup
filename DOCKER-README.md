# HFC Dashboard - Docker Deployment Guide

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

Build and start the container:
```bash
docker-compose up -d --build
```

Stop the container:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

### Option 2: Using Docker CLI

Build the image:
```bash
docker build -t hfc-dashboard .
```

Run the container:
```bash
docker run -p 3000:3000 --name hfc-dashboard hfc-dashboard
```

Stop and remove the container:
```bash
docker stop hfc-dashboard
docker rm hfc-dashboard
```

## Accessing the Application

Once the container is running, access the dashboard at:
```
http://localhost:3000
```

## Environment Variables

If you need to add environment variables, you can:

1. Create a `.env.local` file (not committed to git)
2. Update the `docker-compose.yml` to include:
   ```yaml
   environment:
     - NODE_ENV=production
     - YOUR_ENV_VAR=value
   ```
   Or use an env file:
   ```yaml
   env_file:
     - .env.local
   ```

## Production Deployment

### Building for Production

The Dockerfile uses a multi-stage build process:
1. **deps**: Installs dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates minimal production image

This approach significantly reduces the final image size.

### Image Size Optimization

The production image is optimized to be as small as possible by:
- Using Alpine Linux base image
- Multi-stage builds
- Next.js standalone output mode
- Only copying necessary files

### Health Checks

To add health checks to your container, update `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs -f`
- Verify port 3000 is not already in use
- Ensure Docker daemon is running

### Build fails
- Clear Docker cache: `docker-compose build --no-cache`
- Check that all dependencies are in package.json

### Application errors
- Check container logs for detailed error messages
- Verify all required environment variables are set

## Development vs Production

For development, you might want to mount volumes to enable hot reloading. Update `docker-compose.yml`:
```yaml
volumes:
  - ./src:/app/src
  - ./public:/app/public
```

Note: This is not recommended for production.
