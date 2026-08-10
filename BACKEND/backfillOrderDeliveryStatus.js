require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const config = require("config");
const { Order } = require("./models/order");

// "pending" is a safe default here — every order that reaches this state
// hasn't been explicitly marked delivered/cancelled/processing/shipped,
// and "pending" is what Mongoose would have assigned at creation time if
// the field had been present in the schema when the document was made.
async function backfillDeliveryStatus() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected.\n");

    const missing = await Order.find({
      "paymentInfo.paymentReference": { $exists: true },
      "paymentInfo.deliveryStatus": { $exists: false },
    }).select("_id paymentInfo.paymentStatus createdAt");

    console.log(`📦 Found ${missing.length} orders missing deliveryStatus\n`);

    let updated = 0;
    for (const order of missing) {
      try {
        await Order.findByIdAndUpdate(order._id, {
          $set: { "paymentInfo.deliveryStatus": "pending" },
        });
        updated++;
        console.log(`✅ Set deliveryStatus="pending" on order ${order._id}`);
      } catch (error) {
        console.error(`Error updating order ${order._id}:`, error);
      }
    }

    console.log("\n========= Backfill Complete =========");
    console.log(`✅ Updated: ${updated}`);
    console.log(`📊 Total found: ${missing.length}`);
    console.log("======================================\n");
  } catch (error) {
    console.error("Error backfilling deliveryStatus:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

backfillDeliveryStatus();