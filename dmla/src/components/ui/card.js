// Card.jsx
import React from "react";

export const Card = ({ children, className }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children }) => <div>{children}</div>;
