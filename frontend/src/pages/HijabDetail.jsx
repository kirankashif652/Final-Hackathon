import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHijabStyle } from "../services/hijabService";
import { getReviewsForStyle } from "../services/reviewService";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";

const HijabDetail = () => {
  const { id } = useParams();
  const [style, setStyle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const s = await getHijabStyle(id);
      const r = await getReviewsForStyle(id);
      setStyle(s);
      setReviews(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleAdded = (newReview) => {
    // prepend new review
    setReviews((prev) => [newReview, ...prev]);
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!style) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">🧕</div>
          <p className="text-gray-600 text-lg">Style not found.</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Product Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Image Section */}
            <div className="relative">
              <img 
                src={style.image} 
                alt={style.name} 
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Content Section */}
            <div className="p-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {style.name}
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {style.description}
              </p>

              {/* Rating Section */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-800">
                      {averageRating || "0.0"}
                    </div>
                    <div className="flex items-center gap-1">
                      {averageRating ? renderStars(parseFloat(averageRating)) : renderStars(0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Based on</div>
                    <div className="text-lg font-semibold text-rose-600">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              Write a Review
            </h3>
            <ReviewForm styleId={id} onAdded={handleAdded} />
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Customer Reviews
                {reviews.length > 0 && (
                  <span className="text-sm font-normal bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                    {reviews.length}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="p-6">
              {reviews.length > 0 ? (
                <ReviewList reviews={reviews} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🤔</div>
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HijabDetail;