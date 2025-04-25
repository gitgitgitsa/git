import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard"; // Placeholder for the dashboard
import "./styles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
const savedFontSize = JSON.parse(localStorage.getItem("userSettings"))?.fontSize;
if (savedFontSize) {
  const root = document.documentElement;
  root.style.fontSize =
    savedFontSize === "small"
      ? "14px"
      : savedFontSize === "large"
      ? "18px"
      : "16px";
}

export default App;