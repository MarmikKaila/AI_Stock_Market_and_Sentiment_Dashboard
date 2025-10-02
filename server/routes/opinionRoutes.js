const express = require('express');
const router = express.Router();
const { getOpinion } = require('../controllers/opinionController');

// GET /api/opinion/:symbol
router.get('/:symbol', getOpinion);

module.exports = router;