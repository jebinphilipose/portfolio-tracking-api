const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  tickerSymbol: {
    type: String,
    minlength: 1,
    required: true,
    uppercase: true,
    trim: true,
  },
  action: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true,
    uppercase: true,
    trim: true,
  },
  quantity: {
    type: Number,
    min: 1,
    required: true,
  },
  price: {
    type: Number,
    default: 100,
    min: 0,
  },
});

module.exports = mongoose.model('Trade', tradeSchema);
