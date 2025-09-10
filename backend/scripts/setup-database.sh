#!/bin/sh

# Database setup script for polygon management application
# This script initializes the database with sample data if it's empty

echo "Setting up database for polygon management application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Pushing database schema..."
npx prisma db push

# Seed database with sample data (only if empty)
echo "Seeding database with sample data..."
npm run db:seed

echo "Database setup complete!"
echo ""
echo "You can now:"
echo "  - Start the development server: npm run dev"
echo "  - View the database: npm run db:studio"
echo "  - Force reseed (clears existing data): npm run db:seed:force"
