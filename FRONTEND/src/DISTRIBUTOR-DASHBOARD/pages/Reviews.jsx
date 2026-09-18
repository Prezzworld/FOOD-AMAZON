import React, { useState, useEffect, useRef } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import {
  GoTriangleDown,
  GoTriangleLeft,
  GoTriangleRight,
  GoTriangleUp,
  GoHome,
} from "react-icons/go";
import { FaStar } from "react-icons/fa";
import {
  BsRepeat,
  BsRepeat1,
  BsCheckCircle,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { FiX } from "react-icons/fi";
import { formatMongoDate } from "../../utils/dateFormatter";
import { RiFilterLine, RiChatNewLine } from "react-icons/ri";
import FilterDropdown from "../components/FilterDropdown";
import SubFilterModal from "../components/SubFilterModal";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import "./review.css";

const FILTER_KEY_MAP = {
  Date: "days",
  Rating: "rating",
  Product: "productId",
  Status: "status",
};

const ITEMS_PER_PAGE = 10;

const fetchReviews = async ({ reviewType, activeFilters, page }) => {
  const params = new URLSearchParams();
  params.set(reviewType, "true");

  if (activeFilters.rating) params.set("rating", activeFilters.rating);
  if (activeFilters.status) params.set("status", activeFilters.status);
  if (activeFilters.date) params.set("date", activeFilters.date);
  if (activeFilters.productId)
    params.set("productId", activeFilters.productId);

  params.set("page", page);
  params.set("limit", ITEMS_PER_PAGE);

  const response = await distributorAxiosInstance.get(
    `/food-amazon-database/review/all-reviews-for-distributor?${params.toString()}`,
  );
  if (!response.data.success) {
    throw new Error("Failed to load reviews. Please try again.");
  }
  return {
    reviews: response.data.data,
    topRated: response.data.topRated,
    worstRated: response.data.worstRated,
    pagination: response.data.pagination,
  };
};

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewType, setReviewType] = useState("latest");
  const [filterOptions, setFilterOptions] = useState(false);
  const [activeSubFilter, setActiveSubfilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [statusModalData, setStatusModalData] = useState(null);
  const filterDropdownRef = useRef(null);

  const closeStatusModal = () => setStatusModalData(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideDropdown = filterDropdownRef.current?.contains(
        e.target,
      );
      if (!clickedInsideDropdown) {
        setFilterOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryClient = useQueryClient();

  const { data, isPending: loading, error, refetch } = useQuery({
    queryKey: ["reviews", reviewType, activeFilters, currentPage],
    queryFn: () =>
      fetchReviews({ reviewType, activeFilters, page: currentPage }),
    placeholderData: keepPreviousData,
  });

  const reviews = data?.reviews ?? [];
  const totalReviews = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.pages ?? 1;

  const bestWorstRated = [
    {
      label: "Top Rated",
      icon: <GoTriangleUp className="text-primary-normal" />,
      review: data?.topRated,
    },
    {
      label: "Worst Rated",
      icon: <GoTriangleDown className="text-red-dark" />,
      review: data?.worstRated,
    },
  ];

  const updateReviewStatus = useMutation({
    mutationFn: ({ reviewId, newStatus }) =>
      distributorAxiosInstance.patch(
        `/food-amazon-database/review/update-review/${reviewId}/status`,
        { status: newStatus },
      ),
    onSuccess: (response, { reviewId, newStatus }) => {
      queryClient.setQueryData(
        ["reviews", reviewType, activeFilters, currentPage],
        (old) =>
          old
            ? {
                ...old,
                reviews: old.reviews.map((review) =>
                  review._id === reviewId
                    ? { ...review, status: newStatus }
                    : review,
                ),
              }
            : old,
      );
      const updatedReview = response.data.review;
      setStatusModalData({
        title:
          updatedReview.status === "published"
            ? "Review Published Successfully"
            : "Review Unpublished Successfully",
        message: `${updatedReview.reviewerName}'s review has been ${
          updatedReview.status === "published" ? "published" : "unpublished"
        }`,
      });
    },
    onError: () =>
      setStatusModalData({
        title: "Couldn't update review",
        message:
          "Something went wrong while updating the review status. Please try again.",
      }),
  });

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) {
      pages.push("left-ellipsis");
    }

    for (let page = left; page <= right; page += 1) {
      pages.push(page);
    }

    if (right < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);
    return pages;
  };

  const goToPage = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const fromItem =
    totalReviews === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const toItem = Math.min(currentPage * ITEMS_PER_PAGE, totalReviews);

  const handleFilterRowClick = (menuItem) => {
    setActiveSubfilter(menuItem);
    setFilterOptions(true);
  };

  const handleApplyFilter = (value) => {
    const key = FILTER_KEY_MAP[activeSubFilter];
    if (value !== null && value !== undefined) {
      setActiveFilters((prev) => ({ ...prev, [key]: value }));
    } else {
      setActiveFilters((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }

    setActiveSubfilter(null);
    setFilterOptions(false);
  };

  const handleCancelFilter = () => {
    setActiveSubfilter(null);
  };

  const removeFilter = (key) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const resetAllFilters = () => setActiveFilters({});

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

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorBanner message={error.message} onRetry={refetch} />
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState
          icon={BsRepeat1}
          title="No reviews found"
          description="There are no reviews to show for this distributor or selected filters. Return to the default reviews view or refresh to try again."
          actions={[
            {
              label: "Clear filters",
              onClick: () => {
                setActiveFilters({});
                setReviewType("latest");
                setCurrentPage(1);
                setFilterOptions(false);
              },
            },
            {
              label: "Refresh reviews",
              onClick: () => refetch(),
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <div>
          <h2 className="font-archivo text-dark-blue fw-semibold fs-2 mb-3">
            Reviews
          </h2>
          {reviewType !== "published" && (
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
                          {renderAverageRatingStars(
                            rate.review.productId.rating,
                          )}
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
          )}
          <div className="">
            <div
              className={`filters d-flex align-items-center justify-content-between ${reviewType === "published" ? "mt-3" : "mt-5"} mb-3`}
            >
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
              <div className="position-relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setFilterOptions((prev) => !prev)}
                  className="bg-white px-3 py-2 rounded cursor-pointer font-archivo fw-normal text-black fs-sm"
                  style={{ border: "1px solid #f1f1f1" }}
                >
                  Filters{" "}
                  {activeFilterCount > 0 && (
                    <span className="filter-badge">{activeFilterCount}</span>
                  )}
                  <span className="ms-1">
                    <RiFilterLine />
                  </span>
                </button>
                {filterOptions && (
                  <FilterDropdown
                    activeFilters={activeFilters}
                    onFilterClick={handleFilterRowClick}
                    onClose={() => setFilterOptions(false)}
                    onReset={resetAllFilters}
                    activeSubFilter={activeSubFilter}
                  />
                )}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                <span className="font-archivo fs-xsm text-content-dark">
                  Active:
                </span>
                {Object.entries(activeFilters).map(([key, value]) => (
                  <span
                    key={key}
                    className="filter-chip d-inline-flex align-items-center gap-1"
                  >
                    {key}: {String(value)}
                    <button
                      onClick={() => removeFilter(key)}
                      className="bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <FiX size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="review-cards-display">
              <div className="reviews row g-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="review-card col-12 col-md-6 d-flex h-100"
                    style={{ minHeight: "330px" }}
                  >
                    <div className="d-flex align-items-center gap-1 align-self-start">
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
                    <div
                      className="review-details bg-white rounded-3 p-4 w-100 d-flex flex-column"
                      style={{ flex: 1 }}
                    >
                      <div style={{ flex: 1 }}>
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
                      </div>
                      <button
                        className={`w-100 border-0 py-3 rounded-2 ${review.status === "published" ? "bg-secondary-normal" : "bg-primary-normal"} font-inter text-white fw-semibold`}
                        onClick={() =>
                          updateReviewStatus.mutate({
                            reviewId: review._id,
                            newStatus:
                              review.status === "published"
                                ? "rejected"
                                : "published",
                          })
                        }
                      >
                        {review.status === "published"
                          ? "Unpublish"
                          : "Publish to website"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-100 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4">
              <p className="font-archivo text-content-accent mb-0 d-inline-block">{`Showing ${fromItem} - ${toItem} of ${totalReviews} items`}</p>
              <div className="pagination d-flex align-items-center justify-items-end gap-1">
                <button
                  type="button"
                  className={`pagination-button pagination-button--edge ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  <BsChevronLeft />
                </button>

                {getPageNumbers().map((page, index) =>
                  page === "left-ellipsis" || page === "right-ellipsis" ? (
                    <span
                      key={`${page}-${index}`}
                      className="pagination-ellipsis"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-button ${page === currentPage ? "active" : ""}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className={`pagination-button pagination-button--edge ${currentPage === totalPages ? "disabled" : ""}`}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  <BsChevronRight />
                </button>
              </div>
            </div>
          </div>
          {activeSubFilter && (
            <SubFilterModal
              activeSubFilter={activeSubFilter}
              currentValue={
                activeFilters[FILTER_KEY_MAP[activeSubFilter]] ?? null
              }
              onApply={handleApplyFilter}
              onCancel={handleCancelFilter}
            />
          )}
        </div>
      )}
      {statusModalData && (
        <div className="status-modal-backdrop" onClick={closeStatusModal}>
          <div
            className="status-modal-card d-flex align-items-center justify-content-center flex-column bg-white rounded-4 p-4 p-md-5 position-relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="status-modal-close"
              onClick={closeStatusModal}
              aria-label="Close review status modal"
            >
              <FiX size={18} />
            </button>
            <div className="status-modal-icon d-flex justify-content-center align-items-center mb-4">
              <RiChatNewLine size={129} className="text-red-light" />
            </div>
            <h3 className="font-archivo fw-semibold fs-4 text-dark-blue text-center mb-2">
              {statusModalData.title}
            </h3>
            <p className="text-content-dark text-center mb-0">
              {statusModalData.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Reviews;
