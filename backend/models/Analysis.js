const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    default: 'javascript'
  },
  title: {
    type: String,
    default: 'Untitled Analysis'
  },
  result: {
    timeComplexity: { type: String, default: 'O(n)' },
    spaceComplexity: { type: String, default: 'O(1)' },
    explanation: { type: String },
    optimizationSuggestions: [{ type: String }],
    detectedPatterns: [{ type: String }],
    complexityScore: { type: Number, min: 1, max: 10 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
