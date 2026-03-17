const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');

router.get("/test-device", (req, res) => {
	const userAgent = req.headers["user-agent"];
	const parser = new UAParser(userAgent);
	const result = parser.getResult();

	res.json({
		userAgent: userAgent,
		deviceInfo: result,
		detectedType:
			result.device.type === "mobile" || result.device.type === "tablet"
				? "mobile"
				: "desktop",
	});
});

module.exports = router;