const express = require('express');
const router = express.Router();
const { Category, validate } = require('../models/category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const distributor = require('../middleware/distributor');

router.get('/', async (req, res) => {
   const categories = await Category.find().sort('name');
   res.send(categories);
});

router.post('/add-category', [auth, admin], async (req, res) => {
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   let category = new Category({ name: req.body.name });
   category = await category.save();

   res.json({
      status: "success",
      message: "Category successfully added"
   });
});

router.put('/update-category/:id', [auth, admin], async (req, res) => {
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.details[0].message);
   
   const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
         name: req.body.name,
      }, { new: true }
   );

   if (!category) return res.status(404).send("Category with the given id not found");

   res.json({
      status: "success",
      message: "Updated category successfully"
   });
});

router.delete('/delete-category/:id', [auth, admin], async (req, res) => {
   const category = await Category.findByIdAndDelete(req.params.id);

   if (!category) return res.status(404).send("Category with the given id not found");

   res.json({
      status: "success",
      message: "Category successfuly deleted"
   });
});

router.get('/get-single-category/:id', auth, async (req, res) => {
   const category = await Category.findById(req.params.id);

   if (!category) return res.status(404).send("Category with the given id not found");

   res.send(category);
})

module.exports = router;