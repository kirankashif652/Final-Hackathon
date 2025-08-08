import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/styles", label: "All Styles", icon: "👗" },
    { path: "/categories", label: "Categories", icon: "📂" },
    { path: "/about", label: "About", icon: "ℹ️" },
    { path: "/contact", label: "Contact", icon: "📞" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">🧕</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800">Hijab Styles</span>
                <span className="text-xs text-gray-500">Premium Collection</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActiveLink(link.path)
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {user.name || "User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActiveLink("/login")
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>🔐</span>
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActiveLink("/signup")
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-md"
                  }`}
                >
                  <span>✨</span>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-3 ${
                    isActiveLink(link.path)
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  {/* Mobile User Info */}
                  <div className="flex items-center space-x-3 px-3 py-2 mb-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {user.name || "User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-base font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-center"
                  >
                    🔐 Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-2 rounded-lg text-base font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 text-center"
                  >
                    ✨ Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar (Optional - can be shown when user is logged in) */}
      {user && (
        <div className="bg-gray-50 border-t border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                  placeholder="Search hijab styles..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;