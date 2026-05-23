import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  searchGames,
} from '../controllers/gameController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

// Bug 19 fixed: removed getDownloadToken import — it now lives exclusively
// in downloadController and is served via /api/download/token/:gameId

const router = express.Router();

const createGameValidation = [
  body('title').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('price').isNumeric(),
  body('genre').isString().notEmpty(),
  body('localFilePath').isString().notEmpty(),
];

const updateGameValidation = [
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isNumeric(),
  body('genre').optional().isString(),
  body('localFilePath').optional().isString(),
];

const handleValidation = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }
  next();
};

/**
 * @openapi
 * /games/search:
 *   get:
 *     tags: [Games]
 *     summary: Search games by title or developer
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of matching games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Game' }
 */
router.get('/search', searchGames);

/**
 * @openapi
 * /games:
 *   get:
 *     tags: [Games]
 *     summary: Get all games in the store
 *     security: []
 *     responses:
 *       200:
 *         description: Array of games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Game' }
 */
router.get('/', getGames);

/**
 * @openapi
 * /games/{id}:
 *   get:
 *     tags: [Games]
 *     summary: Get a single game by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Game details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Game' }
 *       404:
 *         description: Game not found
 */
router.get('/:id', getGame);

/**
 * @openapi
 * /games:
 *   post:
 *     tags: [Games]
 *     summary: Create a new game listing (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, price, genre, localFilePath]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               genre: { type: string }
 *               coverImage: { type: string }
 *               developer: { type: string }
 *               localFilePath: { type: string }
 *     responses:
 *       201:
 *         description: Game created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Game' }
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/', auth, admin, createGameValidation, handleValidation, createGame);

/**
 * @openapi
 * /games/{id}:
 *   put:
 *     tags: [Games]
 *     summary: Update a game listing (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Game' }
 *     responses:
 *       200:
 *         description: Updated game
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Game' }
 *       404:
 *         description: Game not found
 */
router.put('/:id', auth, admin, updateGameValidation, handleValidation, updateGame);

/**
 * @openapi
 * /games/{id}:
 *   delete:
 *     tags: [Games]
 *     summary: Delete a game listing (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Game deleted
 *       404:
 *         description: Game not found
 */
router.delete('/:id', auth, admin, deleteGame);

export default router;
