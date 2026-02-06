import { body, validationResult } from 'express-validator';

const createGameValidation = [
  body('title').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('price').isNumeric(),
  body('genre').isString().notEmpty(),
  body('localFilePath').isString().notEmpty()
];

const updateGameValidation = [
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isNumeric(),
  body('genre').optional().isString(),
  body('localFilePath').optional().isString()
];

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
router.post('/', auth, admin, createGameValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }
  next();
}, createGame);

router.put('/:id', auth, admin, updateGameValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }
  next();
}, updateGame);
router.delete('/:id', auth, admin, deleteGame);

export default router;
