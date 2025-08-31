# Bike Biz Buddy Backend API

A scalable and production-ready backend API for the Bike Biz Buddy application, built with Node.js, Express, and MongoDB.

## 🚀 Phase 1: Foundation & Configuration

This phase establishes the foundational infrastructure for a production-ready backend:

### ✅ Completed Features

- **Environment Configuration Management**
  - Centralized configuration with Joi validation
  - Environment-specific settings
  - Required environment variable validation

- **Centralized Logging System**
  - Winston-based structured logging
  - File and console transports
  - Request/response logging
  - Security event tracking
  - Business event logging

- **Security Middleware**
  - Helmet.js for security headers
  - Rate limiting (general + auth-specific)
  - CORS configuration
  - MongoDB query sanitization
  - Parameter pollution protection
  - Request size limiting

- **Error Handling & Validation**
  - Centralized error handling
  - Custom error classes
  - Request ID tracking
  - Response time monitoring
  - Async error wrapper

- **Code Quality Tools**
  - ESLint with strict rules
  - Prettier configuration
  - Code formatting standards

- **Graceful Shutdown**
  - Proper server shutdown handling
  - Database connection cleanup
  - Signal handling (SIGTERM, SIGINT)

## 🛠️ Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bike-biz-buddy/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Required Environment Variables**
   ```bash
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/bike-biz-buddy
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-key-here-min-32-chars
   
   # Security Configuration
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Code Quality Checks
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📊 Health Check

The API provides a comprehensive health check endpoint:

```bash
GET /health
```

Returns:
- Server status
- Database health
- Memory usage
- Uptime
- Environment information

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes (general), 5 auth attempts per 15 minutes
- **Security Headers**: Helmet.js with CSP, XSS protection, frame options
- **Input Sanitization**: MongoDB query sanitization, parameter pollution protection
- **CORS**: Configurable origin validation
- **Request Size Limits**: 10MB maximum request size

## 📝 Logging

### Log Levels
- `error`: Application errors and exceptions
- `warn`: Warning conditions
- `info`: General information
- `http`: HTTP request logging
- `debug`: Debug information (development only)

### Log Files
- `logs/app.log`: General application logs
- `logs/error.log`: Error-level logs only
- `logs/exceptions.log`: Uncaught exceptions
- `logs/rejections.log`: Unhandled promise rejections

### Structured Logging
```javascript
logger.logAPIRequest(req, res, responseTime);
logger.logAPIError(error, req, additionalInfo);
logger.logSecurityEvent(event, userId, ip, additionalInfo);
logger.logBusinessEvent(event, userId, additionalInfo);
```

## 🏗️ Project Structure

```
Backend/
├── config/                 # Configuration files
│   ├── config.js         # Centralized configuration
│   ├── db.js            # Database connection
│   └── logger.js        # Logging configuration
├── middleware/           # Middleware functions
│   ├── errorHandler.js  # Error handling
│   ├── security.js      # Security middleware
│   └── authMiddleware.js # Authentication
├── routes/              # API routes
├── controllers/         # Route controllers
├── models/             # Database models
├── utils/              # Utility functions
├── logs/               # Log files (auto-created)
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
└── server.js           # Main application file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - | Yes |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Database Configuration
- Connection pooling enabled
- SSL for production environments
- Proper timeout configurations
- Graceful shutdown handling

## 🚨 Error Handling

### Custom Error Classes
- `AppError`: Base error class
- `ValidationError`: Input validation errors
- `AuthenticationError`: Authentication failures
- `AuthorizationError`: Permission denied
- `NotFoundError`: Resource not found
- `ConflictError`: Resource conflicts

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST",
  "requestId": "req_1234567890_abc123"
}
```

## 📈 Monitoring

### Request Tracking
- Unique request ID for each request
- Response time monitoring
- Request/response logging
- Error tracking with context

### Performance Metrics
- Memory usage monitoring
- Database connection health
- Response time tracking
- Rate limit monitoring

## 🔄 API Endpoints

### Authentication
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/createuser` - Create user
- `GET /api/v1/users/getusers` - Get users
- `PUT /api/v1/users/:userId` - Update user
- `DELETE /api/v1/users/:userId` - Delete user

### Stores
- `POST /api/v1/stores` - Create store
- `GET /api/v1/stores` - Get stores
- `GET /api/v1/stores/:id` - Get store by ID
- `PUT /api/v1/stores/:id` - Update store
- `DELETE /api/v1/stores/:id` - Soft delete store

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up monitoring and alerting
- Use process manager (PM2, Docker, etc.)

### Docker (Future Implementation)
```dockerfile
# Dockerfile will be added in Phase 2
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Next Steps

### Phase 2: Service Layer & Validation
- Implement service layer architecture
- Add comprehensive input validation
- Implement proper RBAC middleware
- Add API response standardization

### Phase 3: Testing & Performance
- Add testing framework and coverage
- Implement caching layer
- Add monitoring and metrics
- Database optimization

### Phase 4: DevOps & Documentation
- Docker containerization
- CI/CD pipeline setup
- API documentation (Swagger)
- Performance optimization

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Add proper error handling and logging
3. Include tests for new features
4. Update documentation as needed

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the logs in the `logs/` directory
2. Verify environment configuration
3. Check database connectivity
4. Review API endpoint documentation
