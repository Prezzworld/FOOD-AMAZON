import React from "react";
import { Link } from "react-router-dom";
import { Logo, CompaniesLogo, TrustpilotLogo, Stars } from "../pages/Images";

const Footer = ({ iconsDisplay }) => {
	const footerElem = [
		{
			title: "Customer Service",
			links: ["Order Lookup", "Bulk Order", "Shipping & Delivery", "Discounts"],
		},
		{
			title: "About Us",
			links: [
				"News & Blog",
				"Suppliers",
				"Terms & Conditions",
				"Privacy Policy",
			],
		},
		{
			title: "Need Help?",
			links: ["Contact Us", "FAQs"],
		},
		{
			title: "Privacy",
			links: ["Terms & Conditions", "Privacy Policy"],
		},
		{
			title: "Follow Us",
			links: ["fab fa-facebook-f", "fab fa-linkedin-in", "fab fa-twitter"],
		},
	];

	return (
		<>
			<div id="footer">
				<div className="container py-5">
					<div className="footer-top-content pb-5 text-center">
						<h3 className="text-white fw-medium font-nichrome">Excellent</h3>
						<div className="stars my-3">
							<img src={Stars} alt="" className="img-fluid" />
						</div>
						<p className="font-inter text-white mb-0 fw-normal fs-5">
							Based on <span className="pb-3">13,586 reviews</span>
						</p>
						<div className="trustPilotLogo mt-4">
							<img src={TrustpilotLogo} alt="" className="img-fluid" />
						</div>
					</div>
					<div className="footer-grid row g-4 g-lg-0 justify-content-lg-between py-5">
						{footerElem.map((item, index) => (
							<ul key={index} className="ps-0 col-12 col-md-4 col-lg-2">
								<h4 className="font-nicrome fw-medium text-white mb-3 mb-md-4">
									{item.title}
								</h4>
								{item.links.map((link, key) =>
									iconsDisplay && index === footerElem.length - 1 ? (
										<li
											key={key}
											className="list-unstyled mb-3 font-inter fw-light fs-6 d-inline-block me-1"
										>
											<Link className="text-decoration-none text-danger p-2 bg-secondary-normal">
												<i className={`${link} text-white`}></i>
											</Link>
										</li>
									) : (
										<li
											key={key}
											className="list-unstyled mb-3 font-inter fw-light fs-6"
										>
											<Link className="text-decoration-none">{link}</Link>
										</li>
									),
								)}
							</ul>
						))}
					</div>
				</div>
				<div className="footer-bottom py-4">
					<div className="container px-0">
						<div className="row g-3 align-items-center text-center text-md-start">
							<div className="footer-logo col-12 col-md-4">
								<img src={Logo} alt="" className="img-fluid" />
							</div>
							<div className="payment-companies mx-auto col-12 col-md-4">
								<img src={CompaniesLogo} alt="" className="img-fluid " />
							</div>
							<div className="copyright col-12 col-md-4">
								<p className="fw-normal font-inter text-main-accent">
									Copyright © 2024 FoodieAmazon. All Rights Reserved
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Footer;
