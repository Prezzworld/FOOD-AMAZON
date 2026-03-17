import React from "react";

const Number = () => {
	const numbers = [
		{ number: "1975+", text: "Total Products" },
		{ number: "2880+", text: "Satisfied Clients" },
		{ number: "3219+", text: "Product Sales" },
		{ number: "100%", text: "Guarantee" },
	];

	return (
		<>
			<div className="number-bg">
				<div className="numbers row mx-auto">
					{numbers.map((num, index) => (
						<div key={index} className="col-12 text-center col-md-6 col-lg-3">
							<h3 className="fw-medium text-white font-nichrome">
								{num.number}
							</h3>
							<p className="fs-6 fw-medium text-white font-inter">{num.text}</p>
						</div>
					))}
				</div>
			</div>
			<div className="bg-vector bg-white position-relative"></div>
		</>
	);
};

export default Number;
