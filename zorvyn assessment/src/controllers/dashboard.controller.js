import Record from '../models/record.model.js';
import catchAsync from '../utils/catchAsync.js';

export const getDashboardSummary = catchAsync(async (req, res, next) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  //Total Income & Total Expenses 
  const totals = await Record.aggregate([
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  totals.forEach((item) => {
    if (item._id === 'Income') totalIncome = item.totalAmount;
    if (item._id === 'Expense') totalExpenses = item.totalAmount;
  });

  const netBalance = totalIncome - totalExpenses;

  //Category-wise Totals for current month
  const categoryTotals = await Record.aggregate([
    {
      $match: {
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1
      }
    }
  ]);

  //Recent Activity 
  const recentActivity = await Record.find()
    .sort({ date: -1, createdAt: -1 })
    .limit(5)
    .populate('user', 'name');

  //Monthly trend 
  const startOfSixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

  const monthlyTrend = await Record.aggregate([
    {
      $match: {
        date: { $gte: startOfSixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          year: { $year: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totals: {
        totalIncome,
        totalExpenses,
        netBalance,
      },
      currentMonthCategoryTotals: categoryTotals,
      recentActivity,
      monthlyTrend
    }
  });
});
