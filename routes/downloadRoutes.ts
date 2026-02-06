import express from 'express';
import { getDownloadToken, executeDownload } from '../controllers/downloadController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Protected route: Generate download token
router.get('/token/:gameId', auth, getDownloadToken);

// Public route: Execute download (secured by token in query string)
router.get('/execute', executeDownload);

export default router;




