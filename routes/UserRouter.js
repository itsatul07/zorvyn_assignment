import express from "express";
import {loginUser,logoutUser,registerUser,} from "../controllers/UserController.js";

import {currentUserProfile,getAnotherUserProfile,} from "../controllers/ProfileController.js";

import {isAuthenticated,authorizeRoles,} from "../middlewares/auth.js";

const UserRouter = express.Router();


// signup & login (no auth needed)
UserRouter.route("/signup").post(registerUser);
UserRouter.route("/login").post(loginUser);

// ---------------- PROTECTED ROUTES ----------------

// logout (only logged-in users)
UserRouter.route("/logout").post(isAuthenticated, logoutUser);

// ---------------- PROFILE ROUTES ----------------

// current user profile (any logged-in user)
UserRouter.route("/me").get(isAuthenticated, currentUserProfile);

// view another user's profile
UserRouter.route("/:id").get(isAuthenticated, authorizeRoles("admin","analyst"), getAnotherUserProfile);


export default UserRouter;