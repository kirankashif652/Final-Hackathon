import { useEffect, useState } from "react";
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

      // Check if response is valid and hijabs is an array
      if (
        !response ||
        !response.success ||
        !response.data ||
        !Array.isArray(response.data.hijabs)
      ) {
        console.error("Unexpected data format from API:", response);
        throw new Error("Invalid data format");
      }

      setStyles(response.data.hijabs);
    } catch (err) {
      setError("Failed to load hijab styles. Please try again later.");
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Loading UI here */}
        <p className="text-center mt-10">Loading styles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStyles}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (styles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Empty state UI */}
        <p className="text-center mt-10 text-gray-600">No hijab styles found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {styles.map((style) => (
          <div
            key={style._id}
            className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <HijabCard style={style} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
