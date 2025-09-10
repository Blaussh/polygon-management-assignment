#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 2

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Start the application
echo "Starting application..."
exec npm start
