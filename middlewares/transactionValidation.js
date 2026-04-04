//middleware to check if the user is the owner of the transaction 
import Transaction from "../models/TransactionModel.js";

export const isTransactionOwner = async (req, res, next) => {
  try {
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }
    // Admins can modify any transaction, analysts can only modify their own transactions
    if(req.user.role === "admin"){
      return next();
    }
    //so that another analyst cannot modify a transaction created by someone else
    if (transaction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to modify this transaction"
      });
    }

    req.transaction = transaction;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};