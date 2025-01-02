"use client";
import { api } from "@/hooks/api";
import { fetchUserAvatar } from "@/server/utils/fetchUserAvatar";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import ReviewsAlert from "../ReviewsAlert";
import ConfirmationModal from "../ConfirmationModal";

interface Review {
  user: { _id: string; name: string; avatar: string };
  rating: number;
  comment: string;
  createdAt: string;
  _id: string;
}

interface Organizer {
  _id: string;
  name: string;
  email: string;
}

interface CurrentUser {
  _id: string;
  name: string;
  avatar: string;
}

interface Project {
  _id: string;
  reviews: Review[];
  organizer?: Organizer;
}

interface ProjectReviewsProps {
  project: Project | null;
  currentUser: CurrentUser | null;
}

const ProjectReviews: React.FC<ProjectReviewsProps> = ({
  project,
  currentUser,
}) => {
  const [reviews, setReviews] = useState(project?.reviews || []);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const loadAvatar = async (avatarId: string) => {
    try {
      const imageUrl = await fetchUserAvatar(avatarId);

      return imageUrl;
    } catch {
      return "https://cdn-icons-png.flaticon.com/512/3607/3607444.png";
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await fetch(`${api}/projects/${project?._id}/reviews`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews.");
      }

      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (project?._id) {
      fetchReviews();
    }
  }, [project?._id, refresh]);

  useEffect(() => {
    if (project?.reviews) {
      setReviews(project.reviews);
    }
  }, [project?.reviews]);

  useEffect(() => {
    const fetchAvatars = async () => {
      if (!project?.reviews) return;

      const avatarPromises = project.reviews.map(async (participant) => {
        const avatarId = participant.user.avatar;
        const imageUrl = await loadAvatar(avatarId);
        return { avatarId, imageUrl };
      });

      const avatars = await Promise.all(avatarPromises);
      const avatarMap = avatars.reduce(
        (acc, { avatarId, imageUrl }) => ({ ...acc, [avatarId]: imageUrl }),
        {}
      );

      setAvatarUrls(avatarMap);
    };

    fetchAvatars();
  }, [refresh]);

  useEffect(() => {
    if (currentUser) {
      const userHasReviewed = reviews.some(
        (review) => review.user._id === currentUser._id
      );
      setHasReviewed(userHasReviewed);
    }
  }, [currentUser, reviews]);

  if (!project) {
    return <p>Project not found</p>;
  }

  const handleAddReview = async () => {
    if (!currentUser) {
      setAlert({
        type: "warning",
        message: "You must be logged in to add a review.",
      });
      return;
    }

    if (newReview.comment.trim() && newReview.rating > 0) {
      try {
        setLoading(true);
        const response = await fetch(`${api}/projects/${project._id}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: newReview.rating,
            comment: newReview.comment,
            user: currentUser,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add review");
        }

        const data = await response.json();

        setReviews([...reviews, data.review]);
        setNewReview({ rating: 0, comment: "" });
        setIsModalOpen(false);
        setAlert({
          type: "success",
          message: "Review successfully added.",
        });
      } catch (error) {
        console.error("Error adding review:", error);
        setAlert({
          type: "error",
          message: "Failed to add review. Please try again.",
        });
      } finally {
        setLoading(false);
        setRefresh((prev) => !prev);
      }
    } else {
      setAlert({
        type: "warning",
        message: "Please fill in all fields before submitting.",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await fetch(
        `${api}/projects/${project?._id}/reviews/${reviewToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review.");
      }

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewToDelete)
      );
      setEditingReview(null);
      setNewReview({ rating: 0, comment: "" });
      setRefresh((prev) => !prev);
      setAlert({
        type: "info",
        message: "Review successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      setAlert({
        type: "error",
        message: "Failed to delete review. Please try again.",
      });
    } finally {
      setIsConfirmModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleEditReview = async (reviewId: string) => {
    if (!editingReview) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${api}/projects/${project?._id}/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: newReview.rating,
            comment: newReview.comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit review.");
      }

      const updatedReview = await response.json();

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === editingReview._id ? updatedReview.review : review
        )
      );
      setEditingReview(null);
      setNewReview({ rating: 0, comment: "" });
      setIsModalOpen(false);
      setAlert({
        type: "success",
        message: "Review successfully updated.",
      });
    } catch (error) {
      console.error("Error editing review:", error);
      setAlert({
        type: "error",
        message: "Failed to edit review. Please try again.",
      });
    } finally {
      setLoading(false);
      setRefresh((prev) => !prev);
    }
  };

  const formatReviewDate = (createdAt: string | undefined) => {
    if (!createdAt) {
      return "Invalid date";
    }

    try {
      return formatDistanceToNow(parseISO(createdAt), {
        addSuffix: true,
      });
    } catch (error) {
      return "Invalid date format";
    }
  };

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating(reviews);

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div className="reviews-section space-y-6 bg-gray-100 p-6 sm:p-8 md:px-12 lg:px-16">
      {isConfirmModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this review?"
          onConfirm={confirmDeleteReview}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
      {alert && (
        <ReviewsAlert
          type={alert.type}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      )}
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex justify-between items-center">
        <span>Reviews</span>
        {+averageRating !== 0 ? (
          <div className="flex items-center gap-1">
            <span
              className={`text-2xl md:text-3xl ${
                +averageRating >= 4
                  ? "text-green-400"
                  : +averageRating >= 3
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {`${averageRating}`}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 md:h-8 md:w-8 ${
                +averageRating >= 4
                  ? "text-green-400"
                  : +averageRating >= 3
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.75L6.23 21l1.13-6.59L2 9.91l6.61-.96L12 3.25l2.39 5.7 6.61.96-4.36 4.5L17.77 21z" />
            </svg>
          </div>
        ) : null}
      </h3>

      {reviews.length === 0 && project.organizer?._id !== currentUser?._id ? (
        <p className="text-gray-600 text-center">
          No reviews yet. Be the first to review this project!
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600 text-center">You are the organizer</p>
      ) : loadingReviews ? (
        <div className="h-full bg-transparent flex justify-center items-center ">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="reviews-container max-h-[60vh] md:max-h-[80vh] overflow-y-auto space-y-4">
          {reviews.map((review) => (
            <div
              key={review.createdAt}
              className="review-item p-4 md:p-6 bg-white rounded-3xl space-y-4 transform transition-all"
            >
              <div className="review-header flex items-center space-x-4 flex-col sm:flex-row">
                <Link
                  href={`/profile/${review.user.name}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full duration-200 hover:scale-95"
                >
                  <img
                    src={
                      avatarUrls[review.user.avatar] ||
                      "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
                    }
                    alt={review.user.name}
                    className="cursor-pointer avatar w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md"
                  />
                </Link>
                <div className="text-sm space-y-2 text-center sm:text-left">
                  <Link href={`/profile/${review.user.name}`}>
                    <h4 className="font-bold text-gray-800 text-base">
                      @{review.user.name}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    {[...Array(5).keys()].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-5 h-5 ${
                          index < review.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15l-5.878 3.09 1.18-6.9L.316 6.902l6.9-1.02L10 0l2.604 5.98 6.9 1.02-4.986 4.288 1.18 6.9L10 15z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                    <span className="text-gray-500 text-sm">
                      ({review.rating}/5)
                    </span>
                  </div>
                </div>
              </div>
              <p
                className="text-gray-700 mt-2 text-sm md:text-base break-words"
                style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
              >
                {review.comment}
              </p>
              <span className="text-gray-500 text-sm md:text-base block text-right">
                {formatReviewDate(review.createdAt.toString())}
              </span>
              {currentUser?._id === review.user._id && (
                <div className="review-actions flex flex-wrap space-x-4 mt-4 justify-center sm:justify-end">
                  <button
                    onClick={() => {
                      setEditingReview({
                        _id: review._id,
                        comment: review.comment,
                        rating: review.rating,
                        user: review.user,
                        createdAt: review.createdAt,
                      });
                      setNewReview({
                        rating: review.rating,
                        comment: review.comment,
                      });
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 text-white font-medium duration-150 hover:bg-teal-700 rounded-full px-4 py-2 md:px-5 md:py-2.5 shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                  >
                    Edit
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5h6m-3-3v18M7 5h6M5 7h12"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="flex items-center gap-2 bg-red-500 text-white font-medium duration-150 hover:bg-red-600 rounded-full px-4 py-2 md:px-5 md:py-2.5 shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasReviewed &&
        currentUser &&
        project.organizer?._id !== currentUser._id && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 duration-150 focus:ring-teal-500"
          >
            Add Your Review
          </button>
        )}

      {hasReviewed && (
        <p className="text-gray-600 text-center">
          You have already submitted a review for this project
        </p>
      )}

      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-11/12 sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 duration-150 text-xl md:text-2xl lg:text-3xl"
            >
              ✕
            </button>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-4">
              {editingReview ? "Edit Your Review" : "Add Your Review"}
            </h4>

            <textarea
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              placeholder="Write your comment here..."
              className="w-full p-2 sm:p-4 bg-gray-100 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
              rows={4}
            ></textarea>

            <div className="mt-4 text-center">
              <label
                htmlFor="rating"
                className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
              >
                Rate the project
              </label>

              <div className="flex space-x-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`w-6 sm:w-8 h-6 sm:h-8 cursor-pointer ${
                      newReview.rating >= star
                        ? "text-yellow-400"
                        : "text-transparent"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"
                      stroke="#fde047"
                      strokeWidth="1.5"
                      className={`cursor-pointer ${
                        newReview.rating >= star
                          ? "text-yellow-300"
                          : "transparent"
                      }`}
                    />
                  </svg>
                ))}
              </div>
            </div>

            <div className="mt-7">
              {editingReview ? (
                <button
                  onClick={() =>
                    editingReview && handleEditReview(editingReview._id)
                  }
                  className={`w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-lg text-success"></span>
                  ) : (
                    "Save changes"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAddReview}
                  className={`w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-lg text-success"></span>
                  ) : (
                    "Submit"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectReviews;
