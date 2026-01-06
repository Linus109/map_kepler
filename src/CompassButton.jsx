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
    <div style={styles.container}>
      <div style={styles.label}>N</div>
      <button
        onClick={resetNorth}
        title="Reset to North"
        style={{
          ...styles.button,
          ...(isRotated ? styles.buttonActive : {}),
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          style={{
            transform: `rotate(${-bearing}deg)`,
            transition: "transform 0.15s ease",
          }}
        >
          {/* Compass circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          />
          {/* North pointer (red) */}
          <polygon points="12,4 14,12 12,10 10,12" fill="#f25138" />
          {/* South pointer (white/gray) */}
          <polygon points="12,20 14,12 12,14 10,12" fill="currentColor" opacity="0.5" />
        </svg>
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "absolute",
    bottom: "24px",
    right: "12px",
    zIndex: 100,
    backgroundColor: "rgba(36, 39, 48, 0.95)",
    borderRadius: "4px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  label: {
    color: "#a0a7b4",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  button: {
    padding: "6px",
    border: "none",
    borderRadius: "3px",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#a0a7b4",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: "#1fbad6",
    color: "#fff",
  },
};

export default CompassButton;
