require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');

    try {
      const coupons = await Coupon.find();
      console.log('All coupons:', coupons);
      
      const activeCoupons = await Coupon.find({ isActive: true });
      console.log('\nActive coupons:', activeCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
