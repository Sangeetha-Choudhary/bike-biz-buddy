import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/config.js';
import logger from '../config/logger.js';

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

/**
 * Generate JWT access token with enhanced security
 * @param {string} userId - User ID to encode in token
 * @param {Object} additionalPayload - Additional data to include in token
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId, additionalPayload = {}) => {
  try {
    const payload = {
      id: userId,
      type: 'access',
      jti: crypto.randomBytes(16).toString('hex'), // JWT ID for blacklisting
      iat: Math.floor(Date.now() / 1000),
      ...additionalPayload,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
      algorithm: 'HS512', // Use stronger algorithm
    });

    logger.logBusinessEvent('Access token generated', userId, {
      tokenType: 'access',
      expiresIn: config.jwt.expiresIn,
      jti: payload.jti,
      algorithm: 'HS512',
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
 * Generate JWT refresh token with enhanced security
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  try {
    const payload = {
      id: userId,
      type: 'refresh',
      jti: crypto.randomBytes(16).toString('hex'),
      iat: Math.floor(Date.now() / 1000),
      family: crypto.randomBytes(8).toString('hex'), // Token family for rotation
    };

    const token = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
      algorithm: 'HS512',
    });

    logger.logBusinessEvent('Refresh token generated', userId, {
      tokenType: 'refresh',
      expiresIn: config.jwt.refreshExpiresIn,
      jti: payload.jti,
      family: payload.family,
      algorithm: 'HS512',
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
 * Verify JWT token with enhanced security checks
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, secret = config.jwt.secret) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      logger.warn('Blacklisted token used', { tokenType: 'access' });
      throw new Error('Token has been revoked');
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
      algorithms: ['HS512'], // Only allow HS512
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

    if (error.name === 'NotBeforeError') {
      logger.warn('Token not yet valid', { tokenType: 'access' });
      throw new Error('Token not yet valid');
    }

    logger.error('Token verification error', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Token verification failed');
  }
};

/**
 * Verify refresh token with enhanced security checks
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded refresh token payload
 */
export const verifyRefreshToken = (token) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      logger.warn('Blacklisted refresh token used');
      throw new Error('Refresh token has been revoked');
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'bike-biz-buddy-api',
      audience: 'bike-biz-buddy-users',
      algorithms: ['HS512'],
    });

    if (decoded.type !== 'refresh') {
      logger.warn('Invalid token type used as refresh token');
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Refresh token expired');
      throw new Error('Refresh token expired');
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid refresh token');
      throw new Error('Invalid refresh token');
    }

    logger.error('Refresh token verification error', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Refresh token verification failed');
  }
};

/**
 * Blacklist a token (revoke it)
 * @param {string} token - Token to blacklist
 * @param {string} userId - User ID for logging
 */
export const blacklistToken = (token, userId) => {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();

      // Only blacklist if token hasn't expired
      if (expiresAt > now) {
        tokenBlacklist.add(token);

        // Remove from blacklist after expiration
        setTimeout(() => {
          tokenBlacklist.delete(token);
        }, expiresAt - now);

        logger.logSecurityEvent('Token blacklisted', userId, null, {
          jti: decoded.jti,
          tokenType: decoded.type,
          expiresAt: new Date(expiresAt).toISOString(),
        });
      }
    }
  } catch (error) {
    logger.error('Error blacklisting token', {
      userId,
      error: error.message,
    });
  }
};

/**
 * Blacklist all tokens for a user (logout all sessions)
 * @param {string} userId - User ID
 * @param {Array} tokens - Array of tokens to blacklist
 */
export const blacklistUserTokens = (userId, tokens) => {
  try {
    tokens.forEach((token) => {
      blacklistToken(token, userId);
    });

    logger.logSecurityEvent('All user tokens blacklisted', userId, null, {
      tokenCount: tokens.length,
    });
  } catch (error) {
    logger.error('Error blacklisting user tokens', {
      userId,
      error: error.message,
    });
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @returns {boolean} True if blacklisted
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
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
 * Generate both access and refresh tokens with enhanced security
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
      algorithm: 'HS512',
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

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {Object} New token pair
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new token pair
    const newTokenPair = generateTokenPair(decoded.id);

    // Blacklist the old refresh token
    blacklistToken(refreshToken, decoded.id);

    logger.logBusinessEvent('Access token refreshed', decoded.id, {
      oldRefreshTokenJti: decoded.jti,
      newAccessTokenJti: newTokenPair.accessToken
        ? decodeToken(newTokenPair.accessToken)?.jti
        : null,
    });

    return newTokenPair;
  } catch (error) {
    logger.error('Error refreshing access token', {
      error: error.message,
    });
    throw error;
  }
};

// Legacy export for backward compatibility
export default generateAccessToken;
