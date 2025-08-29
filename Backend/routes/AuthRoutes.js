import express from 'express';
import { createUser, loginUser, getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, checkPermission } from '../middleware/authMiddleware.js';
import { validateCreateUser, validateLoginUser, handleValidation } from '../middleware/validator/validator.js';

const router = express.Router();

// Create user (only global_admin and procurement_admin via "create_procurement_users" or "manage_store_users")
router.post('/createuser', protect, checkPermission('manage_store_users'), validateCreateUser, handleValidation, createUser);
router.post('/login', validateLoginUser, handleValidation, loginUser);
// Get users (restricted)
router.get('/getusers', protect, checkPermission('manage_store_users'), getUsers);

// Update user
router.put('/:userId', protect, checkPermission('manage_store_users'), updateUser);

// Delete user
router.delete('/:userId', protect, checkPermission('manage_store_users'), deleteUser);

export default router;
