const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

console.log("🔍 Checking Cloudinary Config:");
console.log(
	"Cloud Name:",
	process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ Missing"
);
console.log(
	"API Key:",
	process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log(
	"API Secret:",
	process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing"
);

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	timeout: 60000,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "food-amazon/products", // Folder name in Cloudinary
		allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"], // Allowed formats
		transformation: [{ width: 800, height: 800, crop: "limit" }], // Resize images
		timeout: 60000,
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB max file size
	},
	fileFilter: (req, file, cb) => {
		// Check file type
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Not an image! Please upload an image file."), false);
		}
	},
});

module.exports = {cloudinary, upload};