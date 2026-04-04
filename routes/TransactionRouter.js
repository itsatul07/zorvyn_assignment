import express from "express";
import {createTransaction,getTransactions,updateTransaction,deleteTransaction,getTransactionsByUser,getTransactionById
} from "../controllers/TransactionController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import { isTransactionOwner } from "../middlewares/transactionValidation.js";

const TransactionRouter = express.Router();

//admin and analyst can create transactions, but only for themselves 
TransactionRouter.route("/")
  .post(isAuthenticated, authorizeRoles("analyst", "admin"), createTransaction)
  .get(isAuthenticated,authorizeRoles("analyst", "admin"), getTransactions);

 //transaction owner can update or delete their own transactions  and admin can update or delete any transaction
TransactionRouter.route("/:id")
  .get(isAuthenticated, authorizeRoles("analyst", "admin"), getTransactionById)
  .put(isAuthenticated, authorizeRoles("analyst", "admin"), isTransactionOwner, updateTransaction)
  .delete(isAuthenticated, authorizeRoles("analyst", "admin"), isTransactionOwner, deleteTransaction);

//to get the transactions of a specific user (admin can view all, analyst can view only their own)
//This is for the profile, the analyst can view all his transactions 
TransactionRouter.route("/user/:userId").get(isAuthenticated, authorizeRoles("analyst", "admin"), getTransactionsByUser);



export default TransactionRouter;
