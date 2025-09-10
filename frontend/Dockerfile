# Frontend Dockerfile - Multi-stage build for optimized production
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Development stage
FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base AS build
COPY . .
ENV VITE_API_URL=http://localhost:3001
RUN npm run build

# Production stage - Use nginx to serve static files
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S frontend
RUN adduser -S frontend -u 1001

# Set ownership
RUN chown -R frontend:frontend /usr/share/nginx/html
RUN chown -R frontend:frontend /var/cache/nginx
RUN chown -R frontend:frontend /var/log/nginx
RUN chown -R frontend:frontend /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R frontend:frontend /var/run/nginx.pid

# Switch to non-root user
USER frontend

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]