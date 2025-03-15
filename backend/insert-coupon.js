require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas to insert coupon');

    const coupons = [
      { code: 'SAVE05', description: 'Save 5% on your purchase', discount: '5%', isActive: true },
      { code: 'SAVE10', description: 'Save 10% on your purchase', discount: '10%', isActive: true },
      { code: 'SAVE15', description: 'Save 15% on your purchase', discount: '15%', isActive: true },
      { code: 'SAVE20', description: 'Save 20% on your purchase', discount: '20%', isActive: true },
      { code: 'SAVE25', description: 'Save 25% on your purchase', discount: '25%', isActive: true },
      { code: 'SAVE30', description: 'Save 30% on your purchase', discount: '30%', isActive: true },
      { code: 'SAVE35', description: 'Save 35% on your purchase', discount: '35%', isActive: true },
      { code: 'SAVE40', description: 'Save 40% on your purchase', discount: '40%', isActive: true },
      { code: 'SAVE45', description: 'Save 45% on your purchase', discount: '45%', isActive: true },
      { code: 'SAVE50', description: 'Save 50% on your purchase', discount: '50%', isActive: true },
      { code: 'SAVE55', description: 'Save 55% on your purchase', discount: '55%', isActive: true },
      { code: 'SAVE60', description: 'Save 60% on your purchase', discount: '60%', isActive: true },
      { code: 'SAVE65', description: 'Save 65% on your purchase', discount: '65%', isActive: true },
      { code: 'SAVE70', description: 'Save 70% on your purchase', discount: '70%', isActive: true },
      { code: 'SAVE75', description: 'Save 75% on your purchase', discount: '75%', isActive: true }
    ];

    try {
      const savedCoupons = await Coupon.insertMany(coupons);
      console.log('Coupons inserted:', savedCoupons);
    } catch (error) {
      console.error('Error inserting coupon:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
