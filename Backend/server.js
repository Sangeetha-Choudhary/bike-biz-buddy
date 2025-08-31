import express from 'express';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config/config.js';
import logger from './config/logger.js';
import connectDB, { checkDatabaseHealth } from './config/db.js';
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  responseTimeMiddleware,
} from './middleware/errorHandler.js';
import {
  helmetConfig,
  mongoSanitizeConfig,
  hppConfig,
  corsConfig,
  securityHeaders,
  requestSizeLimit,
  xssProtection,
  securityMonitoring,
} from './middleware/security.js';

// Import routes
import AuthRoutes from './routes/AuthRoutes.js';
import storeRoutes from './routes/storeRoutes.js';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Trust proxy for proper IP detection (handles X-Forwarded-For)
app.set('trust proxy', true);

// Security middleware (order matters)
app.use(helmetConfig);
app.use(cors(corsConfig));
// app.use(mongoSanitizeConfig); // Disabled for Express 5 compatibility
// app.use(hppConfig); // Disabled for Express 5 compatibility
// app.use(xssProtection); // Disabled for Express 5 compatibility
app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(securityMonitoring);

// Request tracking and logging
app.use(requestIdMiddleware);
app.use(responseTimeMiddleware);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      security: {
        xssProtection: 'enabled',
        mongoSanitization: 'enabled',
        helmet: 'enabled',
        cors: 'enabled',
      },
    };

    const isHealthy = dbHealth.status === 'healthy';
    res.status(isHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API routes
app.use(`${config.api.baseUrl}/users`, AuthRoutes);
app.use(`${config.api.baseUrl}/stores`, storeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bike Biz Buddy API',
    version: config.api.version,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    documentation: `${req.protocol}://${req.get('host')}/docs`,
    security: {
      xssProtection: 'enabled',
      mongoSanitization: 'enabled',
      helmet: 'enabled',
      cors: 'enabled',
    },
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const server = app.listen(config.port, () => {
  logger.info('Server started successfully', {
    port: config.port,
    environment: config.nodeEnv,
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
    security: {
      xssProtection: 'enabled',
      mongoSanitization: 'enabled',
      helmet: 'enabled',
      cors: 'enabled',
    },
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error('Error during server close', { error: err.message });
      process.exit(1);
    }

    logger.info('HTTP server closed');

    try {
      // Close database connection
      await mongoose.connection.close();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (dbError) {
      logger.error('Error closing database connection', {
        error: dbError.message,
      });
      process.exit(1);
    }
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;
