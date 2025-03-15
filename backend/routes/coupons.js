const express = require('express');
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const ClaimHistory = require('../models/ClaimHistory');

// Validate MongoDB ObjectId
const isValidObjectId = mongoose.Types.ObjectId.isValid;
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const cookieTracker = require('../middleware/cookieTracker');
const router = express.Router();

// @route   GET api/coupons
// @desc    Get all coupons (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/coupons/active
// @desc    Get all active coupons (public)
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/coupons
// @desc    Create a coupon
// @access  Private
router.post('/', auth, async (req, res) => {
  const { code, description, discount, isActive = true } = req.body;

  if (!code || !description || !discount) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if coupon already exists
    let existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ 
        message: `Coupon with code ${code.toUpperCase()} already exists` 
      });
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discount,
      isActive
    });

    const savedCoupon = await coupon.save();
    
    if (!savedCoupon) {
      return res.status(500).json({ message: 'Failed to save coupon' });
    }

    res.status(201).json(savedCoupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/coupons/:id
// @desc    Update a coupon
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { code, description, discount, isActive } = req.body;

  try {
    let coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Update coupon
    coupon.code = code.toUpperCase();
    coupon.description = description;
    coupon.discount = discount;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/coupons/:id/toggle
// @desc    Toggle coupon active status
// @access  Private
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid coupon ID format' });
    }
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json(coupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/coupons/claim
// @desc    Claim a coupon (round-robin distribution)
// @access  Public
router.post('/claim', [rateLimiter, cookieTracker], async (req, res) => {
  try {
    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    let coupon;
    
    try {
      await session.withTransaction(async () => {
        // Get active coupons
        const activeCoupons = await Coupon.find({ isActive: true });
        
        if (activeCoupons.length === 0) {
          throw new Error('No active coupons available at the moment.');
        }

        // Get the last claimed coupon for round-robin
        const lastClaimHistory = await ClaimHistory.findOne()
          .sort({ createdAt: -1 })
          .session(session);
        
        let currentIndex = 0;
        
        if (lastClaimHistory) {
          // Find index of last claimed coupon
          const lastCouponIndex = activeCoupons.findIndex(
            coupon => coupon._id.toString() === lastClaimHistory.couponId.toString()
          );
          
          // Move to next coupon (round-robin)
          currentIndex = (lastCouponIndex + 1) % activeCoupons.length;
        }

        // Get the next coupon
        coupon = activeCoupons[currentIndex];
        
        // Create claim history record with additional session info
        const claimHistory = new ClaimHistory({
          couponId: coupon._id,
          couponCode: coupon.code,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || 'Unknown',
          sessionData: {
            isNewSession: req.claimSession.isNew,
            timestamp: req.claimSession.timestamp
          }
        });
        
        await claimHistory.save({ session });
        
        // Rate limiting is now handled by middleware
      });

      res.json({
        success: true,
        coupon,
        message: 'Coupon claimed successfully!'
      });
    } catch (err) {
      if (err.message === 'No active coupons available at the moment.') {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/coupons/coupons
// @desc    Get all coupons
// @access  Private
router.get('/coupons', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// @route   GET api/coupons/history
// @desc    Get all claim history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await ClaimHistory.find();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claim history' });
  }
});

module.exports = router;
