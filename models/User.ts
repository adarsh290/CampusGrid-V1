import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IGame } from './Game.js'; // Assuming Game.js exports an IGame interface

// Interface for User methods
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for the User document
export interface IUser extends Document, IUserMethods {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  library: mongoose.Types.ObjectId[] | IGame[];
  walletBalance: number;
  wallet: number; // This seems redundant with walletBalance, but keeping it per original schema
  createdAt: Date;
  updatedAt: Date;
}

// Create a new Model type that knows about IUserMethods
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  library: [{
    type: Schema.Types.ObjectId,
    ref: 'Game',
  }],
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative'],
  },
  wallet: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative'],
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
