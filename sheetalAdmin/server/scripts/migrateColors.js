import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Product from "../models/product.model.js";
import Color from "../models/color.model.js";
import mongoose from "mongoose";

const dryRun = process.argv.includes("--dry-run");
const rollback = process.argv.includes("--rollback");

const runMigration = async () => {
  console.log(`Starting migration. Dry Run: ${dryRun}, Rollback: ${rollback}`);

  await connectDB();

  if (rollback) {
    console.log("Starting Rollback: Restoring inline color data on variants...");
    const products = await Product.find({}).lean();
    let updatedCount = 0;

    for (const p of products) {
      let needsUpdate = false;
      const updatedVariants = [];

      for (const v of p.variants || []) {
        if (v.colorId) {
          const colorDoc = await Color.findById(v.colorId);
          if (colorDoc) {
            v.color = {
              name: colorDoc.name,
              code: colorDoc.hex,
              swatchImage: "",
            };
            delete v.colorId;
            needsUpdate = true;
          }
        }
        updatedVariants.push(v);
      }

      if (needsUpdate) {
        if (!dryRun) {
          await Product.collection.updateOne(
            { _id: p._id },
            { $set: { variants: updatedVariants } }
          );
        } else {
          console.log(`[DRY RUN] Would rollback product: "${p.name}" (${p._id})`);
        }
        updatedCount++;
      }
    }

    console.log(`Rollback completed. Processed ${updatedCount} products.`);
    process.exit(0);
  }

  // Otherwise: Forward Migration
  console.log("Scanning products for distinct inline color data...");
  const rawProducts = await Product.collection.find({}).toArray();
  const distinctColorsMap = new Map(); // key: case-insensitive name -> { name, code }

  for (const p of rawProducts) {
    for (const v of p.variants || []) {
      const colorObj = v.color;
      if (colorObj && colorObj.name && colorObj.name.trim()) {
        const name = colorObj.name.trim();
        const code = colorObj.code ? colorObj.code.trim() : "#000000";
        const key = name.toLowerCase();

        if (!distinctColorsMap.has(key)) {
          distinctColorsMap.set(key, { name, code });
        } else {
          // If code is not the fallback #000000, update if the existing one is fallback
          const existing = distinctColorsMap.get(key);
          if (code !== "#000000" && existing.code === "#000000") {
            existing.code = code;
          }
        }
      }
    }
  }

  console.log(`Found ${distinctColorsMap.size} distinct colors to migrate.`);

  // 2. Insert distinct colors into the Color collection
  const colorIdMap = new Map(); // key: case-insensitive name -> Color ObjectId

  for (const [key, colorData] of distinctColorsMap.entries()) {
    let colorDoc = await Color.findOne({
      name: { $regex: new RegExp(`^${colorData.name}$`, "i") },
    });

    if (!colorDoc) {
      if (dryRun) {
        console.log(`[DRY RUN] Will create Color: name="${colorData.name}", hex="${colorData.code}"`);
        colorIdMap.set(key, new mongoose.Types.ObjectId());
      } else {
        colorDoc = await Color.create({
          name: colorData.name,
          hex: colorData.code,
        });
        console.log(`Created Color: name="${colorDoc.name}", hex="${colorDoc.hex}"`);
        colorIdMap.set(key, colorDoc._id);
      }
    } else {
      console.log(`Color already exists: name="${colorDoc.name}", hex="${colorDoc.hex}"`);
      colorIdMap.set(key, colorDoc._id);
    }
  }

  // 3. Update products to reference colorId
  let updatedProductsCount = 0;
  let skippedProductsCount = 0;

  for (const p of rawProducts) {
    let needsUpdate = false;
    const updatedVariants = [];

    for (const v of p.variants || []) {
      const colorObj = v.color;
      if (colorObj && colorObj.name && colorObj.name.trim()) {
        const nameKey = colorObj.name.trim().toLowerCase();
        const colorId = colorIdMap.get(nameKey);

        if (colorId) {
          v.colorId = colorId;
          delete v.color; // Remove legacy color field
          needsUpdate = true;
        } else {
          console.warn(`WARNING: Could not find color mapping for "${colorObj.name}" in product "${p.name}" (${p._id})`);
        }
      } else {
        // Variant does not have legacy color, keep as is
      }
      updatedVariants.push(v);
    }

    if (needsUpdate) {
      if (dryRun) {
        console.log(`[DRY RUN] Will update product "${p.name}" (${p._id}) with colorId references`);
      } else {
        // Use raw mongo to bypass validation during schema changeover
        await Product.collection.updateOne(
          { _id: p._id },
          { $set: { variants: updatedVariants } }
        );
      }
      updatedProductsCount++;
    } else {
      skippedProductsCount++;
    }
  }

  console.log(`Migration completed.`);
  console.log(`Updated products: ${updatedProductsCount}`);
  console.log(`Skipped products: ${skippedProductsCount}`);
  process.exit(0);
};

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
