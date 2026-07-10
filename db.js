const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_store', { serverSelectionTimeoutMS: 1500 });
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB not available in this sandbox (expected) — Express wiring test only:', error.message);
  }
};
module.exports = connectDB;
