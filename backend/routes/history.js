const express = require('express');
const { getHistory, getStats } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getHistory);
router.get('/stats', getStats);

module.exports = router;
