import React from "react";

export function Toast({ message, type = "info" }) {
  if (!message) return null;

  const colors = {
    info: "bg-blue-600",
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-500"
  };

  return (
    <div
      className={`${colors[type]} text-white px-4 py-2 rounded shadow-lg fixed top-5 right-5 animate-fadeIn`}
      style={{ zIndex: 9999 }}
    >
      {message}
    </div>
  );
}
