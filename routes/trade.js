const express = require('express');
const validate = require('express-validation');
const validation = require('../validations/trade');
const controller = require('../controllers/trade');

const router = express.Router();

// Place a trade
router.post('/', validate(validation.addTrade), controller.addTrade);

module.exports = router;