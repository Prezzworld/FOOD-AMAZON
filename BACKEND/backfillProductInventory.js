require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const config = require("config");
const { Product } = require("./models/product");

async function backfillProductInventoryFields() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected.\n");

    // lowStockThreshold and reorderRequested have real, defensible defaults
    // (they mirror the schema's own default), so backfilling them is safe.
    const thresholdResult = await Product.updateMany(
      { lowStockThreshold: { $exists: false } },
      { $set: { lowStockThreshold: 10 } },
    );
    const reorderResult = await Product.updateMany(
      { reorderRequested: { $exists: false } },
      { $set: { reorderRequested: false } },
    );

    // buyingPrice and expiryDate have NO source of truth anywhere in this
    // system — backfilling them would mean inventing numbers/dates that
    // were never entered. We report what's missing instead of faking it.
    const missingBuyingPrice = await Product.countDocuments({
      buyingPrice: { $exists: false },
    });
    const missingExpiryDate = await Product.countDocuments({
      expiryDate: { $exists: false },
    });

    console.log("========= Backfill Complete =========");
    console.log(
      `✅ lowStockThreshold set on ${thresholdResult.modifiedCount} products (default: 10)`,
    );
    console.log(
      `✅ reorderRequested set on ${reorderResult.modifiedCount} products (default: false)`,
    );
    console.log(
      `⚠️  ${missingBuyingPrice} products still have no buyingPrice — needs manual entry, not backfilled`,
    );
    console.log(
      `⚠️  ${missingExpiryDate} products still have no expiryDate — needs manual entry, not backfilled`,
    );
    console.log("======================================\n");
  } catch (error) {
    console.error("Error backfilling product inventory fields:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

backfillProductInventoryFields();
