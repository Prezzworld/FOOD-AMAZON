module.exports = function (req, res, next) {
	try {
		if (req.user.isAdmin || req.user.role === 'super-admin') {
			req.user.role = 'super-admin';
			req.user.isAdmin = true;
		}
		// console.log("🔵 admin middleware called");
		if (!req.user.isAdmin || req.user.role !== "super-admin")
			return res.status(403).send("Access denied, admin only.");
		// console.log("✅ admin passed, calling next()");
		next();
	} catch (ex) {
		console.error("❌ admin error:", ex.message);
		res.status(400).send("Admin check failed");
	}
};
