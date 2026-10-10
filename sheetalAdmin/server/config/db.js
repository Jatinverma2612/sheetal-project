import mongoose from "mongoose";
import dns from "dns";
import { config } from "./config.js";

// Set reliable public DNS servers for Node's internal c-ares resolver on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore if custom DNS assignment is restricted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};





export default connectDB;
