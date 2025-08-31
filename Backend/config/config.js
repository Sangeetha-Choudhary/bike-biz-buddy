import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),

  // Database Configuration
  MONGO_URI: Joi.string().required(),
  MONGO_URI_TEST: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Security Configuration
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),

  // Logging Configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_FILE_PATH: Joi.string().default('logs/app.log'),

  // CORS Configuration
  CORS_ORIGIN: Joi.string().default(
    'http://localhost:3000,http://localhost:5173'
  ),

  // API Configuration
  API_VERSION: Joi.string().default('v1'),
  API_PREFIX: Joi.string().default('/api'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  const errorMessage = `Environment validation error: ${error.details
    .map((detail) => detail.message)
    .join(', ')}`;
  throw new Error(errorMessage);
}

// Configuration object
const config = {
  // Server Configuration
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  isDevelopment: envVars.NODE_ENV === 'development',
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',

  // Database Configuration
  database: {
    uri:
      envVars.NODE_ENV === 'test' ? envVars.MONGO_URI_TEST : envVars.MONGO_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // JWT Configuration
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  },

  // Logging Configuration
  logging: {
    level: envVars.LOG_LEVEL,
    filePath: envVars.LOG_FILE_PATH,
  },

  // CORS Configuration
  cors: {
    origin: envVars.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  },

  // API Configuration
  api: {
    version: envVars.API_VERSION,
    prefix: envVars.API_PREFIX,
    baseUrl: `${envVars.API_PREFIX}/${envVars.API_VERSION}`,
  },
};

export default config;
