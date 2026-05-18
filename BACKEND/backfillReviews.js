require("dotenv").config();
const mongoose = require("mongoose");
const config = require("config");
const { Review } = require("./models/review");
const { Product } = require("./models/product");

// async function backfillReviews() {
//   try {
//     console.log("Connecting to mongodb...");
//     await mongoose.connect(config.get("mongoURI"));
//     console.log("Connected successfully");
    
//     const reviewsWithoutStatus = await Review.find({ status: { $exists: false } });
//     console.log("Found " + reviewsWithoutStatus.length + " reviews without status\n");

//     let updated = 0;
//     for (const review of reviewsWithoutStatus) {
//       try {
//         await Review.findByIdAndUpdate(review._id, {
//           $set: {
//             status: "published"
//           }
//         }, { new: true, runValidators: true });
//         updated++;
//         console.log(`Updated review ${review._id} with status "published"`);
//       } catch (error) {
//         console.error(`Error processing review ${review._id}:`, error);
//       }
//     }
//     console.log("\n========= Migration Complete =========");
//     console.log(`Review update completed. Updated ${updated} reviews with default status "published"`);
//     console.log("======================================\n");
//   } catch (error) {
//     console.error("Error occurred while connecting to MongoDB:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("========== Disconnected from MongoDB ==========\n");
//   }
// }

// backfillReviews();

async function addReviewHeadline() {
  try {
    console.log("Connecting to mongodb...");
    await mongoose.connect(config.get("mongoURI"));
    console.log("Connected successfully");

    const reviewsWithoutHeadline = await Review.find({ headline: { $exists: false } });
    console.log("Found " + reviewsWithoutHeadline.length + " reviews without headline\n");

    let updated = 0;
    for (const review of reviewsWithoutHeadline) {
      try {
        const product = await Product.findById(review.productId);
        await Review.findByIdAndUpdate(review._id, {
          $set: { headline: product.name }
        }, { new: true, runValidators: true });
        updated++;
        console.log(`Updated review ${review._id} with headline "${product.name}"`);
      } catch (error) {
        console.error(`Error processing review ${review._id}:`, error);
      }
    }
    console.log("\n========= Migration Complete =========");
    console.log(`Review update completed. Updated ${updated} reviews with default headline`);
    console.log("======================================\n");
  } catch (error) {
    console.error("Error occurred while adding review headline:", error);
  } finally {
    await mongoose.disconnect();
    console.log("========== Disconnected from MongoDB ==========\n");
  }
}
addReviewHeadline();