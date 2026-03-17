const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.get("emailUser"),
		pass: config.get("emailPassword"),
	},
});

async function sendInvitationEmail({ to, businessName, region, token }) {
	try {
		const invitationUrl = `${config.get(
			"frontendUrl"
		)}/distributor/signup?token=${token}`;

		const mailOptions = {
			from: `"${config.get("companyName")}", <${config.get("emailUser")}>`,
			to: to,
			subject: "Invitation to join as a distributor",
			text: `
                  You have been invited to join as a distributor!
            
                  Business Name: ${businessName}
                  Assigned Region: ${region}
            
                  Complete your registration by visiting this link:
                  ${invitationUrl}
            
                  This invitation will expire in 7 days.
         `,
			html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                     <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">
                        You've Been Invited!
                     </h2>
                     
                     <p style="font-size: 16px; color: #555;">
                        You have been invited to join our distribution network as an authorized distributor.
                     </p>
                     
                     <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Business Name:</strong> ${businessName}</p>
                        <p style="margin: 5px 0;"><strong>Assigned Region:</strong> ${region}</p>
                     </div>
                     
                     <p style="font-size: 16px; color: #555;">
                        Click the button below to complete your registration:
                     </p>
                     
                     <div style="text-align: center; margin: 30px 0;">
                        <a href="${invitationUrl}" 
                           style="background-color: #007bff; color: white; padding: 14px 30px; 
                                 text-decoration: none; border-radius: 5px; display: inline-block;
                                 font-weight: bold;">
                           Complete Registration
                        </a>
                     </div>
                     
                     <p style="color: #888; font-size: 14px; margin-top: 30px;">
                        This invitation will expire in 7 days. If you didn't expect this invitation, 
                        you can safely ignore this email.
                     </p>
                     
                     <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                        Or copy and paste this link into your browser:<br>
                        ${invitationUrl}
                     </p>
                  </div>
      `,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully: ", info.messageId);
      return {success: true, messageId: info.messageId}
	} catch (error) {
		console.error("Error sending email:", error);
		throw new Error(`Failed to send email: ${error.message}`);
	}
}

module.exports = { sendInvitationEmail };
