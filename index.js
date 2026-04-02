import app from "./app.js"; 
import dotenv from "dotenv";
import { connectDB } from "./connection/db.js";

dotenv.config();    

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
} );