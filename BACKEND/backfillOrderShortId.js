require("dotenv").config(); // Load environment variables since we're outside the main app
const mongoose = require("mongoose");
const config = require("config");
const { Order } = require("./models/order");
const {generateShortId} = require("./utils/generateShortId")

async function backfillOrderShortId() {
  try {
    console.log("Connecting to mongodb...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected successfully");

    await Order.updateMany(
			{ shortId: { $exists: true } },
			{ $unset: { shortId: "" } },
		);
    console.log("Cleared existing shortIds from orders\n");
    console.log("Starting backfill of shortIds for orders without them...\n");
    const ordersWithoutShortId = await Order.find({
      shortId: { $exists: false },
      "paymentInfo.paymentReference": { $exists: true },
    })

    console.log("📦 Found " + ordersWithoutShortId.length + " orders without short Ids\n");

    let created = 0;

    for (const order of ordersWithoutShortId) {
      try {
        const {distributorId, userId} = order;
        const newShortId = distributorId ? await generateShortId(Order, 'distributorId', distributorId) : await generateShortId(Order, 'userId', userId);

        await Order.findByIdAndUpdate(order._id, {
          $set: {
            shortId: newShortId
          }
        }, { new: true })
					created++;
					console.log(
						`✅ Created new shortId ${newShortId} for order ${order._id}`,
					);
      } catch (error) {
        console.error(`Error processing order ${order._id}:`, error);
      }
    }

    console.log("\n========= Migration Complete =========");
		console.log(`✅ Created: ${created}`);
		console.log(`📊 Total processed: ${ordersWithoutShortId.length}`);
    console.log("======================================\n");
    
  } catch (error) {
    console.error("Error backfilling short Ids for orders", error);
  }
}

backfillOrderShortId()