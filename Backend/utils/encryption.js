import crypto from 'crypto';
import config from '../config/config.js';
import logger from '../config/logger.js';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Generate a secure encryption key
 * @param {string} password - Password to derive key from
 * @param {string} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
export const deriveKey = (password, salt) => {
  try {
    return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
  } catch (error) {
    logger.error('Error deriving encryption key', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to derive encryption key');
  }
};

/**
 * Generate a random salt
 * @returns {string} Random salt
 */
export const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {Object} Encrypted data with metadata
 */
export const encryptData = (data, key) => {
  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, key);
    cipher.setAAD(Buffer.from('bike-biz-buddy', 'utf8'));
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    const result = {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ENCRYPTION_ALGORITHM,
    };
    
    logger.logBusinessEvent('Data encrypted', null, {
      algorithm: ENCRYPTION_ALGORITHM,
      dataLength: data.length,
    });
    
    return result;
  } catch (error) {
    logger.error('Error encrypting data', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt encrypted data
 * @param {Object} encryptedData - Encrypted data object
 * @param {string} key - Decryption key
 * @returns {string} Decrypted data
 */
export const decryptData = (encryptedData, key) => {
  try {
    const { encrypted, iv, authTag, algorithm } = encryptedData;
    
    if (algorithm !== ENCRYPTION_ALGORITHM) {
      throw new Error('Unsupported encryption algorithm');
    }
    
    // Create decipher
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, key);
    decipher.setAAD(Buffer.from('bike-biz-buddy', 'utf8'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    logger.logBusinessEvent('Data decrypted', null, {
      algorithm: ENCRYPTION_ALGORITHM,
      dataLength: decrypted.length,
    });
    
    return decrypted;
  } catch (error) {
    logger.error('Error decrypting data', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive data (one-way encryption)
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed data
 */
export const hashData = (data, salt) => {
  try {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(data);
    return hash.digest('hex');
  } catch (error) {
    logger.error('Error hashing data', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to hash data');
  }
};

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} Random token
 */
export const generateSecureToken = (length = 32) => {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    logger.error('Error generating secure token', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to generate secure token');
  }
};

/**
 * Encrypt file data
 * @param {Buffer} fileBuffer - File data to encrypt
 * @param {string} key - Encryption key
 * @returns {Object} Encrypted file data
 */
export const encryptFile = (fileBuffer, key) => {
  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, key);
    cipher.setAAD(Buffer.from('bike-biz-buddy-file', 'utf8'));
    
    // Encrypt file data
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    const result = {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ENCRYPTION_ALGORITHM,
      originalSize: fileBuffer.length,
    };
    
    logger.logBusinessEvent('File encrypted', null, {
      algorithm: ENCRYPTION_ALGORITHM,
      originalSize: fileBuffer.length,
      encryptedSize: encrypted.length,
    });
    
    return result;
  } catch (error) {
    logger.error('Error encrypting file', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypt encrypted file data
 * @param {Object} encryptedFileData - Encrypted file data object
 * @param {string} key - Decryption key
 * @returns {Buffer} Decrypted file data
 */
export const decryptFile = (encryptedFileData, key) => {
  try {
    const { encrypted, iv, authTag, algorithm, originalSize } = encryptedFileData;
    
    if (algorithm !== ENCRYPTION_ALGORITHM) {
      throw new Error('Unsupported encryption algorithm');
    }
    
    // Create decipher
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, key);
    decipher.setAAD(Buffer.from('bike-biz-buddy-file', 'utf8'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Convert base64 to buffer
    const encryptedBuffer = Buffer.from(encrypted, 'base64');
    
    // Decrypt file data
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);
    
    // Verify size
    if (decrypted.length !== originalSize) {
      throw new Error('Decrypted file size mismatch');
    }
    
    logger.logBusinessEvent('File decrypted', null, {
      algorithm: ENCRYPTION_ALGORITHM,
      originalSize: originalSize,
      decryptedSize: decrypted.length,
    });
    
    return decrypted;
  } catch (error) {
    logger.error('Error decrypting file', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to decrypt file');
  }
};

/**
 * Generate a secure hash for password verification
 * @param {string} password - Password to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed password
 */
export const hashPassword = (password, salt) => {
  try {
    // Use PBKDF2 for password hashing
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return hash.toString('hex');
  } catch (error) {
    logger.error('Error hashing password', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password against hash
 * @param {string} password - Password to verify
 * @param {string} hash - Stored hash
 * @param {string} salt - Salt used for hashing
 * @returns {boolean} True if password matches
 */
export const verifyPassword = (password, hash, salt) => {
  try {
    const computedHash = hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  } catch (error) {
    logger.error('Error verifying password', {
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

/**
 * Encrypt sensitive fields in an object
 * @param {Object} data - Object containing sensitive data
 * @param {Array} sensitiveFields - Array of field names to encrypt
 * @param {string} key - Encryption key
 * @returns {Object} Object with encrypted sensitive fields
 */
export const encryptSensitiveFields = (data, sensitiveFields, key) => {
  try {
    const encryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field] && typeof data[field] === 'string') {
        const encrypted = encryptData(data[field], key);
        encryptedData[field] = encrypted;
      }
    }
    
    return encryptedData;
  } catch (error) {
    logger.error('Error encrypting sensitive fields', {
      error: error.message,
      stack: error.stack,
      sensitiveFields,
    });
    throw new Error('Failed to encrypt sensitive fields');
  }
};

/**
 * Decrypt sensitive fields in an object
 * @param {Object} data - Object containing encrypted sensitive data
 * @param {Array} sensitiveFields - Array of field names to decrypt
 * @param {string} key - Decryption key
 * @returns {Object} Object with decrypted sensitive fields
 */
export const decryptSensitiveFields = (data, sensitiveFields, key) => {
  try {
    const decryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field] && typeof data[field] === 'object' && data[field].encrypted) {
        try {
          const decrypted = decryptData(data[field], key);
          decryptedData[field] = decrypted;
        } catch (decryptError) {
          logger.warn('Failed to decrypt field', {
            field,
            error: decryptError.message,
          });
          decryptedData[field] = '[ENCRYPTED]';
        }
      }
    }
    
    return decryptedData;
  } catch (error) {
    logger.error('Error decrypting sensitive fields', {
      error: error.message,
      stack: error.stack,
      sensitiveFields,
    });
    throw new Error('Failed to decrypt sensitive fields');
  }
};
