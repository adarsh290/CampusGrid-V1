import { Request, Response } from 'express';
import User, { IUser } from '../models/User.js';
import Game, { IGame } from '../models/Game.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Purchase a game
// @route   POST /api/orders/buy
// @access  Private
export const purchaseGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.body;
    
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const userId = req.user._id;

    if (!gameId) {
      return res.status(400).json({ message: 'Game ID is required' });
    }

    const game: IGame | null = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user: IUser | null = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyOwns = user.library.some(
      (id) => id.toString() === gameId
    );

    if (alreadyOwns) {
      return res.status(400).json({ message: 'You already own this game' });
    }

    if (user.walletBalance < game.price) {
      return res.status(400).json({ message: 'Insufficient Funds' });
    }

    user.walletBalance -= game.price;
    user.library.push(game._id as any);
    await user.save();

    await Order.create({
      user: userId,
      game: gameId,
      price: game.price,
      username: user.username,
      gameTitle: game.title,
    });

    await AuditLog.create({
      type: 'PURCHASE',
      targetUser: user.username,
      targetUserId: userId,
      gamePurchased: game.title,
      gameId: gameId,
      amount: game.price,
    });

    await user.populate<{ library: IGame[] }>('library');

    res.status(200).json({
      message: 'Game purchased successfully',
      walletBalance: user.walletBalance,
      library: user.library,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's library
// @route   GET /api/orders/library
// @access  Private
export const getLibrary = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(req.user._id).populate<{ library: IGame[] }>('library');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      library: user.library.map(game => {
        const gameObj: any = game.toObject();
        delete gameObj.localFilePath; // Ensure localFilePath is never sent
        return gameObj;
      }),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
