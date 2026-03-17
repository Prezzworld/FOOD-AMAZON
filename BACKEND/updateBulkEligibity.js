const mongoose = require('mongoose');
const {Product} = require('./models/product');

const connectionString = 'mongodb://localhost:27017/food-amazon-database';

async function updateProducts() {
   try {
      console.log('🔌 Connecting to database...');
		await mongoose.connect(connectionString);
		console.log('✅ Connected successfully');

		// Strategy 1: Mark ALL products as bulk eligible with a default description
		// This is the simplest approach if all your products can be ordered in bulk
		console.log('📝 Updating all products...');
		const result = await Product.updateMany(
			{}, // Empty filter means "match all documents"
			{
				$set: {
					bulkOrderEligible: true,
					bulkDescription: 'Available for bulk orders! Perfect for parties and events.',
					minimumBulkQuantity: 50
				}
			}
		);
		console.log(`✅ Updated ${result.modifiedCount} products`);

      // Just for certain categories to be bulk eligible
      /*
		console.log('📝 Updating products in specific categories...');
		const snacksCategory = await Category.findOne({ name: 'Snacks' });
		const beveragesCategory = await Category.findOne({ name: 'Beverages' });
		
		if (snacksCategory || beveragesCategory) {
			const categoryIds = [snacksCategory?._id, beveragesCategory?._id].filter(Boolean);
			
			const result = await Product.updateMany(
				{ 'category._id': { $in: categoryIds } },
				{
					$set: {
						bulkOrderEligible: true,
						bulkDescription: 'Great for large gatherings and events!',
						minimumBulkQuantity: 50
					}
				}
			);
			console.log(`✅ Updated ${result.modifiedCount} products in selected categories`);
		}
		*/

      // Strategy 3: Mark only popular products (rating >= 4) as bulk eligible
		// This assumes you want to promote your best products for bulk orders
		/*
		console.log('📝 Updating popular products...');
		const result = await Product.updateMany(
			{ rating: { $gte: 4 } },
			{
				$set: {
					bulkOrderEligible: true,
					bulkDescription: 'One of our most popular items! Perfect for bulk orders.',
					minimumBulkQuantity: 50
				}
			}
		);
		console.log(`✅ Updated ${result.modifiedCount} popular products`);
		*/

		// Strategy 4: Set different descriptions based on product characteristics
		// This gives you more control over the messaging for different product types
		/*
		// Update beverages with specific messaging
		const beverageCategory = await Category.findOne({ name: 'Beverages' });
		if (beverageCategory) {
			await Product.updateMany(
				{ 'category._id': beverageCategory._id },
				{
					$set: {
						bulkOrderEligible: true,
						bulkDescription: 'Keep your guests refreshed! Available in bulk quantities.',
						minimumBulkQuantity: 100 // Higher minimum for beverages
					}
				}
			);
			console.log('✅ Updated beverages');
		}

		// Update snacks with different messaging
		const snacksCategory = await Category.findOne({ name: 'Snacks' });
		if (snacksCategory) {
			await Product.updateMany(
				{ 'category._id': snacksCategory._id },
				{
					$set: {
						bulkOrderEligible: true,
						bulkDescription: 'Perfect for parties, events, and gatherings!',
						minimumBulkQuantity: 50
					}
				}
			);
			console.log('✅ Updated snacks');
		}
		*/

		console.log('🎉 All updates completed successfully!');
		
   } catch (error) {
      console.error("Error updating products", error);
   } finally {
      await mongoose.disconnect();
		console.log('👋 Disconnected from database');
   }
}

updateProducts();