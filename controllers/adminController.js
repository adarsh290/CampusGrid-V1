import User from '../models/User.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Top up user wallet
// @route   POST /api/admin/topup
// @access  Private/Admin
export const topUpUser = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get admin user for audit log
    const adminUser = await User.findById(req.user.id);
    const adminName = adminUser ? adminUser.username : 'Unknown';

    // Increment wallet balance using $inc
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select('-password');

    // Create audit log for top-up
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
export const getRevenue = async (req, res) => {
  try {
    // Aggregate total revenue and total games sold
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalGamesSold: { $sum: 1 },
        },
      },
    ]);

    // Get recent transactions (last 20)
    const recentTransactions = await Order.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('username gameTitle price createdAt')
      .lean();

    const stats = revenueStats[0] || { totalRevenue: 0, totalGamesSold: 0 };

    res.json({
      totalRevenue: stats.totalRevenue || 0,
      totalGamesSold: stats.totalGamesSold || 0,
      recentTransactions: recentTransactions.map(order => ({
        userName: order.username,
        gameName: order.gameTitle,
        price: order.price,
        date: order.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getLogs = async (req, res) => {
  try {
    const { type } = req.query;

    // Build query
    const query = {};
    if (type && (type === 'PURCHASE' || type === 'TOP_UP')) {
      query.type = type;
    }

    // Fetch logs sorted by date (newest first)
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(100) // Limit to 100 most recent logs
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

