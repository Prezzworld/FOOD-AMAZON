const express = require("express");
const router = express.Router();
const { Customer, validate } = require("../models/customer");

router.get("/", async (req, res) => {
	const customers = await Customer.find().sort("email");
	res.send(customers);
});

router.post("/add-customer", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let customer = new Customer({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		address: req.body.address,
		country: req.body.country,
		city: req.body.city,
		state: req.body.state,
		zipCode: req.body.zipCode,
		phoneNumber: req.body.phoneNumber,
		orderNote: req.body.orderNote,
	});

	customer = await customer.save();
	res.json({
		status: "Success",
		message: "Customer added successfully",
	});
});

router.put("/update-customer/:id", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const customer = await Customer.findByIdAndUpdate(
		req.params.id,
		{
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			address: req.body.address,
			country: req.body.country,
			city: req.body.city,
			state: req.body.state,
			zipCode: req.body.zipCode,
			phoneNumber: req.body.phoneNumber,
			orderNote: req.body.orderNote,
		},
		{ new: true }
   );
   
   if (!customer) return res.status(404).send("The Customer with the given ID was not found");

   res.json({
      status: "Success",
      message: "Customer updated successfully",
      customer: customer
   })
});

router.delete('/delete-customer/:id', async (req, res) => {
   const customer = await Customer.findByIdAndDelete(req.params.id);
   if (!customer) return res.status(404).send("The Customer with the given ID was not found");

   res.json({
      status: "Success",
      message: "Customer deleted successfully"
   });
});

router.get('/get-single-customer/:id', async (req, res) => {
   const customer = await Customer.findById(req.params.id);
   if (!customer) return res.status(404).send("The Customer with the given ID was not found");

   res.send(customer);
})

module.exports = router