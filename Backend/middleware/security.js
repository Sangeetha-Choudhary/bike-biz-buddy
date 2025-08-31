import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';
import config from '../config/config.js';
import logger from '../config/logger.js';

// Enhanced Helmet configuration for security headers
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
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// XSS protection middleware
export const xssProtection = xss();

// Enhanced MongoDB query sanitization
export const mongoSanitizeConfig = mongoSanitize({
  onSanitize: ({ req, key }) => {
    logger.logSecurityEvent(
      'MongoDB injection attempt blocked',
      req.user?.id,
      req.ip,
      {
        key,
        value: req.body[key],
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
      }
    );
  },
  dryRun: false,
  replaceWith: '_',
});

// Enhanced parameter pollution protection
export const hppConfig = hpp({
  whitelist: [
    'filter',
    'sort',
    'page',
    'limit',
    'fields',
    'populate',
    'select',
    'search',
    'category',
    'status',
  ],
});

// Enhanced CORS configuration
export const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

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
    'X-API-Key',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Enhanced security headers
export const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Add enhanced security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
};

// Enhanced request size limiting
export const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    logger.logSecurityEvent(
      'Request size limit exceeded',
      req.user?.id,
      req.ip,
      {
        contentLength,
        maxSize,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
      }
    );

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

// Security monitoring middleware
export const securityMonitoring = (req, res, next) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
  ];

  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(body) || pattern.test(query) || pattern.test(params)) {
      logger.logSecurityEvent(
        'Suspicious request detected',
        req.user?.id,
        req.ip,
        {
          pattern: pattern.source,
          body: body.substring(0, 200),
          query: query.substring(0, 200),
          params: params.substring(0, 200),
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
        }
      );
      break;
    }
  }

  next();
};
