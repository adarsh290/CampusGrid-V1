import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User.js';
import { IGame } from './Game.js';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | IUser;
  game: mongoose.Types.ObjectId | IGame;
  price: number;
  username: string;
  gameTitle: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  username: {
    type: String,
    required: true,
  },
  gameTitle: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
