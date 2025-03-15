const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  discount: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for active coupon queries
CouponSchema.index({ isActive: 1 });

// Index for code lookups
CouponSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Coupon', CouponSchema);
