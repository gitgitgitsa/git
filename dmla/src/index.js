import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './i18n';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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