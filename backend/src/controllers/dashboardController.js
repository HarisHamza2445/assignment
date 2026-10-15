const asyncHandler = require('../utils/asyncHandler');
const { getDashboardSummary } = require('../services/dashboardService');

const getDashboard = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary();
  res.json({ data: summary });
});

module.exports = { getDashboard };
