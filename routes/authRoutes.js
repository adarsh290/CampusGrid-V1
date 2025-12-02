import express from 'express';
import { signup, login, getMe, getAllUsers, addFunds } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);

export default router;



