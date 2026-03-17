import React from "react";
import VerifyAuth from "../components/VerifyAuth";

const ConfirmEmail = () => {
	return (
		<>
			<VerifyAuth
				titleHeading="Confirm Email"
				titleDescription="Check your email and enter confirmation code"
				labelText="Confirmation Code"
				placeholderText="Enter Code"
				firstBtnText="Confirm Email"
				secondBtnText="Resend Code"
				questionParagraphText="Haven't received your code?"
			/>
		</>
	);
};

export default ConfirmEmail;
