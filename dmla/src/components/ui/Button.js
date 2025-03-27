// Button.jsx
import React from "react";

export const Button = ({ children, onClick, variant = "default" }) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-semibold transition-all duration-300";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};
