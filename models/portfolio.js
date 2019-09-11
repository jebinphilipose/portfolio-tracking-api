const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  tickerSymbol: {
    type: String,
    minlength: 1,
    required: true,
    uppercase: true,
    unique: true,
    trim: true,
  },
  quantity: {
    type: Number,
    min: 0,
    required: true,
  },
  avgBuyPrice: {
    type: Number,
    min: 0,
    required: true,
  },
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
