import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  Moon,
  Sun,
} from "lucide-react";

const SignIn = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userPreferences = localStorage.getItem("userPreference");
    if (userPreferences) {
      const { username } = JSON.parse(userPreferences);
      setUser((prev) => ({ ...prev, username }));
      setRememberMe(true);
    }
    const dark = localStorage.getItem("darkMode") === "true";
    setDarkMode(dark);
  }, []);

  useEffect(() => {
    setFormValid(user.username.trim() !== "" && user.password.length >= 6);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userPreference", JSON.stringify({ username: user.username }));
      
        // ✅ Store full user profile for Dashboard use
        if (data.user) {
          localStorage.setItem("userProfileData", JSON.stringify(data.user));
          localStorage.setItem("userProfileImage", localStorage.getItem("userProfileImage") || "https://via.placeholder.com/150");
        }

        setTimeout(() => {
          navigate("/dashboard");
        }, 300);
      } else {
        setError(data.error || "Authentication failed. Please verify your credentials.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server connection failed. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 antialiased transition duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50"
      }`}
    >
      {/* Brand + Toggle Icon */}
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center w-full">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white text-2xl font-bold mb-2 shadow-lg mx-auto">
              DM
            </div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
              DMLA <span className="text-indigo-600">Platform</span>
            </h1>
            <p className={`mt-1 font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Sign in to your account
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="absolute top-5 right-6 p-2 hover:scale-110 transition"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-gray-700" />}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start text-sm text-red-700">
            <AlertCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
            {error}
          </div>
        )}

        {/* Card */}
        <div
              className={`rounded-2xl shadow-xl border p-8 transition ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-black"
              }`}
            >
          <div className="flex items-center mb-6">
            <div className="w-full h-px bg-gray-200" />
            <span className="px-4 text-sm font-medium text-gray-500 whitespace-nowrap">
              Sign in to continue
            </span>
            <div className="w-full h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={user.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm transition ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                        : "bg-white text-black border-gray-300"
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={user.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm transition ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                        : "bg-white text-black border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !formValid}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 transition-all ${
                  formValid && !loading
                    ? "hover:bg-indigo-700"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
