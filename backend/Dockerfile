# Backend Dockerfile - Multi-stage build for production optimization
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++ sqlite openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++ sqlite openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
RUN npx prisma generate
ENV DATABASE_URL="file:/app/data/database.db"
RUN npx prisma db push
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create app directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/data ./data

# Install sqlite and openssl for production
RUN apk add --no-cache sqlite openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy and set up startup script
COPY start.sh ./start.sh
RUN chmod +x /app/start.sh

# Set ownership of all files to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["sh", "-c", "echo 'Waiting for database to be ready...' && sleep 2 && echo 'Running database migrations...' && npx prisma db push && echo 'Starting application...' && exec npm start"]