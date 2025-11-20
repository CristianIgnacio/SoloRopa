import mongoose from "mongoose";
import dotenv from "dotenv";
import config from "../../utils/config";
dotenv.config();

const MONGO = config.SCRAPER_MONGODB_URI || "mongodb://localhost:27017/scraperdb";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO);
    console.log("MongoDB conectado");
  } catch (err) {
    console.error("Error conectando MongoDB:", err);
    process.exit(1);
  }
}

export default connectDB