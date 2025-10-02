const express = require('express');
const router = express.Router();
const { getStock } = require('../controllers/stockController');

// GET /api/stocks/:symbol
router.get('/:symbol', getStock);

module.exports = router;