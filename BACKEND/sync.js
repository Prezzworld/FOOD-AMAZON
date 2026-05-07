const mongoose = require("mongoose");
require("dotenv").config();

const LOCAL_URI = process.env.MONGODB_URI;
const ATLAS_URI = process.env.ATLAS_URI;

async function syncAllCollections() {
	let localConnection, atlasConnection;
	try {
		if (!LOCAL_URI || !ATLAS_URI) {
			throw new Error(
				"Missing MONGO URI or ATLAS URI in environment variables",
			);
		}

		localConnection = mongoose.createConnection(LOCAL_URI);
		atlasConnection = mongoose.createConnection(ATLAS_URI);

		await Promise.all([
			localConnection.asPromise(),
			atlasConnection.asPromise(),
		]);

		const collections = await localConnection.db.listCollections().toArray();

		for (const collection of collections) {
			const collectionName = collection.name;
			console.log(`Syncing collection: ${collectionName}`);
			const localCollection = localConnection.db.collection(collectionName);
			const atlasCollection = atlasConnection.db.collection(collectionName);
			const documents = await localCollection.find().toArray();
			for (const document of documents) {
				const { _id, ...documentWithoutId } = document;
				if (collectionName === "distributorcustomers") {
          await atlasCollection.replaceOne(
						{
							distributorId: document.distributorId,
							customerEmail: document.customerEmail,
						},
						documentWithoutId,
						{ upsert: true },
					);
				} else {
          await atlasCollection.updateOne(
            {_id: document._id},
            {$set: documentWithoutId},
            {upsert: true}
          )
				}
			}
			console.log(`Finished syncing collection: ${collectionName}`);
		}
		console.log("All collections synced successfully!");
	} catch (err) {
		console.log("Unable to sync: ", err);
	} finally {
		if (localConnection) await localConnection.close();
		if (atlasConnection) await atlasConnection.close();
		console.log("Connection closed");
	}
}

syncAllCollections();
