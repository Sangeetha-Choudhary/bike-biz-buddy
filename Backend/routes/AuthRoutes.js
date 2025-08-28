import express from 'express';
import { createUser, loginUser, getUsers } from '../controllers/userController.js';
import { protect, checkPermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create user (only global_admin and procurement_admin via "create_procurement_users" or "manage_store_users")
router.post('/createUser', protect, checkPermission('manage_store_users'), createUser);
router.post('/login', loginUser);
// Get users (restricted)
router.get('/', protect, checkPermission('manage_store_users'), getUsers);

export default router;
