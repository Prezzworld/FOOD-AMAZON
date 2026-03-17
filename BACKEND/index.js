require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
// exports.app = app;
const mongoose = require("mongoose");
const config = require("config");
const category = require("./routes/category");
const product = require("./routes/product");
const customer = require("./routes/customer");
const register = require("./routes/user");
const login = require("./routes/auth");
const cart = require("./routes/cart");
const order = require("./routes/order");
const distributor = require("./routes/distributor")
const invitation = require('./routes/invitations');
const dashboard = require("./routes/distributor-dashboard");
const test = require("./routes/test");

console.log("JWT Key loaded:", !!config.get("jwtPrivateKey"));
console.log("JWT Refresh Key loaded:", !!config.get("jwtRefreshKey"));

if (!config.get("jwtPrivateKey")) {
	console.error("FATAL ERROR: jwtPrivateKey is not defined.");
	process.exit(1);
}

mongoose
	.connect(config.get("mongoURI"))
	.then(() => console.log("Connected to database..."))
	.catch((err) => console.error(err, "Could not connect..."));

app.use(cors({
	origin: config.get("frontendUrl"),
	credentials: true,
	exposedHeaders: ['x-auth-token']
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
// app.use((req, res, next) => {
// 	console.log(`${req.method} ${req.path}`);
// 	console.log("Headers:", req.headers);
// 	console.log("Body:", req.body);
// 	next();
// });

app.use("/api/food-amazon-database/categories", category);
app.use("/api/food-amazon-database/products", product);
app.use("/api/food-amazon-database/customers", customer);
app.use("/api/food-amazon-database/users/register", register);
app.use("/api/food-amazon-database/users/login", login);
app.use("/api/food-amazon-database/cart", cart);
app.use("/api/food-amazon-database/order", order);
app.use('/api/food-amazon-database/distributors', distributor);
app.use("/api/food-amazon-database/distributors/dashboard", dashboard);
app.use('/api/food-amazon-database/invitation', invitation);
app.use('/api/food-amazon-database/test', test);
// Global error handling middleware - MUST be last
app.use((err, req, res, next) => {
	console.error("🔴 FULL ERROR OBJECT:", err);
	console.error("🔴 ERROR MESSAGE:", err?.message || "No message");
	console.error("🔴 ERROR STACK:", err?.stack || "No stack");
	console.error("🔴 ERROR NAME:", err?.name || "No name");

	res.status(err.status || 500).json({
		success: false,
		error: err?.message || err?.toString() || "Unknown error occurred",
		...(process.env.NODE_ENV === "development" && { stack: err?.stack }),
	});
});

const port = config.get("port");
app.listen(port, () => console.log(`Listening on port ${port}...`));
