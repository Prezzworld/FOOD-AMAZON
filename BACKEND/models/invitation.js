const mongoose = require("mongoose");
const Joi = require("joi");

const invitationSchema = new mongoose.Schema({
	email: String,
	businessName: String,
	region: String,
	contactPhone: String,
	token: String, // unique invitation token
	expiresAt: Date, // 7 days from creation
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	}, // ref to super admin
	status: {
		type: String,
		enum: ["pending", "accepted", "expired"],
		default: "pending",
	},
   createdAt: {
      type: Date,
      default: Date.now
   },
});

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Invitation = mongoose.model("Invitation", invitationSchema);

function validateInvitation(invitation) {
   const schema = Joi.object({
      email: Joi.string().email().required(),
      businessName: Joi.string().min(3).required(),
      contactPhone: Joi.string().min(7).max(15).required(),
      region: Joi.string().required(),
      status: Joi.string().valid("pending", "accepted", "expired").optional(),
   })
   return schema.validate(invitation);
}

exports.Invitation = Invitation;
exports.validate = validateInvitation;
