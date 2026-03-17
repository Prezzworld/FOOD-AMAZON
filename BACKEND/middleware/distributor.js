module.exports = function (req, res, next) {
   try {
      if(req.user.role !== 'distributor') {
         return res.status(403).send("Access denied, distributor only.");
      } 
      next();
   } catch (err) {
      console.error("Distributor error", err.message);
      res.status(400).send("Distributor check failed");
   }
};