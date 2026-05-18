const express = require('express');
const { body } = require('express-validator');
const { analyzeCode, getAnalysis, deleteAnalysis } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/analyze', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').optional().isString(),
  body('title').optional().isString().isLength({ max: 100 })
], analyzeCode);

router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
