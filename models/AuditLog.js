import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  gamePurchased: {
    type: String,
    required: false, // Only for PURCHASE
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
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

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

