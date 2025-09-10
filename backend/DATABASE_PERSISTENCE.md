# Database Persistence

This document explains how polygon data persistence works in the polygon management application.

## Overview

The application uses SQLite as the database with Prisma ORM. Polygon data is stored persistently and survives backend restarts.

## Database Configuration

- **Database**: SQLite
- **Location**: `/app/data/database.db` (in Docker containers)
- **Schema**: Defined in `prisma/schema.prisma`
- **ORM**: Prisma Client

## Persistence Setup

### Docker Volumes

The application uses Docker volumes to ensure data persistence:

- **Production**: `backend_data` volume mounted to `/app/data`
- **Development**: `backend_data_dev` volume mounted to `/app/data`

### Database Initialization

1. **First Run**: Database is created and seeded with sample polygons
2. **Subsequent Runs**: Existing data is preserved, no reseeding occurs
3. **Schema Updates**: Database schema is pushed on each startup

### Seeding Behavior

The seeding process has been modified to preserve existing data:

- **Empty Database**: Sample polygons are added
- **Existing Data**: Seeding is skipped to preserve user-created polygons
- **Manual Seeding**: Use `npm run db:seed` to add sample data to empty database

## Commands

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database (only if empty)
npm run db:seed

# Force reseed (clears existing data)
npm run db:seed:force

# Open database browser
npm run db:studio
```

### Setup Script

For initial setup, use the provided script:

```bash
# Make executable (first time only)
chmod +x scripts/setup-database.sh

# Run setup
./scripts/setup-database.sh
```

## Data Persistence Verification

To verify that polygons persist after restart:

1. **Create a polygon** through the API or frontend
2. **Restart the backend** container
3. **Check that the polygon still exists**

### Docker Commands

```bash
# Restart backend container
docker-compose restart backend

# Or stop and start
docker-compose down
docker-compose up -d
```

## Troubleshooting

### Data Not Persisting

1. **Check volume mounts**: Ensure Docker volumes are properly configured
2. **Check database location**: Verify `DATABASE_URL` points to the correct path
3. **Check permissions**: Ensure the application can write to the data directory

### Database Corruption

If the database becomes corrupted:

1. **Stop the application**
2. **Remove the database file**: `rm /app/data/database.db`
3. **Restart the application**: Database will be recreated and seeded

### Manual Database Reset

To completely reset the database:

```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker volume rm polygon-management-assignment_backend_data
docker volume rm polygon-management-assignment_backend_data_dev

# Start containers
docker-compose up -d
```

## Development vs Production

### Development Mode
- Uses `backend_data_dev` volume
- Hot reloading enabled
- Database file: `/app/data/database.db`

### Production Mode
- Uses `backend_data` volume
- Optimized build
- Same database file location

## Backup and Restore

### Backup Database

```bash
# Copy database file from container
docker cp polygon-backend:/app/data/database.db ./backup.db
```

### Restore Database

```bash
# Copy database file to container
docker cp ./backup.db polygon-backend:/app/data/database.db

# Restart container
docker-compose restart backend
```
