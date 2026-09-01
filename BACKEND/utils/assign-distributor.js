const { User } = require("../models/user");

async function assignDistributorByCity(city) {
   try {
      const distributor = await User.findOne({
				role: "distributor",
            "distributorInfo.region": new RegExp(`^${city.trim()}$`, 'i'),
      });
      
      if (!distributor) {
         return null
      }
      return distributor._id;
   } catch(error) {
      console.error("Error assigning distributor", error);
      return null;
   }
}

module.exports = { assignDistributorByCity };