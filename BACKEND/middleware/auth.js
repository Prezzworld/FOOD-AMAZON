const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
	try {
		// console.log("🔵 auth middleware called");
		const token = req.header("x-auth-token");
		if (!token) {
			return res.status(401).send("Access denied. No token provided");
		};

		const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
		req.user = decoded;
		// console.log("✅ auth passed, calling next()");
		next();
	} catch (ex) {
		console.error("❌ auth error:", ex.message);
		res.status(401).send("invalid token");
	}
}

module.exports = auth;
