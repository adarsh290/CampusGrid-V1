import Game from '../models/Game.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getGames = async (req, res) => {
  try {
    const games = await Game.find().select('-localFilePath');
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
export const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).select('-localFilePath');
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get download token (DRM)
// @route   GET /api/games/:id/token
// @access  Private
export const getDownloadToken = async (req, res) => {
  try {
    // Check if user exists (from auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const gameId = req.params.id;
    const userId = req.user.id;

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user owns the game
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

    // Sign JWT token with gameId and userId, expires in 5 minutes
    const token = jwt.sign(
      { gameId, userId },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '5m' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download game (Streaming Engine with Resumable Support)
// @route   GET /api/games/download
// @access  Public (secured by token in query string)
export const downloadGame = async (req, res) => {
  try {
    // Security: Read and verify token from query string
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

    // Get game with localFilePath (select: false by default, need to explicitly select)
    const game = await Game.findById(gameId).select('+localFilePath');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (!game.localFilePath) {
      return res.status(404).json({ message: 'Game file path not configured' });
    }

    // Resolve local file path using GAME_STORAGE_PATH
    const basePath = process.env.GAME_STORAGE_PATH || 'D:/CampusGames';
    
    // Security: Prevent path traversal in localFilePath
    if (game.localFilePath.includes('..') || game.localFilePath.includes('../') || game.localFilePath.includes('..\\')) {
      return res.status(400).json({ message: 'Invalid file path: Path traversal detected' });
    }

    const filePath = path.join(basePath, game.localFilePath);
    const absolutePath = path.resolve(filePath);
    const resolvedBasePath = path.resolve(basePath);

    // Security: Ensure resolved path is within base directory
    if (!absolutePath.startsWith(resolvedBasePath)) {
      return res.status(400).json({ message: 'Invalid file path: Outside allowed directory' });
    }

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Game file not found on server' });
    }

    // Get file stats
    const stats = fs.statSync(absolutePath);
    const fileSize = stats.size;
    const fileName = path.basename(absolutePath);

    // Resumable Download Support (Range Requests)
    const range = req.headers.range;

    if (range) {
      // Parse Range header (format: "bytes=start-end")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (start >= fileSize || end >= fileSize || start > end) {
        return res.status(416).json({ message: 'Range Not Satisfiable' });
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(absolutePath, { start, end });

      // Set headers for partial content (HTTP 206)
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      // Stream the file chunk
      file.pipe(res);

      file.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming file' });
        }
      });
    } else {
      // No range header - stream entire file (HTTP 200)
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Accept-Ranges', 'bytes');

      // CRITICAL: Use createReadStream to pipe file (prevents RAM crash)
      // Do NOT use fs.readFile for large files
      const fileStream = fs.createReadStream(absolutePath);

      fileStream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming file' });
        }
      });

      // Pipe the file stream to response
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Create game (Admin only)
// @route   POST /api/games
// @access  Private/Admin
export const createGame = async (req, res) => {
  try {
    const { title, description, price, coverImage, genre, localFilePath } = req.body;

    if (!title || !description || price === undefined || !genre || !localFilePath) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const game = await Game.create({
      title,
      description,
      price,
      coverImage,
      genre,
      localFilePath, // Ensure localFilePath is saved
    });

    // Return game without localFilePath
    const gameResponse = game.toObject();
    delete gameResponse.localFilePath;

    res.status(201).json(gameResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update game (Admin only)
// @route   PUT /api/games/:id
// @access  Private/Admin
export const updateGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const { title, description, price, coverImage, genre, localFilePath } = req.body;

    if (title) game.title = title;
    if (description) game.description = description;
    if (price !== undefined) game.price = price;
    if (coverImage !== undefined) game.coverImage = coverImage;
    if (genre) game.genre = genre;
    if (localFilePath) game.localFilePath = localFilePath;

    await game.save();

    // Return game without localFilePath
    const gameResponse = game.toObject();
    delete gameResponse.localFilePath;

    res.json(gameResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete game (Admin only)
// @route   DELETE /api/games/:id
// @access  Private/Admin
export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await game.deleteOne();

    res.json({ message: 'Game removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
