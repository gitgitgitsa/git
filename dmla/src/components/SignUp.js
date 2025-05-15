import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircleIcon, Moon, Sun } from "lucide-react";

const SignUp = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    dob: "",
    address: "",
    license_number: "",
    license_type: "",
    license_expiry: "",
  });
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dark = localStorage.getItem("darkMode") === "true";
    setDarkMode(dark);
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side age validation
    const age = calculateAge(user.dob);
    if (age < 16) {
      setError("You must be at least 16 years old to register.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Signup successful!");
        navigate("/");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50"
      }`}
    >
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
              Create your account
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

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start text-sm text-red-700">
            <AlertCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
            {error}
          </div>
        )}

        <div
          className={`rounded-2xl shadow-xl border p-8 transition ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-black"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Full Name", name: "full_name", type: "text" },
              { label: "Username", name: "username", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone Number", name: "phone", type: "text" },
              { label: "Date of Birth", name: "dob", type: "date" },
              { label: "Address", name: "address", type: "text" },
              { label: "Password", name: "password", type: "password" },
              { label: "License Number (Optional)", name: "license_number", type: "text" },
              { label: "License Type (Optional)", name: "license_type", type: "text" },
              { label: "License Expiry Date (Optional)", name: "license_expiry", type: "date" },
            ].map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={user[field.name]}
                  onChange={handleChange}
                  className={`block w-full px-3 py-3 border rounded-lg shadow-sm transition ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-black border-gray-300"
                  }`}
                  placeholder={field.label}
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/" className="font-medium text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
