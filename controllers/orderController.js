import User from '../models/User.js';
import Game from '../models/Game.js';

// @desc    Purchase a game
// @route   POST /api/orders/buy
// @access  Private
export const purchaseGame = async (req, res) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.id;

    if (!gameId) {
      return res.status(400).json({ message: 'Game ID is required' });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Get user with library and wallet balance
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already owns the game
    const alreadyOwns = user.library.some(
      (id) => id.toString() === gameId
    );

    if (alreadyOwns) {
      return res.status(400).json({ message: 'You already own this game' });
    }

    // Check if user has sufficient funds
    if (user.walletBalance < game.price) {
      return res.status(400).json({ message: 'Insufficient Funds' });
    }

    // Deduct price from wallet and add game to library
    user.walletBalance -= game.price;
    user.library.push(gameId);
    await user.save();

    // Populate library to return full game details
    await user.populate('library');

    res.status(200).json({
      message: 'Game purchased successfully',
      walletBalance: user.walletBalance,
      library: user.library,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's library
// @route   GET /api/orders/library
// @access  Private
export const getLibrary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('library');
    
    res.json({
      library: user.library.map(game => {
        const gameObj = game.toObject();
        delete gameObj.localFilePath; // Ensure localFilePath is never sent
        return gameObj;
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



