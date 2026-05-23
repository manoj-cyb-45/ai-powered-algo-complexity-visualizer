const Analysis = require('../models/Analysis');

// @desc    Get analysis history
// @route   GET /api/history
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-code'),
      Analysis.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complexity distribution stats
// @route   GET /api/history/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await Analysis.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$result.timeComplexity',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalAnalyses = await Analysis.countDocuments({ userId: req.user._id });

    res.json({
      stats,
      totalAnalyses,
      recentActivity: await Analysis.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title result.timeComplexity result.spaceComplexity language createdAt')
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getStats };
