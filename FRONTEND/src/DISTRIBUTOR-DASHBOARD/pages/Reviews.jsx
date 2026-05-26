import React, { useState, useEffect } from "react";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import { GoTriangleDown, GoTriangleUp, GoHome, GoTriangleRight } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import {formatMongoDate} from "../../utils/dateFormatter"
import { RiFilterLine } from "react-icons/ri";
// import {showAlert} from ""

const Reviews = () => {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(false);
	const [bestWorstRated, setBestWorstRated] = useState([]);
	const [reviewType, setReviewType] = useState("latest");

	const fetchReviews = async () => {
		try {
			setLoading(true);
			// let params = new URLSearchParams();

			const response = await distributorAxiosInstance.get(
				`/food-amazon-database/review/all-reviews-for-distributor?${reviewType}=true`,
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
	}, [reviewType]);

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
			<div className="review-compare bg-white rounded-3 py-3 px-2">
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
			<div className="">
				<div className="filters d-flex align-items-center justify-content-between mt-5 mb-3">
					<div className="bg-white px-3 py-2 d-flex gap-2 rounded-2">
						<button
							onClick={() => setReviewType("latest")}
							className={`px-4 py-1 rounded-2 ${reviewType === "latest" ? "bg-primary-normal text-white" : "bg-transparent text-black"} border-0 cursor-pointer font-archivo fw-normal fs-sm`}
						>
							Latest
						</button>
						<button
							onClick={() => setReviewType("published")}
							className={`px-4 py-1 rounded-2 ${reviewType === "published" ? "bg-primary-normal text-white" : "bg-transparent text-black"} border-0 cursor-pointer font-archivo fw-normal fs-sm`}
						>
							Published
						</button>
					</div>
					<div>
						<button className="bg-white px-3 py-2 rounded-2 border-0 cursor-pointer font-archivo fw-normal text-black fs-sm">
							Filters{" "}
							<span className="ms-1">
								<RiFilterLine />
							</span>
						</button>
					</div>
				</div>
				<div className="review-cards-display">
					<div className="reviews row g-4">
						{reviews.map((review) => (
							<div
								key={review._id}
								className="review-card col-12 col-md-6 d-flex align-items-start"
							>
								<div className="d-flex align-items-center gap-1">
									<div
										className="reviewer-img p-1 rounded-circle"
										style={{
											width: "50px",
											height: "50px",
											border: `1px solid #00a859`,
										}}
									>
										<div className="w-100 h-100 rounded-circle bg-grey-light"></div>
									</div>
									<GoTriangleRight className="text-primary-normal" />
								</div>
								<div className="review-details bg-white rounded-3 p-4 w-100">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<p className="font-inter text-black fw-medium">
											{review.reviewerName}
										</p>
										<p className="text-grey font-inter fs-sm fw-light">
											{formatMongoDate(review.createdAt)}
										</p>
									</div>
									<div
										className="d-flex align-items-center justify-content-between mb-3"
										style={{ maxWidth: "100%", width: "100%" }}
									>
										<p className="text-red-light fw-normal fs-sm font-archivo">
											<span>
												<GoHome />
											</span>{" "}
											{review.productName}
										</p>
										<div className="d-flex align-items-center gap-2">
											{renderRatingStars(review.rating)}
										</div>
									</div>
									<p className="text-red-light fw-normal fs-sm font-archivo mb-3">
										{review.headline}
									</p>
									<p className="font-archivo fs-sm fw-normal text-black mb-3">
										{review.comment}
									</p>
									<button className={`w-100 border-0 py-3 rounded-2 ${review.status === "published" ? "bg-secondary-normal" : "bg-primary-normal"} font-inter text-white fw-semibold`}>
										{review.status === "published" ? ("Unpublish") : ("Publish to website")}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Reviews;
