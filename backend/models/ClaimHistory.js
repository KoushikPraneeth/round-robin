const mongoose = require('mongoose');

const ClaimHistorySchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  couponCode: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  sessionData: {
    isNewSession: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for IP-based queries
ClaimHistorySchema.index({ ipAddress: 1, createdAt: -1 });

// Index for coupon-based queries
ClaimHistorySchema.index({ couponId: 1, createdAt: -1 });

module.exports = mongoose.model('ClaimHistory', ClaimHistorySchema);
