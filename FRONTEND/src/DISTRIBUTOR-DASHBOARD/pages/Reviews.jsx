import React, {useState, useEffect} from 'react';
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
// import {showAlert} from ""

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true); 
      const response = await distributorAxiosInstance.get(`/food-amazon-database/review/all-reviews-for-distributor`);
      console.log("Distributor reviews: ", response.data.data);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [])

  return (
    <div>
      <h2 className="font-archivo text-dark-blue fw-semibold fs-2 mb-3">Reviews</h2>
      <div className="review-compare bg-white rounded-3 py-5 px-4">
        <div className="row">
          <div className="col-12 col-md-6">
            <h3>Top Rated</h3>
          </div>
          <div className="col-12 col-md-6"></div>
        </div>
      </div>
    </div>
  )
}

export default Reviews
