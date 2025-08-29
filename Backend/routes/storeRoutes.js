import express from 'express';
import { protect, checkPermission } from '../middleware/authMiddleware.js';
import { 
  createStore, 
  getStores, 
  softDeleteStore, 
  restoreStore,
  updateStore,
  getStoreById 
} from '../controllers/storeController.js';
import { validateCreateStore, validateUpdateStore, handleValidation } from '../middleware/validator/validator.js';

const router = express.Router();

// Only roles with "manage_store" can create stores
router.post('/createstore', protect, checkPermission('manage_store'), validateCreateStore, handleValidation, createStore);

// Only global_admin (has "*") can list all stores
router.get('/getstores', protect, checkPermission('manage_store'), getStores);
// router.get('/:id', protect, checkPermission('read_own', 'store'), getSingleStore);

// Soft delete a store (requires manage_store permission)
router.delete('/:id', protect, checkPermission('manage_store'), softDeleteStore);

// Restore a soft-deleted store (requires manage_store permission)
router.put('/:id/restore', protect, checkPermission('manage_store'), restoreStore);

// Update a store (requires manage_store permission)
router.put('/:id', protect, checkPermission('manage_store'), validateUpdateStore, handleValidation, updateStore);

// Get a single store by ID (requires manage_store permission)
router.get('/:id', protect, checkPermission('manage_store'), getStoreById);

export default router;