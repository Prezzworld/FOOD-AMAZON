const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const config = require("config");
const jwt = require("jsonwebtoken");

// Sign in with google 
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		session: false,
		failureRedirect: `${config.get("frontendUrl")}/login?error=google_auth_failed`,
	}), (req, res) => {
		const user = req.user;
		console.log(user);
		const accessToken = user.generateAuthToken("1d");
		const refreshToken = user.generateRefreshToken("7d");
		user.refreshToken = refreshToken;
		user.save();
		res.redirect(`${config.get("frontendUrl")}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
	}
);

module.exports = router;