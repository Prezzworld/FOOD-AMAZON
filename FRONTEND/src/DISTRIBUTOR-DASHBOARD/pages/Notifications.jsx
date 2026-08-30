import React from 'react'

const Notifications = () => {
  return (
    <div>
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <h2 className="font-inter fw-bold text-main-accent mb-2">
          Coming Soon
        </h2>
        <p className="font-inter text-content-accent">
          This feature is currently under development.
        </p>
      </div>
    </div>
  );
}

export default Notifications
