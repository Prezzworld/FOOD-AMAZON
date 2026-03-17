const { User } = require("../models/user");

async function assignDistributorByCity(city) {
   try {
      const distributor = await User.findOne({
				role: "distributor",
            "distributorInfo.region": new RegExp(`^${city.trim()}$`, 'i'),
      });
      
      if (!distributor) {
         console.log(`No distributor found for this region: ${city}`);
         return null
      }

      console.log(`Assigned order to distributor: ${distributor.name} (${distributor.distributorInfo.businessName})`);
      return distributor._id;
   } catch {
      console.error("Error assigning distributor", error);
      return null;
   }
}

module.exports = { assignDistributorByCity };