import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2D6A4F",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;