import express from 'express';
import { purchaseGame, getLibrary } from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/library', auth, getLibrary);
router.post('/buy', auth, purchaseGame);

export default router;



