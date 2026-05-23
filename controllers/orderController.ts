import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User.js';
import Game, { IGame } from '../models/Game.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Purchase a game
// @route   POST /api/orders/buy
// @access  Private
export const purchaseGame = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { gameId } = req.body;
  const userId = req.user._id;

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required' });
  }

  // Bug 15 fixed: validate ObjectId format before hitting the database
  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: 'Invalid game ID format' });
  }

  // Bug 1 fixed: wrap all DB writes in a transaction so they are atomic.
  // If Order or AuditLog creation fails, the wallet debit and library update are rolled back.
  const session = await mongoose.startSession();

  try {
    let responsePayload: { message: string; walletBalance: number; library: IGame[] };

    await session.withTransaction(async () => {
      const game: IGame | null = await Game.findById(gameId).session(session);

      if (!game) {
        throw Object.assign(new Error('Game not found'), { statusCode: 404 });
      }

      const user: IUser | null = await User.findById(userId).session(session);

      if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
      }

      const alreadyOwns = user.library.some(
        (id) => id.toString() === gameId
      );

      if (alreadyOwns) {
        throw Object.assign(new Error('You already own this game'), { statusCode: 400 });
      }

      if (user.walletBalance < game.price) {
        throw Object.assign(new Error('Insufficient Funds'), { statusCode: 400 });
      }

      // All writes happen within the same session — atomic
      user.walletBalance -= game.price;
      user.library.push(game._id as any);
      await user.save({ session });

      await Order.create([{
        user: userId,
        game: gameId,
        price: game.price,
        username: user.username,
        gameTitle: game.title,
      }], { session });

      await AuditLog.create([{
        type: 'PURCHASE',
        targetUser: user.username,
        targetUserId: userId,
        gamePurchased: game.title,
        gameId: gameId,
        amount: game.price,
      }], { session });

      await user.populate<{ library: IGame[] }>('library');

      responsePayload = {
        message: 'Game purchased successfully',
        walletBalance: user.walletBalance,
        library: user.library as IGame[],
      };
    });

    res.status(200).json(responsePayload!);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  } finally {
    session.endSession();
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
