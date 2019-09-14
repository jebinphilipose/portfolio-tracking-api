const express = require('express');
const validate = require('express-validation');
const validation = require('../validations/trade');
const controller = require('../controllers/trade');

const router = express.Router();

// Place a trade
router.post('/', validate(validation.addTrade), controller.addTrade);

// Remove a trade
router.delete('/:id', validate(validation.removeTrade), controller.removeTrade);

// Update a trade
router.put('/:id', validate(validation.updateTrade), controller.updateTrade);

module.exports = router;
