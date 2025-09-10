import { prisma } from './database';
import { logger } from './logger';
import { Point } from '../types';

const samplePolygons = [
  {
    name: 'Triangle',
    points: [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 150, y: 50 },
    ] as Point[],
  },
  {
    name: 'Square',
    points: [
      { x: 300, y: 300 },
      { x: 400, y: 300 },
      { x: 400, y: 400 },
      { x: 300, y: 400 },
    ] as Point[],
  },
  {
    name: 'Pentagon',
    points: [
      { x: 500, y: 200 },
      { x: 550, y: 150 },
      { x: 600, y: 200 },
      { x: 580, y: 250 },
      { x: 520, y: 250 },
    ] as Point[],
  },
  {
    name: 'Hexagon',
    points: [
      { x: 700, y: 300 },
      { x: 750, y: 280 },
      { x: 800, y: 300 },
      { x: 800, y: 350 },
      { x: 750, y: 370 },
      { x: 700, y: 350 },
    ] as Point[],
  },
];

async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    // Clear existing data
    await prisma.polygon.deleteMany();
    logger.info('Cleared existing polygons');

    // Insert sample polygons
    for (const polygon of samplePolygons) {
      await prisma.polygon.create({
        data: {
          name: polygon.name,
          points: JSON.stringify(polygon.points),
        },
      });
      logger.info(`Created polygon: ${polygon.name}`);
    }

    logger.info(
      `Successfully seeded database with ${samplePolygons.length} polygons`
    );
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
