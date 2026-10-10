import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";

// Point to the .env in the server root (one level up from scripts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

console.log("MONGO_URI found:", !!process.env.MONGO_URI);

await mongoose.connect(process.env.MONGO_URI);

const result = await mongoose.connection.db
  .collection("products")
  .updateMany(
    { isStarred: { $exists: false } },
    { $set: { isStarred: false } }
  );

console.log(`Matched: ${result.matchedCount}, Updated: ${result.modifiedCount}`);

await mongoose.disconnect();
console.log("Done!");