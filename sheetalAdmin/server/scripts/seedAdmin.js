import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { config } from "../config/config.js";

export const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: config.adminEmail });

    if (adminExists) {
      // console.log("Admin already exists. Skipping seeding...");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(config.adminPassword, salt);

    await User.create({
      name: config.adminName,
      email: config.adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Default Admin created successfully!");
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};
