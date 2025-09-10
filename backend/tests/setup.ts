import { PrismaClient } from '@prisma/client';

// Global test setup
let prisma: PrismaClient;

beforeAll(async () => {
  // Use a test database file
  process.env.DATABASE_URL = 'file:./test.db';

  // Initialize Prisma client
  prisma = new PrismaClient();

  // Create the database schema manually
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "polygons" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL UNIQUE,
        "points" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  } catch (error) {
    console.warn('Failed to create schema:', error);
  }
});

beforeEach(async () => {
  // Clean up database before each test
  try {
    await prisma.polygon.deleteMany();
  } catch (error) {
    // Ignore errors if table doesn't exist yet
  }
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Export prisma instance for tests
export { prisma };
