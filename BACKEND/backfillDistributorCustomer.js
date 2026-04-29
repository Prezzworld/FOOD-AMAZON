require("dotenv").config(); // Load environment variables since we're outside the main app
const mongoose = require("mongoose");
const config = require("config");
const { Order } = require("./models/order");
const {
	upsertDistributorCustomer,
} = require("./utils/upsertDistributorCustomer");


async function backfillDistributorCustomer() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected successfully");

    const eligibleOrders = await Order.find({
      "paymentInfo.paymentStatus": "paid",
      orderChannel: 'delivery',
      distributorId: { $exists: true, $ne: null },
      "customerSnapshot.email": { $exists: true, $ne: null },
    })

    console.log(
			`📦 Found ${eligibleOrders.length} eligible orders to process\n`,
		);

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const order of eligibleOrders) {
      try {
        const result = await upsertDistributorCustomer({
          distributorId: order.distributorId,
          customerEmail: order.customerSnapshot.email,
          firstName: order.customerSnapshot.firstName,
          lastName: order.customerSnapshot.lastName,
          phone: order.customerSnapshot.phone,
          source: "order",
          orderDate: order.createdAt
        })

        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime();
        if (wasCreated) {
          created++;
          console.log(`✅ Created new distributor customer for order ${order._id}`);
        } else {
          updated++;
          console.log(`🔄 Updated existing distributor customer for order ${order._id}`)  ;
        }
      } catch (error) {
        failed++;
        console.error(
          `Error for order ${order._id} for distributor ${order.distributorId}:`,
          error,
        );
      }
    }
    console.log("\n========= Migration Complete =========");
		console.log(`✅ Created: ${created}`);
		console.log(`🔄 Updated: ${updated}`);
		console.log(`❌ Failed:  ${failed}`);
		console.log(`📊 Total processed: ${eligibleOrders.length}`);
		console.log("======================================\n");
  } catch (error) {
    console.error("Error backfilling distributor customers:", error);
  } finally {
    await mongoose.disconnect(config.get("mongoURI"))
  }
}

backfillDistributorCustomer();