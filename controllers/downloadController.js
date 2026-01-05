import Game from '../models/Game.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';

// @desc    Generate download token (Download Ticket)
// @route   GET /api/download/token/:gameId
// @access  Private
export const getDownloadToken = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user.id;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Verify user owns the game
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownsGame = user.library.some(
      (game) => game.toString() === gameId
    );

    if (!ownsGame) {
      return res.status(403).json({ message: 'You do not own this game' });
    }

    // Generate short-lived JWT token (1 minute expiry)
    const token = jwt.sign(
      { gameId, userId },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '1m' }
    );

    // Return the execution URL
    const executionUrl = `/api/download/execute?token=${token}`;
    
    res.json({ executionUrl });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ message: 'Failed to generate download token' });
  }
};

// @desc    Execute download (Public route with token verification)
// @route   GET /api/download/execute
// @access  Public (secured by token in query string)
export const executeDownload = async (req, res) => {
  try {
    // Get token from query string
    const token = req.query.token;

    if (!token) {
      return res.status(403).json({ message: 'Download token required' });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Download token expired' });
      }
      return res.status(403).json({ message: 'Invalid download token' });
    }

    const { gameId } = decoded;

    // Find game WITH localFilePath selected (select: false by default)
    const game = await Game.findById(gameId).select('+localFilePath');

    if (!game) {
      console.error(`❌ Download Error: Game ID ${gameId} not found`);
      return res.status(404).json({ message: 'Game not found' });
    }

    if (!game.localFilePath) {
      console.error(`❌ Download Error: Game "${game.title}" has no file path saved.`);
      return res.status(404).json({ message: 'Game file path is missing in database' });
    }

    // 1. Get the full path from DB (e.g., "D:/CampusGrid_Storage/test.txt")
    const fullPath = game.localFilePath;

    // 2. Extract just the filename (e.g., "test.txt")
    // standardizes slashes to forward slashes first, then splits
    const fileName = fullPath.replace(/\\/g, '/').split('/').pop();

    console.log(`✅ Serving File: ${fileName}`);
    console.log(`   Source Path: ${fullPath}`);

    // 3. Tell Nginx to send the file via X-Accel-Redirect
    res.setHeader('X-Accel-Redirect', `/protected-files/${fileName}`);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.end();

  } catch (error) {
    console.error("🔥 CRITICAL DOWNLOAD ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error during download' });
    }
  }
};

