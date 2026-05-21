import dotenv from "dotenv";
import app from "./app.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    configureCloudinary();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
