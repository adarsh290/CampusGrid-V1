import express from 'express';
import {
  getGames,
  getGame,
  getDownloadToken,
  createGame,
  updateGame,
  deleteGame,
  downloadGame,
  searchGames,
} from '../controllers/gameController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/search', searchGames);
router.get('/', getGames);

// Download route (Protected with auth)
// MUST come before /:id to avoid route conflicts
router.get('/download/:id', auth, downloadGame);

// Download token route (Protected with auth)
router.get('/:id/token', auth, getDownloadToken);

// Get single game (must come after /download to avoid conflicts)
router.get('/:id', getGame);

// Admin routes (Protected by auth AND admin)
router.post('/', auth, admin, createGame);
router.put('/:id', auth, admin, updateGame);
router.delete('/:id', auth, admin, deleteGame);

export default router;
