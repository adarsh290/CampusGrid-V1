import { Request, Response } from 'express';
import User, { IUser } from '../models/User.js';
import Order, { IOrder } from '../models/Order.js';
import AuditLog, { IAuditLog } from '../models/AuditLog.js';

// @desc    Top up user wallet
// @route   POST /api/admin/topup
// @access  Private/Admin
export const topUpUser = async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const user: IUser | null = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const adminUser: IUser | null = await User.findById(req.user._id);
    const adminName = adminUser ? adminUser.username : 'Unknown';

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found after update' });
    }

    await AuditLog.create({
      type: 'TOP_UP',
      adminName: adminName,
      targetUser: updatedUser.username,
      targetUserId: userId,
      amount: amount,
    });

    res.json({
      message: 'Funds added successfully',
      walletBalance: updatedUser.walletBalance,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        walletBalance: updatedUser.walletBalance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
export const getRevenue = async (req: Request, res: Response) => {
  try {
    const revenueStats: { _id: null; totalRevenue: number; totalGamesSold: number }[] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalGamesSold: { $sum: 1 },
        },
      },
    ]);

    const recentTransactions = await Order.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('username gameTitle price createdAt')
      .lean();

    const stats = revenueStats[0] || { totalRevenue: 0, totalGamesSold: 0 };

    res.json({
      totalRevenue: stats.totalRevenue || 0,
      totalGamesSold: stats.totalGamesSold || 0,
      recentTransactions: (recentTransactions as any[]).map(order => ({
        userName: order.username,
        gameName: order.gameTitle,
        price: order.price,
        date: order.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getLogs = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const query: any = {};
    if (type && (type === 'PURCHASE' || type === 'TOP_UP')) {
      query.type = type;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
