import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          marginBottom: "0.5rem",
          color: "var(--primary-normal, #2D6A4F)",
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Page Not Found
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "#666" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <button
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2D6A4F",
            color: "white",
            border: "none",
            borderRadius: "4px",
            textDecoration: "none",
            fontSize: "1rem",
          }}
        >
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;