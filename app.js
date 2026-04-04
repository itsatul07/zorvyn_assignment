import express, { urlencoded } from "express";
import UserRouter from "./routes/UserRouter.js";
import TransactionRouter from "./routes/TransactionRouter.js";
import DashboardRouter from "./routes/DashboardRouter.js";
import AdminRouter from "./routes/AdminRouter.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware setup
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

//routing handled
app.use("/api/users",UserRouter);
app.use("/api/transactions",TransactionRouter);
app.use("/api/dashboard",DashboardRouter);
app.use("/api/admin",AdminRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app; 