import React from "react";
import { AboutImg } from "../pages/Images";

const About = () => {
	return (
		<>
			<div className="container py-5">
				<div className="row align-items-center">
					<div className="col-12 col-lg-5 text-center mb-4">
						<div className="image mb-4">
							<img src={AboutImg} alt="" className="img-fluid" />
						</div>
						<button className="bg-primary-normal px-4 py-2 border-0 rounded-pill text-white font-inter fw-medium about-btn">
							100% Organic
						</button>
					</div>
					<div className="col-12 col-lg-7">
						<h2 className="fs-super-large text-primary-normal font-nichrome lh-1 mb-4 text-center text-lg-start">
							HIGH QUALITY{" "}
							<span className="text-secondary-normal">ORGANIC SNACKS</span>
						</h2>
						<p className="about-text fs-6 fw-normal font-inter mb-2 px-3 px-lg-0">
							At Foodie Amazon, we believe in the power of nature to provide
							wholesome, delicious snacks. Our journey began with a simple
							mission: to bring the pure taste of nature to your doorstep. We
							are dedicated to creating snacks that are not only delicious but
							also healthy and free from artificial additives. Our major focus
							is on providing organic snacks that are made with the finest
							ingredients sourced from sustainable farms.
						</p>
						<p className="about-text fs-6 fw-normal font-inter mb-4 px-3 px-lg-0">
							Our commitment to quality means that you won't find any gums,
							preservatives, or artificial sugars in our products. Instead, we
							use natural sweeteners and preservatives to ensure that every bite
							is as healthy as it is tasty.
						</p>

						<p className="quote-text m-0 lh-1 font-inter fst-italic fw-normal ps-3 mb-4">
							Our vision is to become a household name in organic snacks, known
							for our commitment to quality and sustainability.
						</p>

						<div className="font-calligraffitti px-3 px-lg-0">
							<p className="fw-normal fs-6 quote-name mb-0">John Doe</p>
							<p className="quote-status fw-normal font-inter">Chief Executive Officer</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default About;
