import express from 'express';
import { getAllUsers, addFunds } from '../controllers/authController.js';
import { topUpUser, getRevenue, getLogs } from '../controllers/adminController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.get('/users', auth, admin, getAllUsers);
router.post('/users/:id/funds', auth, admin, addFunds);
router.post('/topup', auth, admin, topUpUser);
router.get('/revenue', auth, admin, getRevenue);
router.get('/logs', auth, admin, getLogs);

export default router;

