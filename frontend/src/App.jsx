// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import HijabDetail from "./pages/HijabDetail";
import Navbar from "./components/Navbar";

// Beautiful loading component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mb-6 shadow-lg">
          <span className="text-white text-3xl font-bold animate-pulse">🧕</span>
        </div>
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait while we prepare your experience</p>
      </div>
    </div>
  );
};

// Enhanced PrivateRoute component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public route component (redirects logged-in users to home)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? <Navigate to="/" replace /> : children;
};

// Placeholder components for additional pages
const AllStyles = () => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">All Hijab Styles</h1>
        <p className="text-gray-600 mb-8">Browse our complete collection</p>
        {/* This would normally render your enhanced HijabCard components */}
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-6xl mb-4">👗</div>
          <p className="text-gray-500">Complete styles collection coming soon!</p>
        </div>
      </div>
    </div>
  </div>
);

const Categories = () => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Categories</h1>
        <p className="text-gray-600 mb-8">Explore hijab styles by category</p>
        <div className="grid md:grid-cols-3 gap-6">
          {['Casual', 'Formal', 'Sport'].map((category) => (
            <div key={category} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{category}</h3>
              <p className="text-gray-600">Discover {category.toLowerCase()} hijab styles</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const About = () => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8">
    <div className="max-w-4xl mx-auto px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Hijab Styles</h1>
          <p className="text-gray-600 text-lg">Your premier destination for beautiful hijab collections</p>
        </div>
        
        <div className="prose prose-lg mx-auto text-gray-700">
          <p className="mb-6">
            Welcome to Hijab Styles, where fashion meets modesty in the most elegant way. 
            We are dedicated to providing you with a curated collection of beautiful, 
            high-quality hijab styles that celebrate both tradition and contemporary fashion.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">Only the finest materials and craftsmanship</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold mb-2">Diverse Styles</h3>
              <p className="text-sm text-gray-600">From casual to formal, we have it all</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💝</div>
              <h3 className="font-semibold mb-2">Customer First</h3>
              <p className="text-sm text-gray-600">Your satisfaction is our top priority</p>
            </div>
          </div>
          
          <p>
            Our mission is to empower women with confidence and style, offering 
            hijab collections that are not just garments, but expressions of identity, 
            faith, and personal style.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Contact = () => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8">
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg">We'd love to hear from you</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <p className="text-gray-600">contact@hijabstyles.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-semibold text-gray-800">Phone</p>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-gray-800">Address</p>
                <p className="text-gray-600">123 Fashion Street<br />Style City, SC 12345</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Message</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

// 404 Not Found page
const NotFound = () => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="text-8xl mb-4">😔</div>
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <a
        href="/"
        className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 inline-flex items-center space-x-2"
      >
        <span>🏠</span>
        <span>Go Home</span>
      </a>
    </div>
  </div>
);

function App() {
  const { loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes - redirect to home if already logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          
          {/* Private Routes - require authentication */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/styles" 
            element={
              <PrivateRoute>
                <AllStyles />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/about" 
            element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/style/:id" 
            element={
              <PrivateRoute>
                <HijabDetail />
              </PrivateRoute>
            } 
          />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;