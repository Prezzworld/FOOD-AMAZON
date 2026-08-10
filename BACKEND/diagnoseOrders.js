require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const config = require("config");
const { Order } = require("./models/order");

async function diagnoseOrders() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected.\n");

    const total = await Order.countDocuments({
      "paymentInfo.paymentReference": { $exists: true },
    });

    const missingDeliveryStatus = await Order.countDocuments({
      "paymentInfo.paymentReference": { $exists: true },
      "paymentInfo.deliveryStatus": { $exists: false },
    });

    const missingShortId = await Order.countDocuments({
      "paymentInfo.paymentReference": { $exists: true },
      shortId: { $exists: false },
    });

    const missingPaymentReference = await Order.countDocuments({
      "paymentInfo.paymentReference": { $exists: false },
    });

    const byDeliveryStatus = await Order.aggregate([
      { $match: { "paymentInfo.paymentReference": { $exists: true } } },
      { $group: { _id: "$paymentInfo.deliveryStatus", count: { $sum: 1 } } },
    ]);

    console.log("=========== DIAGNOSTIC RESULTS ===========");
    console.log(`Total orders (with paymentReference):     ${total}`);
    console.log(
      `Missing paymentInfo.deliveryStatus field:  ${missingDeliveryStatus}`,
    );
    console.log(`Missing shortId field:                     ${missingShortId}`);
    console.log(
      `Missing paymentReference entirely:         ${missingPaymentReference}`,
    );
    console.log(
      "\nBreakdown by deliveryStatus value (null = field missing entirely):",
    );
    byDeliveryStatus.forEach((row) =>
      console.log(`  ${row._id ?? "(missing)"}: ${row.count}`),
    );
    console.log("===========================================\n");
  } catch (error) {
    console.error("Error running diagnostic:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

diagnoseOrders();
