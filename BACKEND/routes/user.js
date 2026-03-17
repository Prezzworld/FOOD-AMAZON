const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send("User already registered");

	user = new User(_.pick(req.body, ["name", "email", "phoneNumber", "password", "role"]));
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);

	await user.save();

	const token = user.generateAuthToken('24h');

	// res.send(_.pick(user, ["id", "name", "email"]));
	// res.header("x-auth-token", token).send(_.pick(user, ["id", "name", "email"]));

	res.header("x-auth-token", token).status(201).json({
		success: true,
		message: "User created successfully",
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			role: user.role
		}
	});
});

router.get("/me", auth, async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");
	res.send(user);
});

module.exports = router;
