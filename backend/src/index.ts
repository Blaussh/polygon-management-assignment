import app from './app';
import { logger } from './utils/logger';
import { checkDatabaseConnection } from './utils/database';

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
  try {
    // Check database connection
    const isDatabaseHealthy = await checkDatabaseConnection();

    if (!isDatabaseHealthy) {
      logger.error('Database connection failed');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API endpoints: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer().catch(error => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});
