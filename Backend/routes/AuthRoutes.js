import express from 'express';
import { createUser,loginUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/createUser', createUser);
router.post('/login',loginUser);

export default router;
