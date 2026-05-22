require("dotenv").config();
const mongoose = require("mongoose");
const config = require("config");
const { Review } = require("./models/review");
const { Product } = require("./models/product");

// async function backfillReviewDistributorId() {
//   try {
//     console.log("Connecting to database...");
//     await mongoose.connect(config.get("mongoURI"));
//     console.log("Connected to database.");

//     const reviewsWithoutDistributorId = await Review.find({ distributorId: { $exists: false } });
//     console.log(`Found ${reviewsWithoutDistributorId.length} reviews without distributorId\n`);

//     let fixed = 0;
//     let failed = 0;

//     for(const review of reviewsWithoutDistributorId) {
//       try {
//         const product = await Product.findById(review.productId).select("distributorId name");
//         if (!product) {
//           console.log(`No product found for review ${review._id}, skipping`)
//           failed++;
//           continue;
//         }
//         if (!product.distributorId) {
//           console.log(`Product ${product._id} for review ${review._id} does not have a distributorId, skipping`);
//           failed++;
//           continue;
//         }

//         await Review.findByIdAndUpdate(review._id, {
// 					$set: { distributorId: product.distributorId },
//         });
//         console.log("Fixed review " + review._id + " by setting distributorId to " + product.distributorId);
//         fixed++;
//       } catch (error) {
//         console.error(`Error processing review ${review._id}:`, error);
//         failed++;
//       }
//     }

//     console.log("\n========= Backfill Complete =========");
// 		console.log(`Fixed:  ${fixed}`);
// 		console.log(`Failed: ${failed}`);
// 		console.log(`Total:  ${reviewsWithoutDistributorId.length}`);
// 		console.log("=====================================\n");
//   } catch (error) {
//     console.error("Error occurred while backfilling review distributorId: ", error);
//   } finally {
//     console.log("Disconnecting from database...");
//     await mongoose.disconnect();
//     console.log("Disconnected from database.");
//   }
// }

// backfillReviewDistributorId()

async function backfillReviewProductName() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected to database");

    const reviewsWithoutProductName = await Review.find({ productName: { $exists: false } });
    console.log(`Found ${reviewsWithoutProductName.length} reviews without productName\n`);

    let fixed = 0;
    let failed = 0;

    for (const review of reviewsWithoutProductName) {
      try {
        const product = await Product.findById(review.productId).select("name");
        if (!product) {
          console.log(`No product found for review ${review._id}, skipping`);
          failed++;
          continue;
        }
        await Review.findByIdAndUpdate(review._id, {
          $set: {productName: product.name}
        }, { new: true, runValidators: true });
        console.log("Fixed review " + review._id + " by setting product name to " + product.name);
        fixed++
      } catch (error) {
        console.error(`Error processing review ${review._id}:`, error);
        failed++;
      }
    }

    console.log("\n============ BACKFILL COMPLETE ==============");
    console.log(`Fixed: ${fixed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${reviewsWithoutProductName.length}`);
    console.log("=====================================\n")
  } catch (error) {
    console.error("Error occured while backfilling review productName: ", error);
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

backfillReviewProductName();