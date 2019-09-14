const express = require('express');
const controller = require('../controllers/portfolio');

const router = express.Router();

// Fetch portfolio
router.get('/portfolio', controller.getPortfolio);

// Fetch holdings
router.get('/holdings', controller.getHoldings);

module.exports = router;
