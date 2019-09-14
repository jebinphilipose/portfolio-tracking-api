const Portfolio = require('../models/portfolio');

module.exports = {
  getHoldings: async (req, res) => {
    const holdings = await Portfolio.find({ quantity: { $ne: 0 } }).select('-_id -__v');
    return res.status(200).json(holdings);
  },
};
