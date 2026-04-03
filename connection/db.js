import mongoose from "mongoose";


export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
export default mongoose;
