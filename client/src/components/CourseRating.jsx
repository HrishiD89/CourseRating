import React from "react";
import { useState, useEffect } from "react";
import authInstance from "../utils/axiosInstance";

const CourseRating = ({ course, setCourse }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rated, setRated] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's rating when component mounts
  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const res = await authInstance.get(`/courses/rating/${course._id}`);
        if (res.data.rated) {
          setRated(true);
          setUserRating(res.data.userRating);
        }
      } catch (err) {
        console.error("Error fetching user rating:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRating();
  }, [course._id]);

  const handleRating = (e) => {
    setRating(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authInstance.post(`/courses/rate/${course._id}`, {
        rating,
        review,
      });

      // Update course average rating
      setCourse({
        ...course,
        rating: res.data.rating,
        noOfRating: res.data.noOfRating,
      });

      // Update local state
      setRated(true);
      setUserRating(res.data.userRating);
      alert(res.data.message);
      setRating(0);
      setReview("");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="w-full mt-4 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="w-full mt-4">
      {rated ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 font-semibold mb-2">
            ✓ You have already rated this course
          </p>
          <div className="space-y-1">
            <p className="text-gray-700">
              <span className="font-medium">Your rating:</span>{" "}
              <span className="text-yellow-500">
                {"★".repeat(userRating?.rating || 0)}
              </span>{" "}
              ({userRating?.rating}/5)
            </p>
            {userRating?.review && (
              <p className="text-gray-700">
                <span className="font-medium">Your review:</span>{" "}
                {userRating.review}
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-4 items-center">
            <p className="text-gray-600 text-sm font-medium">
              Rate this course:
            </p>
            {[1, 2, 3, 4, 5].map((value) => {
              return (
                <label
                  key={value}
                  className="flex items-center space-x-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    onChange={handleRating}
                    value={value}
                    checked={rating == value}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">{value}</span>
                </label>
              );
            })}
          </div>
          <div>
            <textarea
              className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="review"
              id="review"
              onChange={(e) => setReview(e.target.value)}
              value={review}
              placeholder="Write your review here... (optional)"
              rows="3"
            ></textarea>
          </div>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CourseRating;
