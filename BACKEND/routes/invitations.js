const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Invitation, validate } = require("../models/invitation");
const { sendInvitationEmail } = require("../utils/email");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", [auth, admin], async (req, res) => {
	try {
		const invitations = await Invitation.find()
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 });
		res.status(200).json({
			success: true,
			count: invitations.length,
			invitations,
		});
	} catch (error) {
		console.error("Failed to fetch invitations", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch invitations",
			error: error.message,
		});
	}
});

router.get("/single-invitation/:id", [auth, admin], async (req, res) => {
	try {
		const invitation = await Invitation.findOne({
			_id: req.params.id,
		})

		if (!invitation) {
			return res.status(404).json({
				success: false,
				message: "Invitation not found",
			});
		}

		res.status(200).json({
			success: true,
			invitation,
		});
	} catch (error) {
		console.error("Error fetching invitation:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch invitation",
			error: error.message,
		});
	}
});

router.post("/invite", [auth, admin], async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// let invitation = await Invitation.findOne({ email: req.body.email });
		// if (invitation) return res.status(400).send("An invitation has been sent to this account already");

      const { email, businessName, region, contactPhone } = req.body;

		const token = crypto.randomBytes(32).toString("hex");
		const invitation = new Invitation({
			email,
			businessName,
			region,
			contactPhone,
			token,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			createdBy: req.user._id,
			status: "pending",
		});

		await invitation.save();
		await sendInvitationEmail({
			to: email,
			businessName,
			region,
			token,
		});

		res.status(201).json({
			success: true,
			message: "Invitation successfully sent",
			invitation: {
				email,
				businessName,
				region,
				expiresAt: invitation.expiresAt,
			},
		});
	} catch (error) {
		console.error("Failed to send invite", error);
		res.status(500).json({
			success: false,
			message: "Failed to send invite",
			error: error.message,
		});
	}
});

router.delete("/delete-invitation/:id", [auth, admin], async (req, res) => {
	try {
		const invitation = await Invitation.findByIdAndDelete(req.params.id);
		if (!invitation)
			return res.status(404).send("No invitation matching this ID was found");

		res.status(200).json({
			success: true,
			message: "Deleted invitation sucessfully",
			count: invitation.length,
		});
	} catch (error) {
		console.error("Error deleting invitation", error);
		res.status(500).json({
			success: false,
			message: "An error occured while deleting invitation",
			error: error.message,
		});
	}
});

router.get("/verify-invitation/:token", async (req, res) => {
	try {
		const { token } = req.params;
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
		res.status(200).json({
			success: true,
			message: "Invitation is successully verified",
			invitation: {
				email: invitation.email,
				businessName: invitation.businessName,
				region: invitation.region,
			},
		});
	} catch (error) {
		console.error("Error verifying invitation:", error);
		res.status(500).json({
			success: false,
			error: "Failed to verify invitation",
		});
	}
});

module.exports = router;
