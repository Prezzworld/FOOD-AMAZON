import React from "react";
import "../pages/distributorAuth.css";

const VerifyAuth = ({
	titleHeading,
	titleDescription,
	labelText,
	placeholderText,
	firstBtnText,
	secondBtnText,
	questionParagraphText,
}) => {
	return (
		<>
			<div className="body">
				<div className="container">
					<form className="form-verify bg-white mx-auto rounded-5">
						<div className="form-heading text-center">
							<h1 className="text-dark-blue font-archivo fw-bold mb-2">
								{titleHeading}
							</h1>
							<p className="font-inter fs-6 fw-normal text-content-dark">
								{titleDescription}
							</p>
						</div>
						<div className="form-fields">
							<div className="mb-4">
								<label
									htmlFor="email"
									className="form-label font-archivo fs-sm text-dark-blue fw-medium mb-2"
								>
									{labelText}
								</label>
								<input
									type="email"
									className="form-control light-bordered rounded-1 font-inter fw-normal fs-6 text-content-dark placeholder-style"
									id="email"
									placeholder={placeholderText}
								/>
							</div>
							<div className="mb-5">
								<button className="bg-primary-normal text-white border-0 font-archivo fw-semibold fs-6 rounded-1 d-inline-block w-100 py-3">
									{firstBtnText}
								</button>
							</div>
							<hr />
							<p className="font-inter fw-normal fs-sm signin-text text-center mt-3">
								{questionParagraphText}
							</p>
							<div className="mb-4 mt-5">
								<button className="bg-transparent google-signin-btn border-1 font-archivo fw-semibold fs-6 text-dark-blue rounded-1 d-inline-block w-100 py-3">
									{secondBtnText}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default VerifyAuth;
