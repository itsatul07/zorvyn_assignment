import Transaction from "../models/TransactionModel.js";

//crud operations for transactions
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
      createdBy: req.user.id,
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

export const getTransactionById = async (req, res) => {
  try {
    const id = req.params.id;
    const transaction = await Transaction.findById(id).populate(
      "createdBy",
      "name email"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    } else {
      res.json(transaction);
    }     
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const id = req.params.id;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Role check
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

    //  Role check
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

//get all transactions of a specific user(applicable for admin,analyst) of any user by passing user id as a parameter in the url
export const getTransactionsByUser = async (req, res) => {
    const  userId = req.params.userId;
    const transactions = await Transaction.find({ createdBy: userId })
    .sort({ createdAt: -1 });
    res.json(transactions);
};

//get all transactions with optional filters and sorting based on query parameters and paginated results

export const getTransactions = async (req, res) => {
  try {
    const { type, category, sortBy, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    let query = Transaction.find(filter)
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(Number(limit));

    // Sorting
    if (sortBy === "date") {
      query = query.sort({ date: -1 });
    } else if (sortBy === "amount") {
      query = query.sort({ amount: -1 });
    }

    const transactions = await query;

    const total = await Transaction.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};