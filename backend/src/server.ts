// ============================================================
// Server Entry Point
// ============================================================

import app from './app';
import { config } from './config/index';
import logger from './config/logger';
import { checkDatabaseConnection, closeDatabaseConnection } from './config/database';
import { redis } from './config/redis';
import { socketService } from './shared/services/socket.service';
import { initQueueWorkers, enqueueMembershipCheck } from './shared/services/queue.service';
import { renewalReminderService } from './modules/membership/renewal.service';

// Server instance
let server: ReturnType<typeof app.listen>;

// Start server
async function startServer(): Promise<void> {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Connect to Redis
    await redis.connect();

    // Start HTTP server
    server = app.listen(config.APP_PORT, config.HOST, () => {
      logger.info(`M-Plus API Server started`, {
        port: config.APP_PORT,
        host: config.HOST,
        env: config.NODE_ENV,
        url: `http://${config.HOST}:${config.APP_PORT}`
      });
      
      // Initialize Socket.IO for real-time chat
      socketService.initialize(server);
      logger.info('Socket.IO initialized');

      // Initialize BullMQ background job workers
      initQueueWorkers();
      logger.info('Queue workers initialized');

      // Schedule membership expiry cron jobs
      renewalReminderService.startCronJobs();
      logger.info('Membership cron jobs scheduled');

      // Register membership check repeatable job (daily at 6 AM)
      enqueueMembershipCheck();
      logger.info('Membership check repeatable job registered');

      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 M-Plus Matrimony API Server                          ║
║                                                           ║
║   Environment: ${config.NODE_ENV.padEnd(40)}║
║   Port:        ${String(config.APP_PORT).padEnd(40)}║
║   URL:         ${`http://localhost:${config.APP_PORT}`.padEnd(40)}║
║                                                           ║
║   API:         ${`${config.API_PREFIX}`.padEnd(40)}║
║   Health:      ${'/health'.padEnd(40)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.APP_PORT} is already in use`);
        process.exit(1);
      }
      logger.error('Server error', { error });
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  try {
    // Close database connection
    await closeDatabaseConnection();
    
    // Close Redis connection
    await redis.quit();
    
    logger.info('All connections closed. Exiting...');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

// Process event handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Start the server
startServer();
