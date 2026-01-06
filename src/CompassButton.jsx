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

  const isRotated = Math.abs(bearing) > 0.1;

  return (
    <button
      onClick={resetNorth}
      title="Reset to North"
      className="map-control-button"
      style={{
        position: "absolute",
        top: "266px", // Below the native controls (52px start + 5 buttons * ~40px spacing)
        right: "12px",
        zIndex: 10,
        // Match Kepler's MapControlButton styles exactly
        boxShadow: "0 6px 12px 0 rgba(0, 0, 0, 0.16)",
        height: "32px",
        width: "32px",
        padding: "0",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isRotated ? "#1fbad6" : "#3a414c",
        color: isRotated ? "#ffffff" : "#6a7485",
        transition: "background-color 0.12s ease-in, color 0.12s ease-in",
      }}
      onMouseEnter={(e) => {
        if (!isRotated) {
          e.currentTarget.style.backgroundColor = "#3a414c";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isRotated) {
          e.currentTarget.style.backgroundColor = "#3a414c";
          e.currentTarget.style.color = "#6a7485";
        }
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        style={{
          transform: `rotate(${-bearing}deg)`,
          transition: "transform 0.15s ease",
        }}
      >
        {/* Compass needle */}
        <polygon points="12,2 15,12 12,10 9,12" fill="#f25138" />
        <polygon points="12,22 15,12 12,14 9,12" fill="currentColor" />
      </svg>
    </button>
  );
};

export default CompassButton;
