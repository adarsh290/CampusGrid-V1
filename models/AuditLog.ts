import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User.js';
import { IGame } from './Game.js';

export interface IAuditLog extends Document {
  type: 'PURCHASE' | 'TOP_UP';
  adminName?: string;
  targetUser: string;
  targetUserId?: mongoose.Types.ObjectId | IUser;
  gamePurchased?: string;
  gameId?: mongoose.Types.ObjectId | IGame;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  type: {
    type: String,
    enum: ['PURCHASE', 'TOP_UP'],
    required: true,
  },
  adminName: {
    type: String,
    required: false, // Only for TOP_UP
  },
  targetUser: {
    type: String,
    required: true,
  },
  targetUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  gamePurchased: {
    type: String,
    required: false, // Only for PURCHASE
  },
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: false,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
}, {
  timestamps: true,
});

const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
