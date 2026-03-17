import React from "react";
import VerifyAuth from "../components/VerifyAuth";

const PasswordReset = () => {
	return (
		<>
			<VerifyAuth
				titleHeading="Password Reset"
				titleDescription="We will help you reset your password"
				labelText="Email"
				placeholderText="Enter Email Address"
				firstBtnText="Reset Password"
				secondBtnText="Back to Sign In"
				questionParagraphText="Remembered your Password?"
			/>
		</>
	);
};

export default PasswordReset;
