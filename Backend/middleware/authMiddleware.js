import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
// import rbac from '../config/rbac.js'; // Commented out - using new RBAC middleware

dotenv.config();

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    console.log('my token is: ', authHeader);
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, you don't have the token " });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Finding the user and populate their store details
    req.user = await User.findById(decoded.id)
      .select('-password')
      .populate('store');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Authorization middleware using rbac.
// export const checkPermission = (action, resource) => {
//   return async (req, res, next) => {
//     try {
//       if (!req.user || !req.user.role) {
//         return res.status(403).json({ message: 'Forbidden: Missing role.' });
//       }

//       // permission
//       // const permission = `${resource}:${action}`;
//       // Check if the user has a general permission for the resource
//       const canAccess = await rbac.can(req.user.role, action , resource);

//       console.log('RBAC check:', req.user.role, action , resource);
//       console.log('RBAC canAccess:', canAccess);

//       // If the resource is not an "_own" resource and the user has permission, proceed.
//       if (canAccess && !resource.endsWith('_own')) {
//         return next();
//       }

//       // If the permission is for an "_own" resource, perform an additional check.
//       if (resource.endsWith('_own')) {
//         // The user must have a store associated with their account.
//         if (!req.user.store) {
//           return res.status(403).json({ message: 'Forbidden: You do not have an assigned store.' });
//         }

//         // Get the resource ID from the request parameters.
//         const resourceId = req.params.id;

//         // Check if the user's store ID matches the resource ID.
//         // This is a direct ownership check.
//         if (req.user.store._id.toString() === resourceId) {
//           return next();
//         }
//       }

//       // If all checks fail, deny access.
//       res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
//     } catch (error) {
//       res.status(500).json({ message: 'Authorization error.' });
//     }
//   };
// };
// Permission checker using easy-rbac (DEPRECATED - use new RBAC middleware)
// Note: This function is deprecated. Use the new RBAC middleware from rbacMiddleware.js
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    // Temporary fallback - in production, replace with new RBAC middleware
    console.warn(
      'DEPRECATED: checkPermission from authMiddleware.js is deprecated. Use RBAC middleware instead.'
    );
    next(); // Allow access for now - replace with proper RBAC middleware
  };
};
