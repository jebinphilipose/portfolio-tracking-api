const express = require('express');
const tradeRoutes = require('./trade');

const router = express.Router();

// Ready call for health check
router.get('/ready', (req, res) => res.send('API is up and running!'));

// Register trade routes
router.use('/trade', tradeRoutes);

module.exports = router;
