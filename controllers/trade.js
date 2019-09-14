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

const buySecurity = async (tickerSymbol, quantity, price) => {
  let portfolio = await Portfolio.findOne({ tickerSymbol });
  portfolio.avgBuyPrice = (portfolio.avgBuyPrice * portfolio.quantity + price * quantity) / (portfolio.quantity + quantity);
  portfolio.quantity += quantity;
  portfolio = await portfolio.save();
  return portfolio;
};

const sellSecurity = async (tickerSymbol, quantity) => {
  let portfolio = await Portfolio.findOne({ tickerSymbol });
  portfolio.quantity -= quantity;
  portfolio = await portfolio.save();
  return portfolio;
};

const addTradeToPortfolio = async (trade) => {
  if (trade.action === 'BUY') {
    const portfolio = await buySecurity(trade.tickerSymbol, trade.quantity, trade.price);
    return portfolio;
  }
  const portfolio = await sellSecurity(trade.tickerSymbol, trade.quantity);
  return portfolio;
};

const removeTradeFromPortfolio = async (trade, portfolio) => {
  if (trade.action === 'BUY') {
    portfolio.avgBuyPrice = ((portfolio.avgBuyPrice * portfolio.quantity - trade.price * trade.quantity) / (portfolio.quantity - trade.quantity)) || 0;
    portfolio.quantity -= trade.quantity;
    portfolio = await portfolio.save();
  } else {
    portfolio.quantity += trade.quantity;
    portfolio = await portfolio.save();
  }
  return portfolio;
};

module.exports = {
  addTrade: async (req, res) => {
    const {
      tickerSymbol, action, quantity, price,
    } = req.body;
    // Check if a security exists in the portfolio for the ticker symbol
    let portfolio = await Portfolio.findOne({ tickerSymbol });
    if (!portfolio) portfolio = await createPortfolio(tickerSymbol, 0, 0);
    if (portfolio) {
      if (action === 'BUY') {
        // Update portfolio for buying security
        portfolio = await buySecurity(tickerSymbol, quantity, price);
        // Create trade
        const trade = await createTrade(tickerSymbol, action, quantity, price);
        return res.status(201).json(trade);
      } if (portfolio.quantity - quantity >= 0) {
        // Update portfolio for selling security
        portfolio = await sellSecurity(tickerSymbol, quantity);
        // Create trade
        const trade = await createTrade(tickerSymbol, action, quantity);
        return res.status(201).json(trade);
      }
      return res.status(400).json(requestError(400, 'Insufficient quantity of shares in portfolio.'));
    }
  },
  removeTrade: async (req, res) => {
    let trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(400).json(requestError(400, 'Trade with given id not found.'));
    let portfolio = await Portfolio.findOne({ tickerSymbol: trade.tickerSymbol });
    if (trade.action === 'BUY' && portfolio.quantity - trade.quantity < 0) return res.status(400).json(requestError(400, 'Sorry, cannot remove this trade! Insufficient quantity of shares in portfolio.'));
    // Update portfolio for removing trade
    portfolio = await removeTradeFromPortfolio(trade, portfolio);
    // Remove trade
    trade = await Trade.findByIdAndRemove(trade.id);
    return res.status(200).json(trade);
  },
  updateTrade: async (req, res) => {
    const {
      tickerSymbol: newTickerSymbol,
      action: newAction,
      quantity: newQuantity,
      price: newPrice,
    } = req.body;
    let trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(400).json(requestError(400, 'Trade with given id not found.'));
    if (trade.tickerSymbol !== newTickerSymbol || (trade.tickerSymbol === newTickerSymbol && trade.action !== newAction)) {
      let portfolio = await Portfolio.findOne({ tickerSymbol: trade.tickerSymbol });
      if (trade.action === 'BUY' && portfolio.quantity - trade.quantity < 0) return res.status(400).json(requestError(400, 'Sorry, cannot update this trade! Insufficient quantity of shares in portfolio.'));
      // Update portfolio for removing trade
      portfolio = await removeTradeFromPortfolio(trade, portfolio);
      // Create portfolio for security if missing
      portfolio = await Portfolio.findOne({ tickerSymbol: newTickerSymbol });
      if (!portfolio) portfolio = await createPortfolio(newTickerSymbol, 0, 0);
      if (newAction === 'BUY') {
        // Update portfolio for buying security
        portfolio = await buySecurity(newTickerSymbol, newQuantity, newPrice);
        // Update trade details
        trade.tickerSymbol = newTickerSymbol;
        trade.action = newAction;
        trade.quantity = newQuantity;
        trade.price = newPrice;
        trade = await trade.save();
        return res.status(200).json(trade);
      }

      if (portfolio.quantity - newQuantity >= 0) {
        // Update portfolio for selling security
        portfolio = await sellSecurity(newTickerSymbol, newQuantity);
        // Update trade details
        trade.tickerSymbol = newTickerSymbol;
        trade.action = newAction;
        trade.quantity = newQuantity;
        trade.price = 100;
        trade = await trade.save();
        return res.status(200).json(trade);
      }

      // Restore portfolio for old trade details
      portfolio = await addTradeToPortfolio(trade);
      return res.status(400).json(requestError(400, 'Sorry, cannot update this trade! Insufficient quantity of shares in portfolio.'));
    }

    const diff = newQuantity - trade.quantity;
    if (diff === 0 && newPrice === trade.price) return res.status(400).json(requestError(400, 'No change in trade details.'));
    let portfolio = await Portfolio.findOne({ tickerSymbol: trade.tickerSymbol });
    if (newAction === 'BUY') {
      if (diff < 0 && portfolio.quantity - diff < 0) return res.status(400).json(requestError(400, 'Sorry, cannot update this trade! Insufficient quantity of shares in portfolio.'));
      // Reset avgBuyPrice for old trade price
      portfolio.avgBuyPrice = ((portfolio.avgBuyPrice * portfolio.quantity - trade.price * trade.quantity) / (portfolio.quantity - trade.quantity)) || 0;
      portfolio.avgBuyPrice = (portfolio.avgBuyPrice * (portfolio.quantity - trade.quantity) + newPrice * newQuantity) / (portfolio.quantity - trade.quantity + newQuantity);
      if (diff === 0) {
        portfolio = await portfolio.save();
      } else if (diff > 0) {
        // Buy diff
        portfolio.quantity += diff;
        portfolio = await portfolio.save();
      } else {
        // Sell diff
        portfolio.quantity -= Math.abs(diff);
        portfolio = await portfolio.save();
      }
    } else {
      if (diff > 0 && portfolio.quantity - diff < 0) return res.status(400).json(requestError(400, 'Sorry, cannot update this trade! Insufficient quantity of shares in portfolio.'));
      if (diff > 0) {
        // Sell diff
        portfolio.quantity -= diff;
        portfolio = await portfolio.save();
      } else {
        // Buy diff
        portfolio.quantity += Math.abs(diff);
        portfolio = await portfolio.save();
      }
    }
    // Update trade details
    trade.quantity = newQuantity;
    trade.price = newPrice;
    trade = await trade.save();
    return res.status(200).json(trade);
  },
};
