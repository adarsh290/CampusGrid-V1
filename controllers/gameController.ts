import { Request, Response } from 'express';
import Game, { IGame } from '../models/Game.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getGames = async (req: Request, res: Response) => {
  try {
    const games: IGame[] = await Game.find().select('-localFilePath');
    res.json(games);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search games by title or developer
// @route   GET /api/games/search
// @access  Public
export const searchGames = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.json([]);
    }

    const searchTerm = q.trim();
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(`(^|\\b)${escapedTerm}`, 'i');

    const games = await Game.find({
      $or: [
        { title: { $regex: searchRegex } },
        { developer: { $regex: searchRegex } },
      ],
    })
      .select('title coverImage price developer')
      .limit(20)
      .lean();

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

    results.sort((a, b) => {
      const aStartsExact = a.titleLower.startsWith(a.searchTermLower);
      const bStartsExact = b.titleLower.startsWith(b.searchTermLower);

      if (aStartsExact && !bStartsExact) return -1;
      if (!aStartsExact && bStartsExact) return 1;
      
      return a.titleLower.localeCompare(b.titleLower);
    });

    const finalResults = results.slice(0, 10).map(({ titleLower, developerLower, searchTermLower, ...rest }) => rest);

    res.json(finalResults);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
export const getGame = async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id).select('-localFilePath');
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get download token (DRM)
// @route   GET /api/games/:id/token
// @access  Private
export const getDownloadToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const gameId = req.params.id;
    const userId = req.user._id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownsGame = user.library.some(
      (libGameId) => libGameId.toString() === gameId
    );

    if (!ownsGame) {
      return res.status(403).json({ message: 'You do not own this game' });
    }

    const token = jwt.sign(
      { gameId, userId },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '5m' }
    );

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create game (Admin only)
// @route   POST /api/games
// @access  Private/Admin
export const createGame = async (req: Request, res: Response) => {
  try {
    const { title, description, developer, price, coverImage, genre, localFilePath, screenshots, systemRequirements } = req.body;

    if (!title || !description || price === undefined || !genre || !localFilePath) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const gameData: Partial<IGame> = {
      title,
      description,
      developer: developer || '',
      price,
      coverImage,
      genre,
      localFilePath,
    };

    if (screenshots && Array.isArray(screenshots) && screenshots.length > 0) {
      gameData.screenshots = screenshots;
    }

    if (systemRequirements && typeof systemRequirements === 'object') {
      const hasRequirements = Object.values(systemRequirements).some(val => val && String(val).trim() !== '');
      if (hasRequirements) {
        gameData.systemRequirements = systemRequirements;
      }
    }

    const game = await Game.create(gameData);

    const gameResponse = game.toObject();
    delete (gameResponse as any).localFilePath;

    res.status(201).json(gameResponse);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update game (Admin only)
// @route   PUT /api/games/:id
// @access  Private/Admin
export const updateGame = async (req: Request, res: Response) => { 
  try {
    const game = await Game.findById(req.params.id).select('+localFilePath');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const { title, description, developer, price, coverImage, genre, localFilePath, screenshots, systemRequirements } = req.body;

    if (title !== undefined) game.title = title;
    if (description !== undefined) game.description = description;
    if (developer !== undefined) game.developer = developer;
    if (price !== undefined) game.price = price;
    if (coverImage !== undefined) game.coverImage = coverImage;
    if (genre !== undefined) game.genre = genre;
    if (localFilePath !== undefined) game.localFilePath = localFilePath;
    
    if (screenshots !== undefined) {
      game.screenshots = (Array.isArray(screenshots) && screenshots.length > 0) ? screenshots : [];
    }
    
    if (systemRequirements !== undefined && typeof systemRequirements === 'object') {
        game.systemRequirements = systemRequirements;
    }

    await game.save();

    const gameResponse = game.toObject();
    delete (gameResponse as any).localFilePath;

    res.json(gameResponse);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete game (Admin only)
// @route   DELETE /api/games/:id
// @access  Private/Admin
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await game.deleteOne();

    res.json({ message: 'Game removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
