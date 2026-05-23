const { validationResult } = require('express-validator');
const Analysis = require('../models/Analysis');
const { analyzeComplexityWithAI } = require('../services/aiService');

// @desc    Analyze code complexity
// @route   POST /api/analysis/analyze
const analyzeCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { code, language = 'javascript', title = 'Untitled Analysis' } = req.body;

    if (!code || code.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide valid code to analyze.' });
    }

    // Get AI analysis
    const result = await analyzeComplexityWithAI(code, language);

    // Save to DB
    const analysis = await Analysis.create({
      userId: req.user._id,
      code,
      language,
      title,
      result
    });

    res.status(201).json({
      message: 'Analysis complete!',
      analysis: {
        id: analysis._id,
        code: analysis.code,
        language: analysis.language,
        title: analysis.title,
        result: analysis.result,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single analysis
// @route   GET /api/analysis/:id
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete analysis
// @route   DELETE /api/analysis/:id
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    res.json({ message: 'Analysis deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeCode, getAnalysis, deleteAnalysis };
