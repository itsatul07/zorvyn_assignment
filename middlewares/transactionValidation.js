//middleware to check if the user is the owner of the transaction 
import Transaction from "../models/TransactionModel.js";

export const isTransactionOwner = async (req, res, next) => {
  try {
    //console.log("User from token in isTransactionOwner:", req.user); // Debugging line
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);
    //console.log("Transaction found:", transaction); // Debugging line
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    //so that another analyst cannot modify a transaction created by someone else
    if (transaction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to modify this transaction"
      });
    }

    // optional: attach transaction for reuse
    req.transaction = transaction;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};