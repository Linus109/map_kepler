import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateMap } from "@kepler.gl/actions";

const CompassButton = () => {
  const dispatch = useDispatch();
  const bearing = useSelector(
    (state) => state.keplerGl?.map?.mapState?.bearing ?? 0
  );

  const resetNorth = () => {
    dispatch(updateMap({ bearing: 0, pitch: 0 }, 0));
  };

  // Only show when map is rotated
  const isRotated = Math.abs(bearing) > 0.1;

  return (
    <button
      onClick={resetNorth}
      title="Reset to North"
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        width: "32px",
        height: "32px",
        borderRadius: "4px",
        border: "none",
        backgroundColor: isRotated
          ? "rgba(31, 186, 214, 0.9)"
          : "rgba(36, 39, 48, 0.8)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        transition: "all 0.2s ease",
        transform: `rotate(${-bearing}deg)`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(31, 186, 214, 1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isRotated
          ? "rgba(31, 186, 214, 0.9)"
          : "rgba(36, 39, 48, 0.8)";
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* North arrow */}
        <polygon points="12,2 16,14 12,11 8,14" fill="#ff4444" stroke="none" />
        {/* South arrow */}
        <polygon
          points="12,22 16,14 12,17 8,14"
          fill="white"
          stroke="none"
          opacity="0.6"
        />
      </svg>
    </button>
  );
};

export default CompassButton;
