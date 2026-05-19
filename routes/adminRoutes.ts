import express from 'express';
import { getAllUsers, addFunds } from '../controllers/authController.js';
import { topUpUser, getRevenue, getLogs } from '../controllers/adminController.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// All admin routes require authentication and admin role

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all registered users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 *       403:
 *         description: Admin access required
 */
router.get('/users', auth, admin, getAllUsers);

/**
 * @openapi
 * /admin/users/{id}/funds:
 *   post:
 *     tags: [Admin]
 *     summary: Add funds to a specific user's wallet (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 500 }
 *     responses:
 *       200:
 *         description: Funds added
 *       404:
 *         description: User not found
 */
router.post('/users/:id/funds', auth, admin, addFunds);

/**
 * @openapi
 * /admin/topup:
 *   post:
 *     tags: [Admin]
 *     summary: Top up a user's wallet with audit logging (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, amount]
 *             properties:
 *               userId: { type: string }
 *               amount: { type: number, example: 500 }
 *     responses:
 *       200:
 *         description: Top-up successful with updated wallet balance
 *       404:
 *         description: User not found
 */
router.post('/topup', auth, admin, topUpUser);

/**
 * @openapi
 * /admin/revenue:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform revenue statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue stats and recent transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue: { type: number }
 *                 totalGamesSold: { type: number }
 *                 recentTransactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userName: { type: string }
 *                       gameName: { type: string }
 *                       price: { type: number }
 *                       date: { type: string, format: date-time }
 */
router.get('/revenue', auth, admin, getRevenue);

/**
 * @openapi
 * /admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get audit logs (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PURCHASE, TOP_UP]
 *         description: Filter logs by type
 *     responses:
 *       200:
 *         description: List of audit log entries
 */
router.get('/logs', auth, admin, getLogs);

export default router;
