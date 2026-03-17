const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Product, validate } = require("../models/product");
const { Category } = require("../models/category");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { cloudinary, upload } = require("../config/cloudinary");

router.get("/", async (req, res) => {
	try {
		console.log("📥 Query params:", req.query);
		const {
			popular,
			newest,
			hasOffer,
			category,
			bulkOrderEligible,
			limit = 10,
			page = 1,
		} = req.query;

		let query = {};
		console.log("🔍 MongoDB query:", query);

		let sortOptions = {};

		if (category) {
			query["category._id"] = category;
		}

		if (popular === "true") {
			query.rating = { $gte: 4 };
		}

		if (hasOffer === "true") {
			query.discountPrice = { 
				$exists: true, 
				$ne: null,
				$gt: 0 
			};
		}

		if(bulkOrderEligible === "true") {
			query.bulkOrderEligible = true;
		}

		// Sorting
		if (newest === "true") {
			sortOptions.createdAt = -1; // Newest first
		} else if (popular === "true") {
			sortOptions.rating = -1; // Highest rated first
		} else {
			sortOptions.name = 1; // Default: alphabetical
		}

		// Pagination
		const skip = (page - 1) * parseInt(limit);

		const products = await Product.find(query)
			.sort(sortOptions)
			.limit(parseInt(limit))
			.skip(skip);

		const total = await Product.countDocuments(query);

		console.log("✅ Found products:", products.length);
		res.json({
			success: true,
			products,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / parseInt(limit)),
			},
		});
	} catch (error) {
		console.error("Error fetching products: ", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch products",
			error: error.message,
		});
	}
});

const uploadImageFromUrl = async (imageUrl) => {
	try {
		if (!imageUrl || typeof imageUrl !== "string") {
			throw new Error("Invalid image URL provided");
		}

		const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
		const hasImageExtension = imageExtensions.some((ext) =>
			imageUrl.toLowerCase().includes(ext)
		);

		if (!hasImageExtension) {
			throw new Error("URL does not appear to point to an image file");
		}

		console.log("📥 Fetching image from URL:", imageUrl);

		const response = await axios.get(imageUrl, {
			responseType: "arraybuffer",
			timeout: 60000, // 1 minute timeout in case the external server is slow
			maxContentLength: 5 * 1024 * 1024, // Max 5MB
		});

		const base64Image = Buffer.from(response.data, "binary").toString("base64");

		const contentType = response.headers["content-type"];
		const base64String = `data:${contentType};base64,${base64Image}`;

		console.log("☁️ Uploading to Cloudinary...");

		const uploadResult = await cloudinary.uploader.upload(base64String, {
			folder: "food-amazon/products",
			resource_type: "auto", // Auto-detect if it's an image
		});

		console.log("✅ Upload successful:", uploadResult.secure_url);

		return {
			url: uploadResult.secure_url,
			publicId: uploadResult.public_id,
		};
	} catch (error) {
		if (error.code === "ENOTFOUND") {
			throw new Error(
				"Could not reach the image URL - please check the URL is valid"
			);
		} else if (error.code === "ETIMEDOUT") {
			throw new Error(
				"Image download timed out - the external server may be slow"
			);
		} else if (error.response && error.response.status === 404) {
			throw new Error("Image not found at the provided URL (404 error)");
		} else if (error.message.includes("File size too large")) {
			throw new Error("Image is too large - must be under 5MB");
		} else {
			throw new Error(`Failed to fetch/upload image: ${error.message}`);
		}
	}
};

router.post(
	"/upload-image",
	[auth, admin, upload.single("image")],
	async (req, res) => {
		try {
			console.log("📤 Upload request received");
			console.log("📎 File:", req.file);
			console.log("👤 User:", req.user);

			if (!req.file) {
				return res
					.status(400)
					.json({ success: false, message: "No image file provided" });
			}

			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "food-amazon/products",
				timeout: 60000,
			});

			res.json({
				success: true,
				message: "Image uploaded successfully",
				imageUrl: result.secure_url, // Cloudinary URL
				publicId: result.public_id, // Cloudinary public_id
			});
		} catch (error) {
			console.error("🔴 UPLOAD ERROR:", error);
			console.error("🔴 ERROR DETAILS:", {
				message: error.message,
				stack: error.stack,
				name: error.name,
			});

			console.error("Error uploading image:", error);
			res.status(500).json({
				success: false,
				message: "Failed to upload image",
				error: error.message,
			});
		}
	}
);

