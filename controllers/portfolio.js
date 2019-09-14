const Trade = require('../models/trade');
const Portfolio = require('../models/portfolio');

module.exports = {
  getPortfolio: async (req, res) => {
    let securities = await Portfolio.find({ quantity: { $ne: 0 } }).select('tickerSymbol -_id');
    securities = securities.map((doc) => doc.tickerSymbol);
    const portfolio = await Promise.all(securities.map(async (tickerSymbol) => {
      const trades = await Trade.find({ tickerSymbol }).select('-tickerSymbol -__v');
      return {
        [tickerSymbol]: {
          trades,
        },
      };
    }));
    return res.status(200).json(portfolio);
  },
  getHoldings: async (req, res) => {
    const holdings = await Portfolio.find({ quantity: { $ne: 0 } }).select('-_id -__v');
    return res.status(200).json(holdings);
  },
};
