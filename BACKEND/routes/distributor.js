const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { Invitation } = require("../models/invitation");
const auth = require("../middleware/auth");
const distributor = require("../middleware/distributor");
const admin = require("../middleware/admin");

router.get("/", [auth, admin], async (req, res) => {
	try {
		const distributors = await User.find({ role: "distributor" })
			.select("-password")
			.sort({ "distributorInfo.createdAt": -1 });

		res.status(200).json({
			success: true,
			count: distributors.length,
			distributors,
		});
	} catch (error) {
		console.error("Error fetching distributors:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch distributors",
			error: error.message,
		});
	}
});

router.get("/single-distributor/:id", [auth, admin], async (req, res) => {
	try {
		const distributor = await User.findOne({
			_id: req.params.id,
			role: "distributor",
		}).select("-password");

		if (!distributor) {
			return res.status(404).json({
				success: false,
				message: "Distributor not found",
			});
		}

		res.status(200).json({
			success: true,
			distributor,
		});
	} catch (error) {
		console.error("Error fetching distributor:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch distributor",
			error: error.message,
		});
	}
});

router.get("/me", [auth, distributor], async (req, res) => {
	try {
		const currentDistributor = await User.findById(req.user._id).select("-password -refreshToken");
		if (!currentDistributor) {
			return res.status(404).json({
				success: false,
				message: "Distributor not found"
			})
		}
		res.json({
			success: true,
			distributor: {
				id: currentDistributor._id,
				name: currentDistributor.name,
				email: currentDistributor.email,
				phoneNumber: currentDistributor.phoneNumber,
				role: currentDistributor.role,
				businessName: currentDistributor.distributorInfo.businessName,
				region: currentDistributor.distributorInfo.region,
				contactPhone: currentDistributor.distributorInfo.contactPhone,
				joinedDate: currentDistributor.distributorInfo.createdAt,
			},
		});
	} catch (error) {
		console.error("Get current distributor error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to get distributor information",
		});
	}
})

router.post("/signup", async (req, res) => {
	try {
		const { token, fullName, email, password } = req.body;
		if ((!token || !fullName || !email || !password)) {
			return res.status(400).json({
				success: false,
				error: "token, full name, email and password are required",
			});
		}
		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				error: "Password must be atleast 6 characters long",
			});
		}

		const invitation = await Invitation.findOne({
			token: token,
			status: "pending",
			expiresAt: { $gt: Date.now() },
		});
		if (!invitation) {
			return res.status(400).json({
				success: false,
				error: "Invalid or expired invitation",
			});
		}
		if (email !== invitation.email) {
			return res.status(401).send("Email must match with the email used to receive the invite")
		}

		const existingUser = await User.findOne({ email: invitation.email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				error: "A user with this email already exists",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const distributor = new User({
			name: fullName,
			email: invitation.email,
			password: hashedPassword,
			phoneNumber: invitation.contactPhone,
			role: "distributor",
			distributorInfo: {
				businessName: invitation.businessName,
				region: invitation.region,
				contactPhone: invitation.contactPhone,
				createdAt: new Date(),
				createdBy: invitation.createdBy,
			},
		});
		await distributor.save();

		invitation.status = "accepted";
		await invitation.save();

		const jwtToken = distributor.generateAuthToken('1d');
		res.status(201).json({
			success: true,
			message: "Account created successfully",
			token: jwtToken,
			user: {
				id: distributor._id,
				name: distributor.name,
				email: distributor.email,
				role: distributor.role,
				distributorInfo: distributor.distributorInfo,
			},
		});
	} catch (error) {
		console.error("Failed to register distributor", error);
		res.status(500).json({
			success: false,
			message: "An error occured while registering distributor",
			error: error.message,
		});
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).send("Invalid email");
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) return res.status(401).send("The password you entered is incorrect");

		const accessToken = user.generateAuthToken("1d")
		if (req.body.rememberMe) {
			const refreshToken = user.generateRefreshToken("30d");
			user.refreshToken = refreshToken;
			await user.save();

			res.status(200).json({
				success: true,
				accessToken,
				refreshToken,
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					distributorInfo: user.distributorInfo,
				},
			});
		}
		
		res.status(200).json({
			success: true,
			accessToken,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				distributorInfo: user.distributorInfo,
			},
		});
	} catch (error) {
		console.error("Error logging in to distributor account", error);
		res.status(500).json({
			success: false,
			message: "Error logging in to distributor account",
			error: error.message,
		});
	}
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
