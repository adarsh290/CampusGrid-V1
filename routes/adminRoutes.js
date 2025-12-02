import express from 'express';
import { getAllUsers, addFunds } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.get('/users', auth, admin, getAllUsers);
router.post('/users/:id/funds', auth, admin, addFunds);

export default router;

