import React from 'react';
import '../pages/dashboard.css';
const CustomLegend = ({ payload }) => {
  return (
    <div className="custom-legend">
      {payload.map((entry, index) => (
        <div key={index} className="legend-item">
          <span 
            className="legend-icon"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="legend-text">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default CustomLegend;