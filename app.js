import express, { urlencoded } from "express";
import UserRouter from "./routes/UserRouter.js";
import TransactionRouter from "./routes/TransactionRouter.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users",UserRouter);
app.use("/api/transactions",TransactionRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app; 