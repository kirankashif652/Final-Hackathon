import { Link } from "react-router-dom";
import { useState } from "react";

const HijabCard = ({ style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Mock rating for demonstration - you can replace with real data
  const mockRating = style.rating || (Math.random() * 2 + 3).toFixed(1); // Random rating between 3-5
  const mockReviews = style.reviewCount || Math.floor(Math.random() * 50) + 5; // Random review count

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

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-rose-200 transform hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div className="aspect-w-4 aspect-h-5 bg-gray-200">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-4xl text-gray-400">🧕</div>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-rose-400 mb-2">🖼️</div>
                <p className="text-rose-500 text-sm font-medium">Image not available</p>
              </div>
            </div>
          ) : (
            <img
              src={style.image}
              alt={style.name}
              className={`w-full h-64 object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
        </div>

        {/* Overlay with Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <Link
              to={`/style/${style._id}`}
              className="w-full bg-white text-gray-800 py-2 px-4 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            >
              <span>👀</span>
              <span>Quick View</span>
            </Link>
          </div>
        </div>

        {/* Badge/Tag */}
        {style.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ⭐ Featured
            </span>
          </div>
        )}

        {/* New Badge */}
        {style.isNew && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              🆕 New
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors duration-200">
          {style.name}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {truncateText(style.description)}
        </p>

        {/* Rating Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(parseFloat(mockRating))}
            </div>
            <span className="text-sm text-gray-500">
              {mockRating} ({mockReviews})
            </span>
          </div>
          
          {/* Price (if available) */}
          {style.price && (
            <div className="text-right">
              <span className="text-lg font-bold text-rose-600">
                ${style.price}
              </span>
              {style.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-1">
                  ${style.originalPrice}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {style.tags && style.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {style.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-rose-50 text-rose-600 text-xs px-2 py-1 rounded-full border border-rose-200"
              >
                {tag}
              </span>
            ))}
            {style.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{style.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/style/${style._id}`}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold text-center hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
          >
            <span>📱</span>
            <span>View Details</span>
          </Link>
          
          {/* Favorite Button */}
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors duration-200 group/fav">
            <span className="text-xl group-hover/fav:text-rose-500 transition-colors duration-200">
              🤍
            </span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {style.material && (
                <span className="flex items-center space-x-1">
                  <span>🧵</span>
                  <span>{style.material}</span>
                </span>
              )}
              {style.color && (
                <span className="flex items-center space-x-1">
                  <span>🎨</span>
                  <span>{style.color}</span>
                </span>
              )}
            </div>
            
            {style.inStock !== undefined && (
              <span className={`flex items-center space-x-1 ${
                style.inStock ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{style.inStock ? '✅' : '❌'}</span>
                <span>{style.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default HijabCard;