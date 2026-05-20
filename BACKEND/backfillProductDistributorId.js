require("dotenv").config();
const mongoose = require("mongoose");
const config = require("config");
const { Product } = require("./models/product");

async function backfillProductDistributorId() {
  try {
    console.log("Connecting to database..."); 
    await mongoose.connect(config.get("mongoURI")); 
    console.log("Connected to database.");

    const distributorAId = "696f61e3aabdaec51c86f25f";
    const distributorBId = "69682d8e0c7b3668f29b2921";

    const productsForDistributorA = [
			"69470914f040722f513c0f75",
			"69467fccebc6a3998fcea040",
			"69470c7cf040722f513c0f85",
    ];
    const productsForDistributorB = [
			"69470fb9f040722f513c0f97",
			"6948807d3d743ba85e8b353b",
			"69467b804e6718a4db4fd4b0",
    ];
    
    const resultA = await Product.updateMany(
      { _id: { $in: productsForDistributorA } },
      { $set: { distributorId: new mongoose.Types.ObjectId(distributorAId)} }
    );
    console.log(`Updated ${resultA.modifiedCount} products for Distributor A`);

    const resultB = await Product.updateMany(
      { _id: { $in: productsForDistributorB } },
      { $set: { distributorId: new mongoose.Types.ObjectId(distributorBId)} }
    );
    console.log(`Updated ${resultB.modifiedCount} products for Distributor B`);

    const missedProducts = await Product.find({ distributorId: { $exists: false } }).select("_id name");
    if (missedProducts.length > 0) {
      console.log("These products were missed and still don't have a distributorId:");
      missedProducts.forEach(product => {
        console.log(`ID: ${product._id}, Name: ${product.name}`);
      });
    } else {
      console.log("All products have been successfully updated with distributorId.");
    }
  } catch (error) {
    console.error("Error occured while backfilling: ", error)
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

backfillProductDistributorId()