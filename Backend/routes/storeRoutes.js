import express from 'express';
import { protect, checkPermission } from '../middleware/authMiddleware.js';
import { createStore, getStores } from '../controllers/storeController.js';

const router = express.Router();

// Only roles with "manage_store" can create stores
router.post('/createstore', protect, checkPermission('manage_store'), createStore);

// Only global_admin (has "*") can list all stores
router.get('/getstores', protect, checkPermission('manage_store'), getStores);
// router.get('/:id', protect, checkPermission('read_own', 'store'), getSingleStore);

export default router;