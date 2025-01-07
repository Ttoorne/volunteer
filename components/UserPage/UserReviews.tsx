import { api } from "@/hooks/api";
import { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ru, enUS, tr } from "date-fns/locale";
import { fetchUserAvatar } from "@/server/utils/fetchUserAvatar";
import Link from "next/link";
import ReviewsAlert from "../MainComponents/ReviewsAlert";
import ConfirmationModal from "../MainComponents/ConfirmationModal";
import { userPage__translation } from "./Translation";
import { useLanguage } from "@/context/LanguageContext";

interface Review {
  _id: string;
  author: { _id: string; name: string; avatar: string };
  text: string;
  rating: number;
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  avatar: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserReviewsProps {
  token?: string;
  userName: string;
  currentUser: CurrentUser | null;
  setRefreshData: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserReviews = ({
  userName,
  currentUser,
  token,
  setRefreshData,
}: UserReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<string>("");
  const [newRating, setNewRating] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});
  const [refresh, setRefresh] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = userPage__translation[language];

  const handleUpdate = () => {
    setRefreshData((prev) => !prev);
  };

  const handleAddReview = async () => {
    if (!newReview.trim()) {
      setAlert({ type: "warning", message: t.reviewTextEmpty });
      return;
    }

    if (newRating === null) {
      setAlert({ type: "warning", message: t.selectRating });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${api}/auth/users/${userName}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newReview, rating: newRating }),
      });

      if (!response.ok) {
        throw new Error(t.failedAddReview);
      }

      const data = await response.json();
      setReviews((prevReviews) => [...prevReviews, data.review]);
      setNewReview("");
      setNewRating(null);
      setHasReviewed(true);
      const modal = document.getElementById("addModal") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      setAlert({ type: "success", message: t.reviewAddedSuccess });
    } catch (error) {
      console.error(t.failedAddReviewRetry, error);
      setAlert({
        type: "error",
        message: t.failedAddReviewRetry,
      });
    } finally {
      setLoading(false);
      setRefresh((prev) => !prev);
      handleUpdate();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await fetch(
        `${api}/auth/users/${userName}/reviews/${reviewToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t.failedDeleteReview);
      }

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewToDelete)
      );
      setNewReview("");
      setNewRating(null);
      setAlert({ type: "info", message: t.reviewDeletedSuccess });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(t.errorDeletingReview, error);
      setAlert({
        type: "error",
        message: t.failedDeleteReviewRetry,
      });
    } finally {
      handleUpdate();
      setIsModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleEditReview = async () => {
    if (!newReview.trim()) {
      setAlert({ type: "warning", message: t.reviewTextEmptyAgain });
      return;
    }

    if (newRating === null) {
      setAlert({ type: "warning", message: t.selectRatingAgain });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${api}/auth/users/${userName}/reviews/${editReview?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newReview, rating: newRating }),
        }
      );

      if (!response.ok) {
        throw new Error(t.failedUpdateReview);
      }

      const data = await response.json();

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === editReview?._id ? data.review : review
        )
      );

      const modal = document.getElementById("editModal") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      setNewRating(null);
      setAlert({ type: "success", message: t.reviewUpdatedSuccess });
    } catch (error) {
      console.error(t.errorEditingReview, error);
      setAlert({
        type: "error",
        message: t.failedEditReviewRetry,
      });
    } finally {
      setLoading(false);
      setRefresh((prev) => !prev);
      handleUpdate();
    }
  };

  const openEditModal = (review: Review) => {
    setEditReview(review);
    setNewReview(review.text);
    setNewRating(review.rating);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await fetch(`${api}/auth/users/${userName}/reviews`);
        if (!response.ok) {
          throw new Error(t.failedFetchReviews);
        }
        const data = await response.json();
        setReviews(data.reviews);

        if (currentUser) {
          const existingReview = data.reviews.find(
            (review: Review) => review.author._id === currentUser._id
          );
          setHasReviewed(!!existingReview);
        }
      } catch (error) {
        console.error(t.errorFetchingReviews, error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [userName, refresh]);

  const loadAvatar = async (avatarId: string) => {
    try {
      const imageUrl = await fetchUserAvatar(avatarId);

      return imageUrl;
    } catch {
      return "https://cdn-icons-png.flaticon.com/512/3607/3607444.png";
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const avatarPromises = reviews.map(async (review) => {
          const avatarId = review.author.avatar;
          const imageUrl = await loadAvatar(avatarId);
          return { avatarId, imageUrl };
        });

        const avatars = await Promise.all(avatarPromises);
        const avatarMap = avatars.reduce(
          (acc, { avatarId, imageUrl }) => ({ ...acc, [avatarId]: imageUrl }),
          {}
        );

        setAvatarUrls(avatarMap);
      } catch (error) {
        console.error(t.errorFetchingAvatars, error);
      }
    };

    if (reviews.length > 0) {
      fetchAvatars();
    }
  }, [reviews]);

  const formatReviewDate = (
    createdAt: string | undefined,
    language: "en" | "ru" | "tr"
  ) => {
    if (!createdAt) {
      return t.invalidDate;
    }

    try {
      let locale;

      switch (language) {
        case "ru":
          locale = ru;
          break;
        case "tr":
          locale = tr;
          break;
        default:
          locale = enUS;
          break;
      }

      return formatDistanceToNow(parseISO(createdAt), {
        addSuffix: true,
        locale,
      });
    } catch (error) {
      return t.invalidDateFormat;
    }
  };

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div className="flex flex-col lg:gap-1 shadow-lg p-8 rounded-xl bg-white border border-gray-200">
      {isModalOpen && (
        <ConfirmationModal
          message={t.confirmDeleteReview}
          onConfirm={confirmDeleteReview}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
      {alert && (
        <ReviewsAlert
          type={alert.type}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      )}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl">{t.reviews}</h2>
        <div className="divider my-4 border-gray-300"></div>
      </div>
      {loadingReviews ? (
        <div className="h-full bg-transparent flex justify-center items-center ">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review._id + review.createdAt}
                className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-300 hover:brightness-95 duration-150"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div>
                    <Link
                      href={`/profile/${review.author.name}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full duration-200 hover:scale-95"
                    >
                      <img
                        src={
                          avatarUrls[review.author.avatar] ||
                          "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
                        }
                        alt={review.author.name}
                        className="cursor-pointer avatar w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md"
                      />
                    </Link>
                    <Link
                      href={`/profile/${review.author.name}`}
                      className="ml-3"
                    >
                      <strong className="text-gray-700">
                        @{review.author.name}
                      </strong>
                    </Link>
                  </div>
                  <p
                    className={`font-semibold flex items-center ${
                      review.rating > 4
                        ? "text-green-500"
                        : review.rating >= 3
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927a1 1 0 011.902 0l1.357 4.175a1 1 0 00.95.69h4.386a1 1 0 01.592 1.806l-3.573 2.595a1 1 0 00-.364 1.118l1.357 4.175a1 1 0 01-1.537 1.118L10 13.763l-3.573 2.595a1 1 0 01-1.537-1.118l1.357-4.175a1 1 0 00-.364-1.118L2.31 9.598a1 1 0 01.592-1.806h4.386a1 1 0 00.95-.69l1.357-4.175z" />
                    </svg>
                    {review.rating} / 5
                  </p>
                </div>
                <p
                  className="mt-4 text-gray-700 break-words text-sm sm:text-base"
                  style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
                >
                  {review.text}
                </p>
                <p className="mt-3 text-xs sm:text-sm text-right text-gray-500">
                  {formatReviewDate(review?.createdAt?.toString(), language)}
                </p>

                {currentUser && currentUser._id === review.author._id && (
                  <div className="w-full flex flex-col sm:flex-row justify-end items-center gap-3 lg:gap-4 mt-4">
                    <button
                      className="mt-3 ml-2 text-blue-600 hover:text-blue-400 transition flex items-center gap-1"
                      onClick={() => {
                        openEditModal(review);
                        const modal = document.getElementById(
                          "editModal"
                        ) as HTMLDialogElement;
                        if (modal) {
                          modal.showModal();
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.293.207l-4 2a1 1 0 01-1.32-1.32l2-4a1 1 0 01.207-.293l9.9-9.9a2 2 0 012.828 0zM15 4l-1 1 1 1 1-1-1-1zm-2 2l-7.586 7.586L6 11.414 13.586 4 13 4zm-9.707 9.707l-1.414 1.414 1.293-2.586 1.414 1.414L3 16zm1.414-1.414L5 15l.586-.586L5 14l-.586.586z" />
                      </svg>
                      {t.edit}
                    </button>
                    <button
                      className="mt-3 text-red-600 hover:text-red-400 transition flex items-center gap-1"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 3a1 1 0 00-.894.553L7.382 5H4a1 1 0 100 2h.341l.605 10.444A2 2 0 006.94 19h6.12a2 2 0 001.994-1.556L15.659 7H16a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 3H9zm3 14H8V7h4v10z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t.delete}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center text-lg">
              {t.noReviewsYet}
            </p>
          )}
        </div>
      )}

      {currentUser && currentUser.name !== userName && !hasReviewed && (
        <div className="mt-6 ml-auto lg:mt-4 lg:ml-0 flex justify-center">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-lg hover:from-blue-500 hover:to-blue-700 transition-transform transform hover:scale-105"
            onClick={() => {
              const modal = document.getElementById(
                "addModal"
              ) as HTMLDialogElement;
              if (modal) {
                modal.showModal();
              }
            }}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t.addReview}
          </button>
        </div>
      )}
      {hasReviewed && (
        <p className="mt-4 text-center text-green-600 text-sm md:text-base font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block w-6 h-6 mr-2 align-text-bottom"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m-7 4h6a2 2 0 012 2v1a2 2 0 01-2 2H9a2 2 0 01-2-2v-1a2 2 0 012-2z"
            />
          </svg>
          {t.alreadyLeftReview}
        </p>
      )}

      {
        <dialog
          id="addModal"
          className="modal fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="modal-box bg-white px-8 py-6 rounded-lg shadow-lg w-full max-w-lg relative">
            {/* Close button */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-600 hover:text-red-500 duration-150 font-light text-2xl"
              onClick={() => {
                const modal = document.getElementById(
                  "addModal"
                ) as HTMLDialogElement;
                if (modal) {
                  modal.close();
                }
              }}
            >
              ✕
            </button>

            <h3 className="font-medium text-lg text-center text-gray-800 mb-6">
              {t.writeReview}
            </h3>

            {/* Textarea for review */}
            <textarea
              className="w-full min-h-44 lg:min-h-52 p-4 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              required
              maxLength={500}
              placeholder={t.writingReview}
            />
            <p
              className={`text-sm text-right ${
                newReview.length === 500 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {newReview.length}
              {t.characterLimitReview}
            </p>

            {/* Rating selector */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <select
                value={newRating ?? ""}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="p-3 border-2 border-gray-300 bg-white rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                required
              >
                <option value="" disabled className="text-gray-400">
                  {t.selectRatingReview}
                </option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} className="text-gray-800">
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              className={`mt-6 w-full px-8 py-3 text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-300 ${
                loading ? "bg-gray-500" : ""
              }`}
              onClick={handleAddReview}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                t.postReview
              )}{" "}
            </button>
          </div>
        </dialog>
      }

      {
        <dialog
          id="editModal"
          className="modal fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="modal-box bg-white sm:px-6 sm:py-4 lg:px-8 lg:py-6 rounded-lg shadow-lg w-full max-w-lg relative">
            {/* Close button */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-600 hover:text-red-500 duration-150 font-light text-2xl"
              onClick={() => {
                const modal = document.getElementById(
                  "editModal"
                ) as HTMLDialogElement;
                if (modal) {
                  modal.close();
                }
              }}
            >
              ✕
            </button>

            <h3 className="font-medium text-lg text-center text-gray-800 mb-6 sm:text-base sm:mb-4">
              {t.editReview}
            </h3>

            {/* Textarea for review */}
            <textarea
              className="w-full min-h-44 lg:min-h-52 p-4 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              required
              maxLength={500}
              placeholder="Write review..."
            />
            <p
              className={`text-sm text-right ${
                newReview.length === 500 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {newReview.length}
              {t.characterLimitReview}
            </p>

            {/* Rating selector */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <select
                value={newRating ?? ""}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="p-3 border-2 border-gray-300 bg-white rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                required
              >
                <option value="" disabled className="text-gray-400">
                  {t.selectRating}
                </option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} className="text-gray-800">
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              className={`mt-6 w-full px-8 py-3 text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-300 ${
                loading ? "bg-gray-500" : ""
              }`}
              onClick={handleEditReview}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                t.updateReview
              )}{" "}
            </button>
          </div>
        </dialog>
      }
    </div>
  );
};

export default UserReviews;
