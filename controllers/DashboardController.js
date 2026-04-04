import Transaction from "../models/TransactionModel.js";
import mongoose from "mongoose";


//controller for dashboard data - for admin and analyst, we will show their own transactions and for viewer, we will show overall transactions of all users
export const getAdminAnalystDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    //  Totals
    const totals = await Transaction.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    totals.forEach(t => {
      if (t._id === "income") income = t.total;
      if (t._id === "expense") expense = t.total;
    });

    //  Categories
    const categories = await Transaction.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    //  Recent
    const recentTransactions = await Transaction.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    //  Monthly
    const monthlyTrends = await Transaction.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    res.status(200).json({
      summary: {
        income,
        expense,
        balance: income - expense
      },
      categories,
      recentTransactions,
      monthlyTrends
    });

  } catch (error) {
    console.log("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

//viewer dashboard with overall income and expense, recent transactions and monthly trends of income and expense globally for all users
export const getViewerDashboardData = async (req, res) => {
  try {

    //Overall income & expense (GLOBAL)
    const totals = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    totals.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    //Recent Transactions (latest 5 globally)
    const recentTransactions = await Transaction.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    //  Monthly Trends (Income vs Expense)
    const monthlyTrends = await Transaction.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      summary: {
        income,
        expense,
        balance: income - expense
      },
      recentTransactions,
      monthlyTrends
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching viewer dashboard",
      error: error.message
    });
  }
}; 

// Main dashboard controller that routes to specific dashboard data based on user role
export const getDashboardData = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === "viewer") {
      return getViewerDashboardData(req, res);
    }

    // admin / analyst logic
    return getAdminAnalystDashboardData(req, res);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};