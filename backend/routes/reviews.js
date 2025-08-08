// src/services/reviewService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Get reviews for a specific style
export const getReviewsForStyle = async (styleId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.status) queryParams.append('status', params.status);

    const url = `${API_BASE_URL}/reviews/${styleId}?${queryParams}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Create a new review
export const createReview = async (styleId, reviewData) => {
  try {
    const url = `${API_BASE_URL}/reviews/${styleId}`;
    return await makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const url = `${API_BASE_URL}/reviews/${reviewId}`;
    return await makeAuthenticatedRequest(url, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const url = `${API_BASE_URL}/reviews/${reviewId}`;
    return await makeAuthenticatedRequest(url, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Vote on review helpfulness
export const voteOnReview = async (reviewId, vote) => {
  try {
    const url = `${API_BASE_URL}/reviews/${reviewId}/vote`;
    return await makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify({ vote })
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    throw error;
  }
};

// Remove vote from review
export const removeVoteFromReview = async (reviewId) => {
  try {
    const url = `${API_BASE_URL}/reviews/${reviewId}/vote`;
    return await makeAuthenticatedRequest(url, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    throw error;
  }
};

// Flag a review
export const flagReview = async (reviewId, flagData) => {
  try {
    const url = `${API_BASE_URL}/reviews/${reviewId}/flag`;
    return await makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify(flagData)
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    throw error;
  }
};

// Add creator response to review
export const addCreatorResponse = async (reviewId, responseText) => {
  try {
    const url = `${API_BASE_URL}/reviews/${reviewId}/response`;
    return await makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify({ text: responseText })
    });
  } catch (error) {
    console.error('Error adding creator response:', error);
    throw error;
  }
};

// Get reviews by user
export const getUserReviews = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);

    const url = `${API_BASE_URL}/reviews/user/${userId}?${queryParams}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Get most helpful reviews
export const getHelpfulReviews = async (limit = 10) => {
  try {
    const url = `${API_BASE_URL}/reviews/helpful?limit=${limit}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error fetching helpful reviews:', error);
    throw error;
  }
};

// Get single review by ID
export const getReviewById = async (reviewId) => {
  try {
    const url = `${API_BASE_URL}/reviews/single/${reviewId}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// Check if user can review a style
export const canUserReviewStyle = async (styleId) => {
  try {
    const url = `${API_BASE_URL}/reviews/can-review/${styleId}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    throw error;
  }
};

// Get review statistics for a style
export const getReviewStats = async (styleId) => {
  try {
    const url = `${API_BASE_URL}/reviews/stats/${styleId}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

// Search reviews
export const searchReviews = async (query, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (params.styleId) queryParams.append('styleId', params.styleId);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.minRating) queryParams.append('minRating', params.minRating);
    if (params.maxRating) queryParams.append('maxRating', params.maxRating);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const url = `${API_BASE_URL}/reviews/search?${queryParams}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error searching reviews:', error);
    throw error;
  }
};

// Bulk operations for admin/moderators
export const bulkUpdateReviews = async (reviewIds, updateData) => {
  try {
    const url = `${API_BASE_URL}/reviews/bulk-update`;
    return await makeAuthenticatedRequest(url, {
      method: 'PUT',
      body: JSON.stringify({ reviewIds, updateData })
    });
  } catch (error) {
    console.error('Error bulk updating reviews:', error);
    throw error;
  }
};

export const bulkDeleteReviews = async (reviewIds) => {
  try {
    const url = `${API_BASE_URL}/reviews/bulk-delete`;
    return await makeAuthenticatedRequest(url, {
      method: 'DELETE',
      body: JSON.stringify({ reviewIds })
    });
  } catch (error) {
    console.error('Error bulk deleting reviews:', error);
    throw error;
  }
};

// Export all functions as default object as well (for compatibility)
const reviewService = {
  getReviewsForStyle,
  createReview,
  updateReview,
  deleteReview,
  voteOnReview,
  removeVoteFromReview,
  flagReview,
  addCreatorResponse,
  getUserReviews,
  getHelpfulReviews,
  getReviewById,
  canUserReviewStyle,
  getReviewStats,
  searchReviews,
  bulkUpdateReviews,
  bulkDeleteReviews
};

export default reviewService;