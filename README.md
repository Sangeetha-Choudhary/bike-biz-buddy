<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dc2863c2-bc02-4ebb-a35a-8ad7cf728ba9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dc2863c2-bc02-4ebb-a35a-8ad7cf728ba9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dc2863c2-bc02-4ebb-a35a-8ad7cf728ba9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
=======
# BikeBiz CRM - Role-Based Access Control System

A comprehensive CRM system for bike dealerships with role-based access control (RBAC) implemented across frontend and backend.

## Features

- **Role-Based Access Control (RBAC)**: 5 different user roles with specific permissions
- **Secure Authentication**: JWT-based authentication with password hashing
- **Store Management**: Multi-store support with store-specific access
- **Lead Management**: Complete lead lifecycle management
- **Inventory Management**: Vehicle inventory tracking and management
- **Procurement System**: Vehicle acquisition and verification workflows
- **Analytics Dashboard**: Role-specific analytics and reporting

## User Roles & Permissions

### 1. Global Admin
- **Permissions**: All system permissions
- **Access**: Multi-store access, user management, system configuration
- **Demo Account**: `admin@bikebiz.com` / `admin123`

### 2. Store Admin
- **Permissions**: Store management, team management, store analytics
- **Access**: Full store access, user creation for their store
- **Demo Accounts**: 
  - `store@mumbai.com` / `store123`
  - `store@delhi.com` / `store123`
  - `store@bangalore.com` / `store123`

### 3. Sales Executive
- **Permissions**: Lead management, sales creation, customer communication
- **Access**: Store-specific lead and sales management
- **Demo Accounts**:
  - `sales1@mumbai.com` / `sales123`
  - `sales2@mumbai.com` / `sales123`
  - `sales1@delhi.com` / `sales123`

### 4. Procurement Admin
- **Permissions**: City-wide procurement, inventory assignment, vendor management
- **Access**: Procurement management for assigned city
- **Demo Accounts**:
  - `procurement@pune.com` / `proc123`
  - `procurement@mumbai.com` / `proc123`

### 5. Procurement Executive
- **Permissions**: Vehicle verification, field operations, expense claims
- **Access**: Vehicle hunting and verification tasks
- **Demo Accounts**:
  - `exec1@pune-procurement.com` / `exec123`
  - `exec2@pune-procurement.com` / `exec123`
  - `exec1@mumbai-procurement.com` / `exec123`

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for frontend communication

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **React Context** for state management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the Backend directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/bike-biz-buddy
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=30d
   ```

4. **Database Setup**:
   - Start MongoDB service
   - Run the seeder to create demo accounts:
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the Frontend directory:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_PORT=8080
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open `http://localhost:8080` in your browser

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/createUser` - Create new user (admin only)

### Response Format
```json
{
  "_id": "user_id",
  "username": "User Name",
  "email": "user@example.com",
  "role": "role_name",
  "redirectUrl": "/dashboard/role",
  "token": "jwt_token"
}
```

## Project Structure

```
bike-biz-buddy/
├── Backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   └── User.js           # User schema
│   ├── routes/
│   │   └── AuthRoutes.js     # API routes
│   ├── seeders/
│   │   └── seeder.js         # Demo data seeder
│   ├── utils/
│   │   └── generateToken.js  # JWT token generation
│   └── server.js             # Express server
├── Frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Authentication context
│   │   ├── services/
│   │   │   └── api.ts        # API service layer
│   │   └── ...
│   └── ...
└── README.md
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Frontend and backend permission checks
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Request validation and sanitization

## Development

### Adding New Roles
1. Update the role enum in `Backend/models/User.js`
2. Add permissions mapping in `Frontend/src/contexts/AuthContext.tsx`
3. Update role-based redirects in `Backend/controllers/authController.js`

### Adding New Permissions
1. Update the `ROLE_PERMISSIONS` mapping in `Frontend/src/contexts/AuthContext.tsx`
2. Use `hasPermission()` function in components for access control

### API Development
- Follow RESTful conventions
- Implement proper error handling
- Add authentication middleware where needed
- Use consistent response formats

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env` file

2. **CORS Errors**:
   - Verify backend CORS configuration
   - Check frontend API base URL

3. **Authentication Issues**:
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user exists in database

4. **Permission Errors**:
   - Check user role assignment
   - Verify permission mapping in AuthContext

## License

This project is licensed under the ISC License.
# bike-biz-buddy-
>>>>>>> 5eff526 (first commit)
