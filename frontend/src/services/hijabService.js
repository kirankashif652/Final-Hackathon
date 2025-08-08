import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE = `${API_BASE}/hijab-styles`;

// Create axios instance
const api = axios.create({
  baseURL: BASE,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    console.error('API Error:', customError);
    return Promise.reject(customError);
  }
);

// Helper: build query string from params object
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  return searchParams.toString();
};

// ============ SERVICE FUNCTIONS ============

// Get all hijab styles with optional filters & pagination
export const getHijabStyles = async (params = {}) => {
  try {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/?${queryString}` : '/';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch hijab styles:", error);
    throw error;
  }
};

// Get single hijab style by ID with optional params
export const getHijabStyle = async (id, params = {}) => {
  if (!id) throw new Error('Style ID is required');
  try {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/${id}?${queryString}` : `/${id}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch hijab style with id ${id}:`, error);
    throw error;
  }
};

// Popular hijab styles
export const getPopularHijabStyles = async (limit = 10) => {
  try {
    const response = await api.get(`/popular?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch popular hijab styles:", error);
    throw error;
  }
};

// Featured hijab styles
export const getFeaturedHijabStyles = async () => {
  try {
    const response = await api.get('/featured');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch featured hijab styles:", error);
    throw error;
  }
};

// Similar hijab styles
export const getSimilarHijabStyles = async (id, limit = 6) => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.get(`/${id}/similar?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch similar styles for ${id}:`, error);
    throw error;
  }
};

// Create new hijab style
export const createHijabStyle = async (styleData) => {
  if (!styleData.name || !styleData.image) {
    throw new Error('Name and image are required fields');
  }
  try {
    const response = await api.post('/', styleData);
    return response.data;
  } catch (error) {
    console.error("Failed to create hijab style:", error);
    throw error;
  }
};

// Update hijab style by ID
export const updateHijabStyle = async (id, styleData) => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.put(`/${id}`, styleData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update hijab style ${id}:`, error);
    throw error;
  }
};

// Delete hijab style by ID
export const deleteHijabStyle = async (id) => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete hijab style ${id}:`, error);
    throw error;
  }
};

// Like/unlike hijab style
export const toggleLikeHijabStyle = async (id, action = 'toggle') => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.post(`/${id}/like`, { action });
    return response.data;
  } catch (error) {
    console.error(`Failed to ${action} hijab style ${id}:`, error);
    throw error;
  }
};

// Search hijab styles
export const searchHijabStyles = async (query, filters = {}) => {
  try {
    const params = { search: query, ...filters };
    return await getHijabStyles(params);
  } catch (error) {
    console.error("Failed to search hijab styles:", error);
    throw error;
  }
};

// Search suggestions
export const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) return { success: true, data: [] };
  try {
    const response = await api.get(`/search/suggestions?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch search suggestions:", error);
    throw error;
  }
};

// Get filter options
export const getFilterOptions = async () => {
  try {
    const response = await api.get('/filters/options');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch filter options:", error);
    throw error;
  }
};

// Get hijab styles created by user
export const getHijabStylesByUser = async (userId, params = {}) => {
  if (!userId) throw new Error('User ID is required');
  try {
    const queryParams = { createdBy: userId, ...params };
    return await getHijabStyles(queryParams);
  } catch (error) {
    console.error(`Failed to fetch styles by user ${userId}:`, error);
    throw error;
  }
};

// Seed data (dev only)
export const seedHijabStyles = async () => {
  try {
    const response = await api.get('/seed');
    return response.data;
  } catch (error) {
    console.error("Failed to seed hijab styles:", error);
    throw error;
  }
};

// Advanced search
export const advancedSearchHijabStyles = async (searchParams) => {
  try {
    // Map and normalize searchParams
    const {
      query,
      difficulty,
      occasions,
      faceShape,
      minRating,
      maxRating,
      tags,
      createdBy,
      dateFrom,
      dateTo,
      page = 1,
      limit = 12,
      sort = 'newest'
    } = searchParams;

    const params = {
      ...(query && { search: query }),
      ...(difficulty && { difficulty }),
      ...(occasions && { occasions: Array.isArray(occasions) ? occasions : [occasions] }),
      ...(faceShape && { faceShape }),
      ...(minRating && { minRating }),
      ...(maxRating && { maxRating }),
      ...(tags && { tags: Array.isArray(tags) ? tags : [tags] }),
      ...(createdBy && { createdBy }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      page,
      limit,
      sort
    };

    return await getHijabStyles(params);
  } catch (error) {
    console.error("Failed to perform advanced search:", error);
    throw error;
  }
};

// Get hijab style stats
export const getHijabStyleStats = async (id) => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.get(`/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch stats for style ${id}:`, error);
    throw error;
  }
};

// Bookmark/unbookmark hijab style
export const bookmarkHijabStyle = async (id, action = 'add') => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.post(`/${id}/bookmark`, { action });
    return response.data;
  } catch (error) {
    console.error(`Failed to ${action} bookmark for style ${id}:`, error);
    throw error;
  }
};

// Get trending hijab styles
export const getTrendingHijabStyles = async (timeframe = 'week', limit = 10) => {
  try {
    const response = await api.get(`/trending?timeframe=${timeframe}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch trending hijab styles:", error);
    throw error;
  }
};

// Report hijab style
export const reportHijabStyle = async (id, reportData) => {
  if (!id) throw new Error('Style ID is required');
  try {
    const response = await api.post(`/${id}/report`, reportData);
    return response.data;
  } catch (error) {
    console.error(`Failed to report style ${id}:`, error);
    throw error;
  }
};

// Export all functions as object for convenience
const hijabStylesService = {
  getHijabStyles,
  getHijabStyle,
  getPopularHijabStyles,
  getFeaturedHijabStyles,
  getSimilarHijabStyles,
  createHijabStyle,
  updateHijabStyle,
  deleteHijabStyle,
  toggleLikeHijabStyle,
  searchHijabStyles,
  getSearchSuggestions,
  getFilterOptions,
  getHijabStylesByUser,
  seedHijabStyles,
  advancedSearchHijabStyles,
  getHijabStyleStats,
  bookmarkHijabStyle,
  getTrendingHijabStyles,
  reportHijabStyle
};

export default hijabStylesService;
