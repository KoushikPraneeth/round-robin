
const express = require('express');
const ClaimHistory = require('../models/ClaimHistory');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/history
// @desc    Get claim history (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const history = await ClaimHistory.find()
      .sort({ createdAt: -1 })
      .populate('couponId', 'code');
    
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
