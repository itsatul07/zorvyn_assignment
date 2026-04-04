import express from "express";
import {getAllUsers,deleteUser,changeUserRole} from "../controllers/AdminController.js";
import {isAuthenticated,authorizeRoles} from "../middlewares/auth.js";
import {registerUser} from "../controllers/UserController.js";
import { getTransactionsByUser } from "../controllers/TransactionController.js";

const AdminRouter = express.Router();



//admin can view all transactions of any user and also delete any user
AdminRouter.route("/users/:id")
.delete(isAuthenticated, authorizeRoles("admin"), deleteUser)

//here admin can create a user and also change the role of an existing user
AdminRouter.route("/user")
.post(isAuthenticated, authorizeRoles("admin"),registerUser)
.put(isAuthenticated, authorizeRoles("admin"), changeUserRole);

export default AdminRouter;