import { PrismaClient } from '@prisma/client';

// Global test setup
let prisma: PrismaClient;

beforeAll(async () => {
  // Use in-memory SQLite for tests
  process.env.DATABASE_URL = 'file::memory:?cache=shared';

  // Initialize Prisma client
  prisma = new PrismaClient();

  // Push schema to test database
  await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.polygon.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma instance for tests
export { prisma };
