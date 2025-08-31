import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from './config.js';

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.filePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'bike-biz-buddy-api',
    environment: config.nodeEnv,
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.filePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // Separate file for error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

// Add console transport for development
if (config.isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper methods for structured logging
logger.logAPIRequest = (req, res, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    responseTime: `${responseTime}ms`,
    statusCode: res.statusCode,
  });
};

logger.logAPIError = (error, req, additionalInfo = {}) => {
  logger.error('API Error', {
    message: error.message,
    stack: error.stack,
    method: req?.method,
    url: req?.originalUrl,
    ip: req?.ip,
    userId: req?.user?.id,
    ...additionalInfo,
  });
};

logger.logDatabaseOperation = (
  operation,
  collection,
  documentId,
  additionalInfo = {}
) => {
  logger.info('Database Operation', {
    operation,
    collection,
    documentId,
    ...additionalInfo,
  });
};

logger.logSecurityEvent = (event, userId, ip, additionalInfo = {}) => {
  logger.warn('Security Event', {
    event,
    userId,
    ip,
    ...additionalInfo,
  });
};

logger.logBusinessEvent = (event, userId, additionalInfo = {}) => {
  logger.info('Business Event', {
    event,
    userId,
    ...additionalInfo,
  });
};

export default logger;
