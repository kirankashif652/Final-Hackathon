import React, { useEffect, useState } from "react";
import HijabCard from "../components/HijabCard";
import { getHijabStyles } from "../services/hijabService";

const Home = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStyles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getHijabStyles();
      console.log("API Response:", response); // Debug log

      // More flexible response handling
      if (!response) {
        throw new Error("No response from server");
      }

      // Handle different response formats
      let hijabData = [];
      
      if (response.success && response.data?.hijabs) {
        // Format: { success: true, data: { hijabs: [...] } }
        hijabData = response.data.hijabs;
      } else if (response.success && Array.isArray(response.data)) {
        // Format: { success: true, data: [...] }
        hijabData = response.data;
      } else if (Array.isArray(response)) {
        // Format: [...]
        hijabData = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Format: { data: [...] }
        hijabData = response.data;
      } else {
        console.error("Unexpected data format from API:", response);
        throw new Error("Invalid data format received from server");
      }

      if (!Array.isArray(hijabData)) {
        throw new Error("Hijab styles data is not an array");
      }

      setStyles(hijabData);
    } catch (err) {
      setError(err.message || "Failed to load hijab styles. Please try again later.");
      console.error("Fetch styles error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading hijab styles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchStyles}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (styles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🧕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Hijab Styles Found
            </h2>
            <p className="text-gray-600 mb-6">
              It looks like there are no hijab styles available at the moment.
            </p>
            <button
              onClick={fetchStyles}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Beautiful Hijab Styles
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover elegant and modern hijab styles for every occasion
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {styles.map((style) => (
            <div key={style._id || style.id} className="transform hover:scale-105 transition-transform duration-200">
              <HijabCard style={style} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;