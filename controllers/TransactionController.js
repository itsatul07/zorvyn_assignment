import Transaction from "../models/TransactionModel.js";

export const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;

    // Basic validation
    if (!amount || !type || !category) {
      return res.status(400).json({
        message: "Amount, type and category are required",
      });
    }

    // Role check (only analyst/admin allowed)
    if (req.user.role !== "analyst" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to create transaction",
      });
    }
    const transaction = await Transaction.create({
      amount,
      type,
      category,
      date,
      note,
      createdBy: req.user.id, // 🔥 who created it
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("transaction id from params:", id); // Debugging line
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 🔐 Role check
    if (
      req.user.role !== "admin" &&
      transaction.createdBy.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to update this transaction",
      });
    }

    // Update fields
    const { amount, type, category, date, note } = req.body;

    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = date;
    if (note !== undefined) transaction.note = note;

    const updatedTransaction = await transaction.save();

    res.json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.log("Error in updateTransaction:", error); // Debugging line
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const id =  req.params.id;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 🔐 Role check
    if (
      req.user.role !== "admin" &&
      transaction.createdBy.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this transaction",
      });
    }

    await transaction.deleteOne();

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionsByUser = async (req, res) => {
    const { userId } = req.params;

    const transactions = await Transaction.find({ createdBy: userId })
    .sort({ createdAt: -1 });

    res.json(transactions);
};

export const getTransactions = async (req, res) => {
  try {
    const { type, category, sortBy } = req.query;

    let filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    let query = Transaction.find(filter).populate("createdBy", "name email");

    // Sorting
    if (sortBy === "date") {
      query = query.sort({ date: -1 });
    } else if (sortBy === "amount") {
      query = query.sort({ amount: -1 });
    }

    const transactions = await query;

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getCategoryStats = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyTrends = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyTrends = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: { $week: "$date" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};