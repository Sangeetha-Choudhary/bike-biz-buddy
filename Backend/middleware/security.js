import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import config from '../config/config.js';
import logger from '../config/logger.js';

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurityEvent('Rate limit exceeded', req.user?.id, req.ip, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000),
      },
    });
  },
});

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurityEvent('Authentication rate limit exceeded', null, req.ip, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: 900, // 15 minutes
      },
    });
  },
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// MongoDB query sanitization
export const mongoSanitizeConfig = mongoSanitize({
  onSanitize: ({ req, key }) => {
    logger.logSecurityEvent('MongoDB injection attempt blocked', req.user?.id, req.ip, {
      key,
      value: req.body[key],
      userAgent: req.get('User-Agent'),
    });
  },
});

// Parameter pollution protection
export const hppConfig = hpp({
  whitelist: [
    'filter',
    'sort',
    'page',
    'limit',
    'fields',
    'populate',
  ],
});

// CORS configuration
export const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {return callback(null, true);}
    
    if (config.cors.origin.includes(origin)) {
      callback(null, true);
    } else {
      logger.logSecurityEvent('CORS violation', null, null, {
        origin,
        allowedOrigins: config.cors.origin,
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
};

// Additional security headers
export const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request size limiting
export const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    logger.logSecurityEvent('Request size limit exceeded', req.user?.id, req.ip, {
      contentLength,
      maxSize,
      userAgent: req.get('User-Agent'),
    });
    
    return res.status(413).json({
      success: false,
      error: {
        message: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: `${maxSize / (1024 * 1024)}MB`,
      },
    });
  }
  
  next();
};

// IP address extraction middleware
export const extractIP = (req, res, next) => {
  req.ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
  
  next();
};
