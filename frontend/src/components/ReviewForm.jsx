import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { addReview, updateReview, deleteReview } from "../services/reviewService";

const ReviewForm = ({ styleId, onAdded, onUpdated, onDeleted, existingReview = null, onCancel }) => {
  const { user, getToken } = useAuth();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const isEditing = Boolean(existingReview);

  useEffect(() => {
    if (existingReview) {
      setText(existingReview.text || "");
      setRating(existingReview.rating || 5);
    }
  }, [existingReview]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!user) {
      setError("Please login to post a review.");
      return;
    }
    
    if (!text.trim()) {
      setError("Please write a review before submitting.");
      return;
    }

    if (text.trim().length < 10) {
      setError("Review must be at least 10 characters long.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      if (isEditing) {
        const updated = await updateReview(existingReview._id, { text: text.trim(), rating }, token);
        setSuccess("Review updated successfully!");
        onUpdated && onUpdated(updated);
        setTimeout(() => onCancel && onCancel(), 1500);
      } else {
        const created = await addReview(styleId, { text: text.trim(), rating }, token);
        setText("");
        setRating(5);
        setSuccess("Review posted successfully!");
        onAdded && onAdded(created);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to save review");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      await deleteReview(existingReview._id, token);
      setSuccess("Review deleted successfully!");
      onDeleted && onDeleted(existingReview._id);
      setTimeout(() => onCancel && onCancel(), 1000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete review");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    const stars = [];
    const displayRating = interactive ? (hoverRating || rating) : currentRating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          className={`text-2xl transition-all duration-200 ${
            interactive 
              ? 'hover:scale-110 cursor-pointer' 
              : 'cursor-default'
          } ${
            i <= displayRating 
              ? 'text-amber-400 hover:text-amber-500' 
              : 'text-gray-300 hover:text-amber-300'
          }`}
          onClick={() => interactive && setRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
        <div className="text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-4">You need to be logged in to write a review.</p>
          <a 
            href="/login" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
          >
            <span>🚀</span>
            <span>Login to Review</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span className="text-xl">{isEditing ? "✏️" : "✍️"}</span>
          <span>{isEditing ? "Edit Review" : "Write a Review"}</span>
        </h3>
      </div>

      <div className="p-6">
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-2">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-2">✅</span>
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Your Rating
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {renderStars(rating, true)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </span>
                <span className="text-xs text-gray-500">
                  {rating === 5 && "Excellent!"}
                  {rating === 4 && "Good"}
                  {rating === 3 && "Average"}
                  {rating === 2 && "Poor"}
                  {rating === 1 && "Bad"}
                </span>
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Your Review
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              placeholder="Share your experience with this hijab style... What did you like? How was the quality? Any styling tips?"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Minimum 10 characters required</span>
              <span className={`${text.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {text.length}/500
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => onCancel && onCancel()}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim() || text.trim().length < 10}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditing ? "Updating..." : "Posting..."}</span>
                </>
              ) : (
                <>
                  <span>{isEditing ? "💾" : "🚀"}</span>
                  <span>{isEditing ? "Update Review" : "Post Review"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Review?</h3>
                  <p className="text-gray-600">This action cannot be undone. Your review will be permanently deleted.</p>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <span>🗑️</span>
                        <span>Delete Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Posting as {user.name || user.email}
              </span>
              <div className="text-xs text-gray-400">
                {isEditing ? "Editing your review" : "Your review will be visible to other users"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;