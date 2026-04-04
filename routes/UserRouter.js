import express from "express";
import {loginUser,logoutUser,registerUser,} from "../controllers/UserController.js";

import {currentUserProfile,getAnotherUserProfile,} from "../controllers/ProfileController.js";
import {getAllUsers} from "../controllers/AdminController.js";
import { getTransactionsByUser } from "../controllers/TransactionController.js";

import {isAuthenticated,authorizeRoles,} from "../middlewares/auth.js";

const UserRouter = express.Router();


// signup & login (no auth needed)
UserRouter.route("/signup").post(registerUser);
UserRouter.route("/login").post(loginUser);



// logout (only logged-in users)
UserRouter.route("/logout").post(isAuthenticated, logoutUser);


//profile routes
// current user profile (any logged-in user)
UserRouter.route("/me").get(isAuthenticated, currentUserProfile);


//analyst and admin can view all users 
UserRouter.route("/").get(isAuthenticated, authorizeRoles("analyst","admin"), getAllUsers);


// view another user's profile
UserRouter.route("/:id").get(isAuthenticated, authorizeRoles("analyst", "admin"), getAnotherUserProfile);



export default UserRouter;