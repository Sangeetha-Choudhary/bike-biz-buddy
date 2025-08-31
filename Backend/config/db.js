import mongoose from 'mongoose';
import config from './config.js';
import logger from './logger.js';

const connectDB = async () => {
  try {
    // Connection options with pooling and optimization
    const connectionOptions = {
      ...config.database.options,
      // Additional MongoDB options for production
      ...(config.isProduction && {
        ssl: true,
        sslValidate: true,
        retryWrites: true,
        w: 'majority',
      }),
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(config.database.uri, connectionOptions);

    logger.info('MongoDB Connected', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
      readyState: conn.connection.readyState,
    });

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB connection reestablished');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB connection closure', { error: err.message });
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB connection closure', { error: err.message });
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('MongoDB connection failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const isHealthy = state === 1; // 1 = connected
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      readyState: state,
      readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

export default connectDB;