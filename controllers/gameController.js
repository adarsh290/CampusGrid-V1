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

// @desc    Search games by title or developer
// @route   GET /api/games/search
// @access  Public
export const searchGames = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchTerm = q.trim();
    
    // Escape special regex characters in search term
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex with word boundary - matches at start of string or at word boundary
    // ^ matches start of string, \b matches word boundaries
    // This ensures matches only at the beginning of words or at the start
    const searchRegex = new RegExp(`(^|\\b)${escapedTerm}`, 'i');

    // Search by title or developer with word boundary
    const games = await Game.find({
      $or: [
        { title: { $regex: searchRegex } },
        { developer: { $regex: searchRegex } },
      ],
    })
      .select('title coverImage price developer')
      .limit(20) // Get more results for sorting
      .lean();

    // Add slug and format response
    const results = games.map(game => ({
      _id: game._id,
      name: game.title,
      slug: game.title.toLowerCase().replace(/ /g, '-'),
      coverImage: game.coverImage,
      price: game.price,
      developer: game.developer || '',
      titleLower: game.title.toLowerCase(),
      developerLower: (game.developer || '').toLowerCase(),
      searchTermLower: searchTerm.toLowerCase(),
    }));

    // Sort results: exact matches first, then word-start matches
    results.sort((a, b) => {
      const aTitle = a.titleLower;
      const bTitle = b.titleLower;
      const searchLower = a.searchTermLower;

      // Check if title starts exactly with search term
      const aStartsExact = aTitle.startsWith(searchLower);
      const bStartsExact = bTitle.startsWith(searchLower);

      if (aStartsExact && !bStartsExact) return -1;
      if (!aStartsExact && bStartsExact) return 1;
      
      // If both or neither start exact, sort alphabetically
      return aTitle.localeCompare(bTitle);
    });

    // Remove temporary sorting fields and limit to 10
    const finalResults = results.slice(0, 10).map(({ titleLower, developerLower, searchTermLower, ...rest }) => rest);

    res.json(finalResults);
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

// @desc    Download game (Nginx X-Accel-Redirect)
// @route   GET /api/games/download/:id
// @access  Private
export const downloadGame = async (req, res) => {
  try {
    // Find game WITH localFilePath selected (select: false by default)
    const game = await Game.findById(req.params.id).select('+localFilePath');

    if (!game) {
      console.error(`❌ Download Error: Game ID ${req.params.id} not found`);
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

    // 3. Tell Nginx to send the file
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

// @desc    Create game (Admin only)
// @route   POST /api/games
// @access  Private/Admin
export const createGame = async (req, res) => {
  try {
    const { title, description, developer, price, coverImage, genre, localFilePath, screenshots, systemRequirements } = req.body;

    if (!title || !description || price === undefined || !genre || !localFilePath) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Build game object with optional fields
    const gameData = {
      title,
      description,
      developer: developer || '',
      price,
      coverImage,
      genre,
      localFilePath,
    };

    // Only add screenshots if provided and not empty
    if (screenshots && Array.isArray(screenshots) && screenshots.length > 0) {
      gameData.screenshots = screenshots;
    }

    // Only add systemRequirements if provided and has at least one field
    if (systemRequirements && typeof systemRequirements === 'object') {
      const hasRequirements = Object.values(systemRequirements).some(val => val && val.trim() !== '');
      if (hasRequirements) {
        gameData.systemRequirements = systemRequirements;
      }
    }

    const game = await Game.create(gameData);

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
    // Find game WITH localFilePath selected (needed for updates)
    const game = await Game.findById(req.params.id).select('+localFilePath');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const { title, description, developer, price, coverImage, genre, localFilePath, screenshots, systemRequirements } = req.body;

    // Update fields if provided
    if (title !== undefined) game.title = title;
    if (description !== undefined) game.description = description;
    if (developer !== undefined) game.developer = developer;
    if (price !== undefined) game.price = price;
    if (coverImage !== undefined) game.coverImage = coverImage;
    if (genre !== undefined) game.genre = genre;
    if (localFilePath !== undefined) game.localFilePath = localFilePath;
    
    // Handle optional screenshots
    if (screenshots !== undefined) {
      if (screenshots === null || (Array.isArray(screenshots) && screenshots.length === 0)) {
        game.screenshots = [];
      } else if (Array.isArray(screenshots)) {
        game.screenshots = screenshots;
      }
    }
    
    // Handle optional systemRequirements
    if (systemRequirements !== undefined) {
      if (systemRequirements === null) {
        game.systemRequirements = {
          os: '',
          processor: '',
          memory: '',
          graphics: '',
          storage: '',
        };
      } else if (typeof systemRequirements === 'object') {
        // Only update if at least one field has a value, otherwise clear all
        const hasRequirements = Object.values(systemRequirements).some(val => val && val.trim() !== '');
        if (hasRequirements) {
          game.systemRequirements = systemRequirements;
        } else {
          game.systemRequirements = {
            os: '',
            processor: '',
            memory: '',
            graphics: '',
            storage: '',
          };
        }
      }
    }

    // Save the game (this will persist localFilePath to the database)
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
