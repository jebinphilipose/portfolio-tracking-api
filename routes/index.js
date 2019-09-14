const express = require('express');
const tradeRoutes = require('./trade');
const portfolioRoutes = require('./portfolio');

const router = express.Router();

// Ready call for health check
router.get('/ready', (req, res) => res.send('API is up and running!'));

// Register portfolio routes
router.use('/', portfolioRoutes);

// Register trade routes
router.use('/trade', tradeRoutes);

module.exports = router;
