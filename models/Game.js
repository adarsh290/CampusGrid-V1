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
  developer: {
    type: String,
    trim: true,
    default: '',
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
  screenshots: {
    type: [String],
    default: [],
  },
  genre: {
    type: String,
    required: [true, 'Game genre is required'],
    trim: true,
  },
  systemRequirements: {
    os: { type: String, default: '' },
    processor: { type: String, default: '' },
    memory: { type: String, default: '' },
    graphics: { type: String, default: '' },
    storage: { type: String, default: '' },
  },
  localFilePath: {
    type: String,
    required: false, // Optional - can be set later
    select: false, // CRITICAL: Never send this to frontend by default
  },
}, {
  timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);

export default Game;