router.post(
	"/add-product",
	[auth, admin, upload.single("image")],
	async (req, res) => {
		try {
			console.log("📝 Add product request received");
			console.log("📎 Has file upload:", !!req.file);
			console.log("🔗 Has image URL:", !!req.body.imageUrl);

			const { error } = validate(req.body);
			if (error) return res.status(400).send(error.details[0].message);

			const category = await Category.findById(req.body.categoryId);
			if (!category) return res.status(400).send("Invalid category");

			if (!req.file && !req.body.imageUrl) {
				return res.status(400).json({
					success: false,
					message: "Please provide either an image file or an image URL",
				});
			}

			let productImageUrl = null;
			let productImagePublicId = null;

			if (req.file) {
				console.log("📤 Processing uploaded file");
				// Multer already uploaded this to Cloudinary for us
				productImageUrl = req.file.path;
				productImagePublicId = req.file.filename;
			} else if (req.body.imageUrl) {
				console.log("🔗 Processing image URL");

				const uploadedImage = await uploadImageFromUrl(req.body.imageUrl);
				productImageUrl = uploadedImage.url;
				productImagePublicId = uploadedImage.publicId;
			} else {
				return res.status(400).json({
					success: false,
					message: "Please provide either an image file or an image URL",
				});
			}

			let product = new Product({
				name: req.body.name,
				price: req.body.price,
				discountPrice: req.body.discountPrice || null,
				category: {
					_id: category._id,
					name: category.name,
				},
				varieties: req.body.varieties,
				description: req.body.description,
				inStock: req.body.inStock,
				rating: req.body.rating,
				productImg: productImageUrl, // ✅ Cloudinary URL
				imagePublicId: productImagePublicId,
				bulkOrderEligible: req.body.bulkOrderEligible || false,
				bulkDescription: req.body.bulkDescription || '',
				minimumBulkQuantity: req.body.minimumBulkQuantity || 50
			});

			product = await product.save();

			res.json({
				status: "Success",
				message: "Product successfully added",
			});
		} catch (error) {
			console.error("🔴 Error adding product:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add product",
				error: error.message,
			});
		}
	}
);

router.put(
	"/update-product/:id",
	[auth, admin, upload.single("image")],
	async (req, res) => {
		try {
			console.log("📝 Update request received");
			console.log("📎 Has file upload:", !!req.file);
			console.log("🔗 Has image URL:", !!req.body.imageUrl);

			const { error } = validate(req.body);
			if (error) return res.status(400).send(error.details[0].message);

			const category = await Category.findById(req.body.categoryId);
			if (!category)
				return res.status(404).send("Category with the given ID not found");

			const existingProduct = await Product.findById(req.params.id);
			if (!existingProduct)
				return res.status(404).send("Product with the given ID not found");

			let newImageUrl = null;
			let newImagePublicId = null;

			// PATH 1: User uploaded a file through form-data
			if (req.file) {
				console.log("📤 Processing uploaded file");
				newImageUrl = req.file.path;
				newImagePublicId = req.file.filename;

				// Delete old image from Cloudinary if it exists
				if (existingProduct.imagePublicId) {
					console.log("🗑️ Deleting old image from Cloudinary");
					await cloudinary.uploader.destroy(existingProduct.imagePublicId);
				}
			} else if (req.body.imageUrl) {
				console.log("🔗 Processing image URL");

				// Use our helper function to download and upload the image
				const uploadedImage = await uploadImageFromUrl(req.body.imageUrl);
				newImageUrl = uploadedImage.url;
				newImagePublicId = uploadedImage.publicId;

				// Delete old image from Cloudinary if it exists
				if (existingProduct.imagePublicId) {
					console.log("🗑️ Deleting old image from Cloudinary");
					await cloudinary.uploader.destroy(existingProduct.imagePublicId);
				}
			} else {
				console.log("📷 No new image, keeping existing");
				newImageUrl = existingProduct.productImg;
				newImagePublicId = existingProduct.imagePublicId;
			}

			const product = await Product.findByIdAndUpdate(
				req.params.id,
				{
					name: req.body.name,
					price: req.body.price,
					discountPrice: req.body.discountPrice || null,
					category: {
						_id: category._id,
						name: category.name,
					},
					varieties: req.body.varieties,
					description: req.body.description,
					inStock: req.body.inStock,
					rating: req.body.rating,
					productImg: newImageUrl,
					imagePublicId: newImagePublicId,
					bulkOrderEligible: req.body.bulkOrderEligible || false,
					bulkDescription: req.body.bulkDescription || '',
					minimumBulkQuantity: req.body.minimumBulkQuantity || 50
				},
				{ new: true }
			);

			res.json({
				status: "Success",
				message: "Product updated successfully",
				product,
			});
		} catch (error) {
			console.error("Error updating product:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update product",
				error: error.message,
			});
		}
	}
);

router.delete("/delete-product/:id", [auth, admin], async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product)
			return res
				.status(404)
				.send("The product with the given id was not found");

		try {
			if (product.imagePublicId) {
				await cloudinary.uploader.destroy(product.imagePublicId);
			}
		} catch (err) {
			console.error("Error deleting image from Cloudinary:", err);
			return res.status(500).json({
				success: false,
				message:
					"Product found, but failed to delete associated image from Cloudinary.",
				error: err.message,
			});
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({
			status: "Success",
			message: "Product has been deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting product:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete product",
			error: error.message,
		});
	}
});

router.get("/get-single-product/:id", async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product)
		return res.status(404).send("The product with the given id was not found");

	res.send(product);
});

module.exports = router;
