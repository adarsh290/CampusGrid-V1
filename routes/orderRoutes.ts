import express from 'express';
import { purchaseGame, getLibrary } from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * /orders/library:
 *   get:
 *     tags: [Orders]
 *     summary: Get the authenticated user's game library
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's library of owned games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 library:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Game' }
 *       401:
 *         description: Unauthorized
 */
router.get('/library', auth, getLibrary);

/**
 * @openapi
 * /orders/buy:
 *   post:
 *     tags: [Orders]
 *     summary: Purchase a game using wallet balance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId]
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the game to purchase
 *     responses:
 *       200:
 *         description: Game purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 walletBalance: { type: number }
 *                 library:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Game' }
 *       400:
 *         description: Already owns game, insufficient funds, or missing gameId
 *       404:
 *         description: Game or user not found
 */
router.post('/buy', auth, purchaseGame);

export default router;
