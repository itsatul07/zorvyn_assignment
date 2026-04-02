import express, { urlencoded } from "express";
import UserRouter from "./routes/UserRouter.js";


const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use("/api",UserRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app; 