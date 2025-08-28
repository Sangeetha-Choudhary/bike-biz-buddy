# Bike Biz Buddy API Testing Guide

## Postman Collection Setup

I've created a comprehensive Postman collection to test your Bike Biz Buddy backend API. The collection includes:

### Files Created:
1. **Bike-Biz-Buddy-API.postman_collection.json** - Complete API collection
2. **Bike-Biz-Buddy-Environment.postman_environment.json** - Environment variables
3. **README-Testing.md** - This guide

### Collection Structure:

#### 1. Authentication
- **Login User** - Login and store JWT token
- **Create User (Admin Only)** - Create new users (requires admin privileges)
- **Get All Users (Admin Only)** - List all users

#### 2. Store Management
- **Create Store** - Create new store (requires manage_store permission)
- **Get All Stores (Global Admin Only)** - List all stores

#### 3. Test Different Roles
- **Login as Global Admin** - Test highest privilege level
- **Login as Store Admin** - Test store-level permissions
- **Login as Sales Executive** - Test limited permissions
- **Test Unauthorized Access** - Verify RBAC is working

#### 4. Error Scenarios
- **Login with Invalid Credentials** - Test authentication errors
- **Create User with Duplicate Email** - Test validation
- **Access Protected Route Without Token** - Test authorization
- **Create Store with Duplicate Store Name** - Test unique constraints

#### 5. Server Health Check
- **Health Check** - Basic server status

## Setup Instructions:

### 1. Import into Postman
1. Open Postman
2. Click "Import" button
3. Import both files:
   - `Bike-Biz-Buddy-API.postman_collection.json`
   - `Bike-Biz-Buddy-Environment.postman_environment.json`

### 2. Set Environment
1. Select "Bike Biz Buddy Environment" from the environment dropdown
2. The base URL is set to `http://localhost:3000` (modify if different)

### 3. Prepare Test Data
Before testing, you need to seed your database with test users. Run this seeder script:

```javascript
// Add this to your seeders/seeder.js or create a new test-seeder.js
import User from '../models/User.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';

const seedTestUsers = async () => {
  try {
    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUsers = [
      {
        username: 'Global Admin',
        email: 'global.admin@example.com',
        password: hashedPassword,
        role: 'global_admin',
        phone: '+1234567890'
      },
      {
        username: 'Store Admin',
        email: 'store.admin@example.com',
        password: hashedPassword,
        role: 'store_admin',
        phone: '+1234567891'
      },
      {
        username: 'Sales Executive',
        email: 'sales.exec@example.com',
        password: hashedPassword,
        role: 'sales_executive',
        phone: '+1234567892'
      },
      {
        username: 'Procurement Admin',
        email: 'procurement.admin@example.com',
        password: hashedPassword,
        role: 'procurement_admin',
        phone: '+1234567893'
      },
      {
        username: 'Procurement Executive',
        email: 'procurement.exec@example.com',
        password: hashedPassword,
        role: 'procurement_executive',
        phone: '+1234567894'
      }
    ];

    await User.deleteMany({}); // Clear existing test users
    await User.insertMany(testUsers);
    console.log('Test users seeded successfully!');
  } catch (error) {
    console.error('Error seeding test users:', error);
  }
};

// Call this function to seed test data
seedTestUsers();
```

### 4. Testing Workflow

#### Step 1: Start Your Server
```bash
cd Backend
npm start
```

#### Step 2: Run Health Check
- Execute "Health Check" request to ensure server is running

#### Step 3: Test Authentication Flow
1. Run "Login as Global Admin" first
2. This will store the JWT token in environment variables
3. Run other authenticated requests

#### Step 4: Test RBAC System
1. Login with different roles
2. Try accessing endpoints with different permission levels
3. Verify that unauthorized requests return 403

#### Step 5: Test CRUD Operations
1. Create a store (as admin)
2. Create users with different roles
3. List users and stores

#### Step 6: Test Error Scenarios
Run all error scenario tests to ensure proper error handling

## Key Features of the Collection:

### 1. Automatic Token Management
- Login requests automatically store JWT tokens
- Subsequent requests use stored tokens
- Different tokens for different user roles

### 2. Response Validation
- Automatic status code validation
- Response structure validation
- Error message validation

### 3. Environment Variables
All dynamic values are stored as environment variables:
- `baseUrl` - API base URL
- `authToken` - Current user's JWT token
- `globalAdminToken` - Global admin JWT token
- `storeAdminToken` - Store admin JWT token
- `salesExecutiveToken` - Sales executive JWT token
- `userId` - Current user ID
- `userRole` - Current user role
- `storeId` - Created store ID

### 4. Role-Based Testing
- Separate login requests for each role
- Permission testing for each role
- Unauthorized access testing

### 5. Comprehensive Error Testing
- Invalid credentials
- Duplicate data
- Missing authorization
- Permission violations

## Expected Test Results:

### ✅ Should Pass:
- Health check returns 200
- Valid login returns JWT token
- Admin can create users and stores
- Global admin can list all stores
- Role-based access control works

### ❌ Should Fail (Expected Failures):
- Invalid login returns 400
- Unauthorized access returns 401/403
- Duplicate data returns 400
- Sales executive cannot create users (403)

## Tips for Testing:

1. **Run tests in order** - Some tests depend on previous results
2. **Check environment variables** - Tokens are automatically stored
3. **Monitor console logs** - Server logs will show authentication attempts
4. **Test edge cases** - Try invalid data and unauthorized access
5. **Verify RBAC** - Each role should have specific permissions

## Troubleshooting:

### Common Issues:
1. **Server not running** - Ensure backend server is started
2. **Database connection** - Check MongoDB connection
3. **Token expiration** - Re-login if tokens expire
4. **CORS errors** - Ensure CORS is configured correctly
5. **Environment not selected** - Select the correct environment in Postman

This collection provides comprehensive testing for your RBAC-enabled bike business management system!
