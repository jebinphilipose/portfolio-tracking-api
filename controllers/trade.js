const Trade = require('../models/trade');
const Portfolio = require('../models/portfolio');
const requestError = require('../loaders/requestError');

const createTrade = async (tickerSymbol, action, quantity, price) => {
  let trade = new Trade({
    tickerSymbol,
    action,
    quantity,
    price,
  });
  trade = await trade.save();
  return trade;
};

const createPortfolio = async (tickerSymbol, quantity, avgBuyPrice) => {
  let portfolio = new Portfolio({
    tickerSymbol,
    quantity,
    avgBuyPrice,
  });
  portfolio = await portfolio.save();
  return portfolio;
};

const buySecurity = async (tickerSymbol, action, quantity, price) => {
  // Save trade
  const trade = await createTrade(tickerSymbol, action, quantity, price);
  // Update portfolio accordingly
  let portfolio = await Portfolio.findOne({ tickerSymbol });
  portfolio.avgBuyPrice = (portfolio.avgBuyPrice * portfolio.quantity + price * quantity) / (portfolio.quantity + quantity);
  portfolio.quantity += quantity;
  portfolio = await portfolio.save();
  return trade;
};

const sellSecurity = async (tickerSymbol, action, quantity) => {
  // Save trade
  const trade = await createTrade(tickerSymbol, action, quantity);
  // Update portfolio accordingly
  let portfolio = await Portfolio.findOne({ tickerSymbol });
  portfolio.quantity -= quantity;
  portfolio = await portfolio.save();
  return trade;
};

const removeTradeFromPortfolio = async (trade, portfolio) => {
  // Update portfolio accordingly
  if (trade.action === 'BUY') {
    portfolio.avgBuyPrice = ((portfolio.avgBuyPrice * portfolio.quantity - trade.price * trade.quantity) / (portfolio.quantity - trade.quantity)) || 0;
    portfolio.quantity -= trade.quantity;
    portfolio = await portfolio.save();
  } else {
    portfolio.quantity += trade.quantity;
    portfolio = await portfolio.save();
  }
  // Remove trade
  trade = await Trade.findByIdAndRemove(trade.id);
  return trade;
};

module.exports = {
  addTrade: async (req, res) => {
    const {
      tickerSymbol, action, quantity, price,
    } = req.body;
    // Check if a security exists in the portfolio for the ticker symbol
    const portfolio = await Portfolio.findOne({ tickerSymbol });
    if (portfolio) {
      if (action === 'BUY') {
        const trade = await buySecurity(tickerSymbol, action, quantity, price);
        return res.status(201).json(trade);
      } if (portfolio.quantity - quantity >= 0) {
        const trade = await sellSecurity(tickerSymbol, action, quantity);
        return res.status(201).json(trade);
      }
      return res.status(400).json(requestError(400, 'Insufficient quantity of shares in portfolio'));
    }
    // Add a security to the portfolio
    await createPortfolio(tickerSymbol, 0, 0);
    if (action === 'BUY') {
      const trade = await buySecurity(tickerSymbol, action, quantity, price);
      return res.status(201).json(trade);
    }
    return res.status(400).json(requestError(400, 'Insufficient quantity of shares in portfolio'));
  },
  removeTrade: async (req, res) => {
    let trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(400).json(requestError(400, 'Trade with given id not found.'));
    const portfolio = await Portfolio.findOne({ tickerSymbol: trade.tickerSymbol });
    if (trade.action === 'BUY' && portfolio.quantity - trade.quantity < 0) return res.status(400).json(requestError(400, 'Sorry, cannot remove this trade! Insufficient quantity of shares in portfolio.'));
    trade = await removeTradeFromPortfolio(trade, portfolio);
    return res.status(200).json(trade);
  },
};
