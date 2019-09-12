const Joi = require('joi');

module.exports = {
  addTrade: {
    body: {
      tickerSymbol: Joi.string().min(1).uppercase().trim()
        .required(),
      action: Joi.string().uppercase().valid(['BUY', 'SELL']).trim()
        .required(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().min(0).default(100),
    },
  },
};
