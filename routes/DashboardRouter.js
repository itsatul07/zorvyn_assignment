import express from "express";
import { getDashboardData } from "../controllers/DashboardController.js";
import {  authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const DashboardRouter = express.Router();

// Dashboard route - accessible to any authenticated user and specific dashboard for viewer and admin/analyst based on their role
DashboardRouter.route("/").get(isAuthenticated, getDashboardData);

export default DashboardRouter;