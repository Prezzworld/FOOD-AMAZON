require("dotenv").config();
const mongoose = require("mongoose");
const config = require("config");
const { Product } = require("./models/product");
const { User } = require("./models/user");

async function checkDistributor() {
  console.log("Connecting to database...");
  await mongoose.connect(config.get("mongoURI"));
  console.log("Connected to database.");

  const distributors = await User.find({ role: "distributor" }).select("_id name email distributorInfo");
  console.log("My Distributors: ");

  distributors.forEach(distributor => {
    console.log(`
        ID: ${distributor._id},
        NAME: ${distributor.name},
        EMAIL: ${distributor.email},
        BUSINESS NAME: ${distributor.distributorInfo?.businessName},
        REGION: ${distributor.distributorInfo?.region},
      `);
  })

    const products = await Product.find({}).select('_id name distributorId');
  console.log('\nMy Products: ');
  
  products.forEach(product => {
    console.log(`
        ID: ${product._id},
        NAME: ${product.name},
        DISTRIBUTOR ID: ${product.distributorId},
      `)
  })

  await mongoose.disconnect();
}

checkDistributor()