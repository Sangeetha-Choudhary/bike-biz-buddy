import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../config/logger.js';

/**
 * Generate JWT access token
 * @param {string} userId - User ID to encode in token
 * @param {Object} additionalPayload - Additional data to include in token
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId, additionalPayload = {}) => {
  try {
    const payload = {
      id: userId,
      type: 'access',
      ...additionalPayload,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
    });

    logger.logBusinessEvent('Access token generated', userId, {
      tokenType: 'access',
      expiresIn: config.jwt.expiresIn,
    });

    return token;
  } catch (error) {
    logger.error('Error generating access token', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  try {
    const payload = {
      id: userId,
      type: 'refresh',
    };

    const token = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
    });

    logger.logBusinessEvent('Refresh token generated', userId, {
      tokenType: 'refresh',
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return token;
  } catch (error) {
    logger.error('Error generating refresh token', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, secret = config.jwt.secret) => {
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired', { tokenType: 'access' });
      throw new Error('Token expired');
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token', { tokenType: 'access' });
      throw new Error('Invalid token');
    }

    logger.error('Token verification error', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Token verification failed');
  }
};

/**
 * Decode JWT token without verification (for logging purposes)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.warn('Failed to decode token', { error: error.message });
    return null;
  }
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID to encode in tokens
 * @param {Object} additionalPayload - Additional data for access token
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateTokenPair = (userId, additionalPayload = {}) => {
  try {
    const accessToken = generateAccessToken(userId, additionalPayload);
    const refreshToken = generateRefreshToken(userId);

    logger.logBusinessEvent('Token pair generated', userId, {
      accessTokenExpiresIn: config.jwt.expiresIn,
      refreshTokenExpiresIn: config.jwt.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
      refreshExpiresIn: config.jwt.refreshExpiresIn,
    };
  } catch (error) {
    logger.error('Error generating token pair', {
      userId,
      error: error.message,
    });
    throw new Error('Failed to generate token pair');
  }
};

// Legacy export for backward compatibility
export default generateAccessToken;
