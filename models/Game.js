import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Game price is required'],
    min: [0, 'Price cannot be negative'],
  },
  coverImage: {
    type: String,
    trim: true,
  },
  genre: {
    type: String,
    required: [true, 'Game genre is required'],
    trim: true,
  },
  localFilePath: {
    type: String,
    required: [true, 'Local file path is required'],
    select: false, // CRITICAL: Never send this to frontend by default
  },
}, {
  timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);

export default Game;



