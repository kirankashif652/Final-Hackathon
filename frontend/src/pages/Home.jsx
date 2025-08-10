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
      console.log("API Response:", response);

      // Forcefully normalize the data
      let hijabData = [];

      if (Array.isArray(response)) {
        hijabData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        hijabData = response.data;
      } else if (response?.data?.hijabs && Array.isArray(response.data.hijabs)) {
        hijabData = response.data.hijabs;
      } else {
        throw new Error("Invalid data format from API");
      }

      setStyles(hijabData);
    } catch (err) {
      setError(err.message || "Failed to load hijab styles");
      console.error("Fetch styles error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
        <p className="text-lg font-medium text-gray-600">Loading hijab styles...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchStyles}
            className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty data state
  if (styles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
        <p className="text-lg text-gray-600">No hijab styles found</p>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Beautiful Hijab Styles
          </h1>
          <p className="text-gray-600 text-lg">
            Discover elegant and modern hijab styles for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {styles.map((style) => (
            <div
              key={style._id || style.id}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              <HijabCard style={style} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
