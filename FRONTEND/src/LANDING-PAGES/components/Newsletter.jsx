import React from 'react';

const Newsletter = () => {
  return (
		<>
			<div id="newsletter" className="px-3">
				<div className="container">
					<div className="newsletter-content text-center d-flex flex-column h-100 justify-content-center align-items-center">
						<h3 className="font-nichrome text-white fw-bold mb-3">
							Subscribe Our Newsletter
						</h3>
						<p className="font-inter fs-6 fw-normal mb-4 mt-2">
							Receive latest updates on our products and many other things{" "}
							<br className="d-none d-md-block" /> every week.{" "}
						</p>
						<div className="input-field position-relative mt-3">
							<input
								type="email"
								name="email"
								id="email address"
								placeholder="Enter your email address"
								className="border-0 w-100 d-block font-inter fw-medium px-3"
							/>
							<div className="position-absolute p-1 rounded-2 bg-primary-normal d-inline-block box-shadow">
								<i className="fab fa-telegram"></i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Newsletter
