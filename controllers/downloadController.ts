import { Request, Response } from 'express';
import path from 'path';
import Game, { IGame } from '../models/Game.js';
import User, { IUser } from '../models/User.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

// @desc    Generate download token (Download Ticket)
// @route   GET /api/download/token/:gameId
// @access  Private
export const getDownloadToken = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const userId = req.user._id;

    // Bug 15 fixed: validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID format' });
    }

    // Verify game exists
    const game: IGame | null = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Verify user owns the game
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownsGame = user.library.some(
      (libGameId) => libGameId.toString() === gameId
    );

    if (!ownsGame) {
      return res.status(403).json({ message: 'You do not own this game' });
    }

    // Generate short-lived JWT token (1 minute expiry)
    const token = jwt.sign(
      { gameId, userId: userId.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '1m' }
    );

    const executionUrl = `/api/download/execute?token=${token}`;

    res.json({ executionUrl });
  } catch (error: any) {
    console.error('Token generation error:', error);
    res.status(500).json({ message: 'Failed to generate download token' });
  }
};

interface DownloadTokenPayload extends JwtPayload {
  gameId: string;
  userId: string;
}

// Allowed characters for filenames to prevent path injection
const SAFE_FILENAME_RE = /^[\w\-. ]+$/;

// @desc    Execute download (Public route with token verification)
// @route   GET /api/download/execute
// @access  Public (secured by token in query string)
export const executeDownload = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(403).json({ message: 'Download token required' });
    }

    let decoded: DownloadTokenPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DownloadTokenPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Download token expired' });
      }
      return res.status(403).json({ message: 'Invalid download token' });
    }

    const { gameId, userId } = decoded;

    // Bug 5 fixed: Re-verify that the user still owns the game at execution time.
    // The token alone is not sufficient — ownership must be confirmed from the DB.
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const ownsGame = user.library.some(
      (libGameId) => libGameId.toString() === gameId
    );

    if (!ownsGame) {
      return res.status(403).json({ message: 'Access denied: game not in library' });
    }

    const game: IGame | null = await Game.findById(gameId).select('+localFilePath');

    if (!game) {
      console.error(`❌ Download Error: Game ID ${gameId} not found`);
      return res.status(404).json({ message: 'Game not found' });
    }

    if (!game.localFilePath) {
      console.error(`❌ Download Error: Game "${game.title}" has no file path saved.`);
      return res.status(404).json({ message: 'Game file path is missing in database' });
    }

    // Bug 6 fixed: sanitize the filename using path.basename and an allowlist regex.
    // path.basename strips any directory traversal sequences.
    const rawFileName = path.basename(game.localFilePath.replace(/\\/g, '/'));

    if (!rawFileName || !SAFE_FILENAME_RE.test(rawFileName)) {
      console.error(`❌ Download Error: Unsafe filename "${rawFileName}" rejected.`);
      return res.status(500).json({ message: 'Invalid game file name' });
    }

    console.log(`✅ Serving File: ${rawFileName}`);
    console.log(`   Source Path: ${game.localFilePath}`);

    res.setHeader('X-Accel-Redirect', `/protected-files/${encodeURIComponent(rawFileName)}`);
    res.setHeader('Content-Disposition', `attachment; filename="${rawFileName}"`);
    res.end();

  } catch (error: any) {
    console.error("🔥 CRITICAL DOWNLOAD ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error during download' });
    }
  }
};
