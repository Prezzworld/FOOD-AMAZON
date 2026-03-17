const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
	try {
		// console.log("🔵 auth middleware called");
		const token = req.header("x-auth-token");

		console.log("🔐 Auth middleware - Token received:", !!token);
		console.log("🔐 Token preview:", token?.substring(0, 30) + "...");
		if (!token) {
			console.log("❌ No token provided");
			return res.status(401).send("Access denied. No token provided");
		};

		const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
		console.log("✅ Token verified successfully:", decoded);
		req.user = decoded;
		// console.log("✅ auth passed, calling next()");
		next();
	} catch (ex) {
		console.error("❌ auth error:", ex.message);
		res.status(401).send("invalid token");
	}
}

module.exports = auth;
