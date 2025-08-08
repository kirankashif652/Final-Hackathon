import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE = `${API_BASE}/reviews`;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      status: error.response?.status || 500,
      data: error.response?.data || null,
      errors: error.response?.data?.errors || []
    };
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    console.error('Review API Error:', customError);
    return Promise.reject(customError);
  }
);

// Helper function to build query parameters
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

// Validate review data
const validateReviewData = (reviewData) => {
  const { text, rating } = reviewData;
  
  if (!text || text.trim().length < 10) {
    throw new Error('Review text must be at least 10 characters long');
  }
  
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  return true;
};

// =============================================================================
// CORE REVIEW FUNCTIONS
// =============================================================================

// Get reviews for a specific hijab style
export const getReviewsForStyle = async (styleId, params = {}) => {
  try {
    if (!styleId) {
      throw new Error('Style ID is required');
    }
    
    const queryString = buildQueryParams(params);
    const url = queryString ? `/${styleId}?${queryString}` : `/${styleId}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reviews for style ${styleId}:`, error);
    throw error;
  }
};

// Add a new review for a hijab style
export const addReview = async (styleId, reviewData, token = null) => {
  try {
    if (!styleId) {
      throw new Error('Style ID is required');
    }
    
    validateReviewData(reviewData);
    
    // If token is provided as parameter, use it instead of interceptor
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.post(`/${styleId}`, reviewData, config);
    return response.data;
  } catch (error) {
    console.error("Failed to add review:", error);
    throw error;
  }
};

// Alternative name for backward compatibility
export const createReview = addReview;

// Update an existing review by ID
export const updateReview = async (reviewId, reviewData, token = null) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    validateReviewData(reviewData);
    
    // If token is provided as parameter, use it instead of interceptor
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.put(`/${reviewId}`, reviewData, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to update review ${reviewId}:`, error);
    throw error;
  }
};

// Delete a review by ID
export const deleteReview = async (reviewId, token = null) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    // If token is provided as parameter, use it instead of interceptor
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.delete(`/${reviewId}`, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete review ${reviewId}:`, error);
    throw error;
  }
};

// =============================================================================
// REVIEW INTERACTION FUNCTIONS
// =============================================================================

// Vote on review helpfulness
export const voteOnReview = async (reviewId, vote, token = null) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    if (!['helpful', 'unhelpful'].includes(vote)) {
      throw new Error("Vote must be 'helpful' or 'unhelpful'");
    }
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.post(`/${reviewId}/vote`, { vote }, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to vote on review ${reviewId}:`, error);
    throw error;
  }
};

// Remove vote from review
export const removeVoteFromReview = async (reviewId, token = null) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.delete(`/${reviewId}/vote`, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove vote from review ${reviewId}:`, error);
    throw error;
  }
};

// Flag a review as inappropriate
export const flagReview = async (reviewId, flagData, token = null) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    const { reason, description } = flagData;
    const validReasons = ['Spam', 'Inappropriate', 'Fake', 'Offensive', 'Other'];
    
    if (!reason || !validReasons.includes(reason)) {
      throw new Error('Valid reason is required');
    }
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.post(`/${reviewId}/flag`, flagData, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to flag review ${reviewId}:`, error);
    throw error;
  }
};

// Add creator response to review
export const addCreatorResponse = async (reviewId, responseText, token = null) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Response text is required');
    }
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.post(`/${reviewId}/response`, { text: responseText.trim() }, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to add response to review ${reviewId}:`, error);
    throw error;
  }
};

// =============================================================================
// USER & DISCOVERY FUNCTIONS
// =============================================================================

// Get reviews by a specific user
export const getUserReviews = async (userId, params = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const queryString = buildQueryParams(params);
    const url = queryString ? `/user/${userId}?${queryString}` : `/user/${userId}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reviews for user ${userId}:`, error);
    throw error;
  }
};

// Get current user's reviews
export const getMyReviews = async (params = {}) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user._id) {
      throw new Error('User not logged in');
    }
    
    return await getUserReviews(user._id, params);
  } catch (error) {
    console.error("Failed to fetch user's own reviews:", error);
    throw error;
  }
};

// Get most helpful reviews across the platform
export const getHelpfulReviews = async (limit = 10) => {
  try {
    const response = await api.get(`/helpful?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch helpful reviews:", error);
    throw error;
  }
};

// Get recent reviews across the platform
export const getRecentReviews = async (limit = 10) => {
  try {
    const response = await api.get(`/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch recent reviews:", error);
    throw error;
  }
};

// =============================================================================
// ANALYTICS & STATS FUNCTIONS
// =============================================================================

// Get review statistics for a specific style
export const getReviewStats = async (styleId) => {
  try {
    if (!styleId) {
      throw new Error('Style ID is required');
    }
    
    const response = await api.get(`/stats/${styleId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch review stats for style ${styleId}:`, error);
    throw error;
  }
};

// Get user's review statistics
export const getUserReviewStats = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const response = await api.get(`/user/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch review stats for user ${userId}:`, error);
    throw error;
  }
};

// =============================================================================
// SEARCH & FILTER FUNCTIONS
// =============================================================================

// Search reviews across the platform
export const searchReviews = async (query, params = {}) => {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    
    const searchParams = {
      q: query.trim(),
      ...params
    };
    
    const queryString = buildQueryParams(searchParams);
    const response = await api.get(`/search?${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Failed to search reviews:", error);
    throw error;
  }
};

// Get reviews with advanced filtering
export const getFilteredReviews = async (filters = {}) => {
  try {
    const queryString = buildQueryParams(filters);
    const response = await api.get(`/filter?${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch filtered reviews:", error);
    throw error;
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Check if user can review a specific style
export const canUserReviewStyle = async (styleId) => {
  try {
    if (!styleId) {
      throw new Error('Style ID is required');
    }
    
    const response = await api.get(`/can-review/${styleId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to check review eligibility for style ${styleId}:`, error);
    throw error;
  }
};

// Get single review by ID
export const getReviewById = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    
    const response = await api.get(`/single/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch review ${reviewId}:`, error);
    throw error;
  }
};

// =============================================================================
// ADMIN/MODERATOR FUNCTIONS
// =============================================================================

// Bulk update reviews (admin/moderator)
export const bulkUpdateReviews = async (reviewIds, updateData, token = null) => {
  try {
    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      throw new Error('Review IDs array is required');
    }
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.put('/bulk-update', { reviewIds, updateData }, config);
    return response.data;
  } catch (error) {
    console.error("Failed to bulk update reviews:", error);
    throw error;
  }
};

// Bulk delete reviews (admin/moderator)
export const bulkDeleteReviews = async (reviewIds, token = null) => {
  try {
    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      throw new Error('Review IDs array is required');
    }
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.delete('/bulk-delete', { 
      ...config,
      data: { reviewIds }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to bulk delete reviews:", error);
    throw error;
  }
};

// =============================================================================
// EXPORT ALL FUNCTIONS
// =============================================================================

// Export all functions as default object for flexibility
const reviewService = {
  getReviewsForStyle,
  addReview,
  createReview,
  updateReview,
  deleteReview,
  voteOnReview,
  removeVoteFromReview,
  flagReview,
  addCreatorResponse,
  getUserReviews,
  getMyReviews,
  getHelpfulReviews,
  getRecentReviews,
  getReviewStats,
  getUserReviewStats,
  searchReviews,
  getFilteredReviews,
  canUserReviewStyle,
  getReviewById,
  bulkUpdateReviews,
  bulkDeleteReviews
};

export default reviewService;