import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ReviewForm from "./ReviewForm";

const ReviewList = ({ reviews = [], styleId, onReviewUpdated, onReviewDeleted }) => {
  const { user } = useAuth();
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-amber-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-amber-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserDisplayName = (review) => {
    if (review.userName) return review.userName;
    if (review.userEmail) {
      const emailParts = review.userEmail.split('@');
      return emailParts[0];
    }
    return "Anonymous";
  };

  const getUserInitial = (review) => {
    const name = getUserDisplayName(review);
    return name.charAt(0).toUpperCase();
  };

  const isUserReview = (review) => {
    return user && (review.userId === user.id || review.userEmail === user.email);
  };

  const handleEditClick = (reviewId) => {
    setEditingReviewId(reviewId);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
  };

  const handleReviewUpdated = (updatedReview) => {
    setEditingReviewId(null);
    onReviewUpdated && onReviewUpdated(updatedReview);
  };

  const handleReviewDeleted = (reviewId) => {
    setEditingReviewId(null);
    onReviewDeleted && onReviewDeleted(reviewId);
  };

  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!reviews.length) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💭</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to share your experience with this hijab style!</p>
      </div>
    );
  }

  // Sort reviews - user's reviews first, then by date
  const sortedReviews = [...reviews].sort((a, b) => {
    const aIsUser = isUserReview(a);
    const bIsUser = isUserReview(b);
    
    if (aIsUser && !bIsUser) return -1;
    if (!aIsUser && bIsUser) return 1;
    
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-4">
      {sortedReviews.map((review) => {
        const isEditing = editingReviewId === review._id;
        const isExpanded = expandedReviews.has(review._id);
        const needsTruncation = review.text && review.text.length > 150;
        const displayText = isExpanded ? review.text : truncateText(review.text);

        if (isEditing) {
          return (
            <div key={review._id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
              <ReviewForm
                styleId={styleId}
                existingReview={review}
                onUpdated={handleReviewUpdated}
                onDeleted={handleReviewDeleted}
                onCancel={handleEditCancel}
              />
            </div>
          );
        }

        return (
          <div
            key={review._id}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
              isUserReview(review) 
                ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50' 
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    isUserReview(review)
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}>
                    {getUserInitial(review)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">
                        {getUserDisplayName(review)}
                      </span>
                      {isUserReview(review) && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-medium">
                          Your Review
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 bg-white rounded-lg px-3 py-1 shadow-sm border">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 ml-1">
                      {review.rating}
                    </span>
                  </div>

                  {/* Edit/Delete for user's own review */}
                  {isUserReview(review) && (
                    <button
                      onClick={() => handleEditClick(review._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Edit review"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Review Text */}
              {review.text && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {displayText}
                  </p>
                  
                  {needsTruncation && (
                    <button
                      onClick={() => toggleExpanded(review._id)}
                      className="text-rose-500 hover:text-rose-600 text-sm font-medium mt-2 flex items-center space-x-1 transition-colors duration-200"
                    >
                      <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <span>📅</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </span>
                  {review.updatedAt && review.updatedAt !== review.createdAt && (
                    <span className="flex items-center space-x-1">
                      <span>✏️</span>
                      <span>Edited</span>
                    </span>
                  )}
                </div>

                {/* Helpful/Like buttons (placeholder for future features) */}
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 text-xs transition-colors duration-200">
                    <span>👍</span>
                    <span>Helpful</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary Stats */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100 mt-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Review Summary</h4>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600">
                  {reviews.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total Reviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  Average Rating
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {renderStars(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)}
                </div>
                <div className="text-sm text-gray-600">
                  Overall Score
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;