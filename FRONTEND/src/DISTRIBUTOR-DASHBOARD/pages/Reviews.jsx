import React, { useState, useEffect } from "react";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import { GoTriangleDown, GoTriangleUp, GoHome } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import {formatMongoDate} from "../../utils/dateFormatter"
import { RiFilterLine } from "react-icons/ri";
// import {showAlert} from ""

const Reviews = () => {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(false);
	const [bestWorstRated, setBestWorstRated] = useState([]);
	const [reviewType, setReviewType] = useState("latest")

	const fetchReviews = async () => {
		try {
			setLoading(true);
			const response = await distributorAxiosInstance.get(
				`/food-amazon-database/review/all-reviews-for-distributor`,
			);
			console.log("Distributor reviews: ", response.data);
			if (response.data.success) {
				setReviews(response.data.data);
				setBestWorstRated([
					{
						label: "Top Rated",
						icon: <GoTriangleUp className="text-primary-normal" />,
						review: response.data.topRated,
					},
					{
						label: "Worst Rated",
						icon: <GoTriangleDown className="text-red-dark" />,
						review: response.data.worstRated,
					},
				]);
			}
		} catch (error) {
			console.error("Error fetching reviews", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReviews();
	}, []);

	const renderRatingStars = (rating) => {
		return [...Array(5)].map((_, index) => (
			<FaStar
				key={index}
				className={`${index < rating ? "text-red-light" : "text-grey-light"}`}
			/>
		));
	};

	const renderAverageRatingStars = (averageRating) => {
		const rounded = Math.round(averageRating);
		return [...Array(5)].map((_, index) => (
			<FaStar
				key={index}
				className={`${index < rounded ? "text-red-light" : "text-grey-light"}`}
			/>
		));
	};

	return (
		<div>
			<h2 className="font-archivo text-dark-blue fw-semibold fs-2 mb-3">
				Reviews
			</h2>
			<div className="review-compare bg-white rounded-3 py-3 px-2 mb-4">
				<div className="row g-5">
					{bestWorstRated
						.filter((item) => item.review)
						.map((rate) => (
							<div key={rate._id} className="col-12 col-md-6 mb-4">
								<h5 className="font-archivo text-black fw-medium fs-md1 mb-2">
									{rate.label} <span className="ms-3">{rate.icon}</span>
								</h5>
								<p className="font-archivo text-black fw-normal fs-sm mb-3">
									Average Rating - 360 Organic Foodie
								</p>
								<div className="bg-grey-lighter py-2 px-3 rounded-2 mb-3 d-inline-block">
									<div className="d-flex align-items-center gap-2">
										{renderAverageRatingStars(rate.review.productId.rating)}
									</div>
								</div>

								<div className="">
									<div
										className="d-flex align-items-center justify-content-between mb-3"
										style={{ maxWidth: "90%", width: "100%" }}
									>
										<p className="font-archivo fs-sm text-black fw-normal">
											{rate.review.reviewerName}
										</p>
										<p className="font-archivo fs-sm fw-normal text-black text-grey">
											{formatMongoDate(rate.review.createdAt)}
										</p>
									</div>
									<div
										className="d-flex align-items-center justify-content-between mb-3"
										style={{ maxWidth: "90%", width: "100%" }}
									>
										<p className="text-red-light fw-normal fs-sm font-archivo">
											<span>
												<GoHome />
											</span>{" "}
											{rate.review.productName}
										</p>
										<div className="d-flex align-items-center gap-2">
											{renderRatingStars(rate.review.rating)}
										</div>
									</div>
									<div style={{ maxWidth: "90%", width: "100%" }}>
										<p className="font-archivo fw-light fs-sm">
											{rate.review.comment}
										</p>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
			<div className="reviews">
				<div className="filters d-flex align-items-center justify-content-between">
					<div className="bg-white px-3 py-2 d-flex gap-2 rounded-2">
						<button onClick={() => setReviewType("latest")} className={`px-4 py-1 rounded-2 ${reviewType === "latest" ? "bg-primary-normal text-white" : "bg-transparent text-black"} border-0 cursor-pointer font-archivo fw-normal fs-sm`}>
							Latest
						</button>
						<button onClick={() => setReviewType("published")} className={`px-4 py-1 rounded-2 ${reviewType === "published" ? "bg-primary-normal text-white" : "bg-transparent text-black"} border-0 cursor-pointer font-archivo fw-normal fs-sm`}>
							Published
						</button>
					</div>
					<div>
						<button className="bg-white px-3 py-2 rounded-2 border-0 cursor-pointer font-archivo fw-normal text-black fs-sm">
							Filters{" "}
							<span className="ms-1">
								<RiFilterLine/>
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Reviews;
