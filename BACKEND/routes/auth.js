const { User, validateLogin } = require("../models/user");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const config = require('config');

router.post("/", async (req, res) => {
	const { error } = validateLogin(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(401).send("Invalid email or password");

  let validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(401).send("Invalid email or password");

	// await user.save();
   // res.send(_.pick(user, ["id", "name", "email"]));
	const accessToken = user.generateAuthToken("1d")

	if(req.body.rememberMe) {
		const refreshToken = user.generateRefreshToken("7d");
		user.refreshToken = refreshToken;

		await user.save();

		res.header("x-auth-token", accessToken).json({
			accessToken,
			refreshToken,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	}

	res.header("x-auth-token", accessToken).json({
		accessToken,
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
		},
	});
});

router.post("/refresh-token", async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).send("Refresh token required");
		}

		// Verify refresh token
		let decoded;
		try {
			decoded = jwt.verify(refreshToken, config.get("jwtRefreshKey"));
		} catch (err) {
			return res.status(403).send("Invalid or expired refresh token");
		}

		// Find user and check if refresh token matches
		const user = await User.findById(decoded._id);
		if (!user) {
			return res.status(403).send("User not found");
		}

		if (user.refreshToken !== refreshToken) {
			return res.status(403).send("Invalid refresh token");
		}

		// Generate new access token
		const newAccessToken = user.generateAuthToken("1d");

		res.json({ accessToken: newAccessToken });
	} catch (error) {
		console.error("Refresh token error:", error);
		res.status(500).send("Something went wrong: " + error.message);
	}
});

// Logout endpoint - invalidates refresh token
router.post("/logout", async (req, res) => {
	try {
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).send("User ID required");
		}

		const user = await User.findById(userId);
		if (user) {
			user.refreshToken = null;
			await user.save();
		}

		res.send("Logged out successfully");
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).send("Error logging out: " + error.message);
	}
});

module.exports = router;
