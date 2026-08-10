require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const config = require("config");
const { Order } = require("./models/order");
const { generateShortId } = require("./utils/generateShortId");

async function backfillOrderShortId() {
  try {
    console.log("Connecting to mongodb...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected successfully\n");

    // Only orders eligible for a shortId are ones with a paymentReference —
    // that's the same rule your /orders route uses to decide what counts
    // as a "real" order. We never touch orders outside that set.
    const eligibleOrders = await Order.find({
      "paymentInfo.paymentReference": { $exists: true },
    }).sort({ createdAt: 1 }); // oldest first, so numbering stays chronological

    const ineligibleWithShortId = await Order.countDocuments({
      "paymentInfo.paymentReference": { $exists: false },
      shortId: { $exists: true },
    });

    console.log(`📦 Found ${eligibleOrders.length} eligible orders\n`);
    if (ineligibleWithShortId > 0) {
      console.log(
        `⚠️  ${ineligibleWithShortId} orders have a shortId but no paymentReference — ` +
          `these are left untouched (not regenerated, not stripped). Investigate them ` +
          `separately before deciding whether they should be deleted or repaired.\n`,
      );
    }

    let created = 0;
    let skipped = 0;

    for (const order of eligibleOrders) {
      try {
        if (order.shortId) {
          skipped++;
          continue; // already has one, no need to touch it
        }
        const { distributorId, userId } = order;
        const newShortId = distributorId
          ? await generateShortId(Order, "distributorId", distributorId)
          : await generateShortId(Order, "userId", userId);

        await Order.findByIdAndUpdate(
          order._id,
          { $set: { shortId: newShortId } },
          { new: true },
        );
        created++;
        console.log(`✅ Assigned ${newShortId} to order ${order._id}`);
      } catch (error) {
        console.error(`Error processing order ${order._id}:`, error);
      }
    }

    console.log("\n========= Backfill Complete =========");
    console.log(`✅ Created:  ${created}`);
    console.log(`⏭️  Skipped (already had one): ${skipped}`);
    console.log(`📊 Total eligible: ${eligibleOrders.length}`);
    console.log("======================================\n");
  } catch (error) {
    console.error("Error backfilling short Ids for orders:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

backfillOrderShortId();
