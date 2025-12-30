const ModeSelector = ({ onSelect }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Marine Litter Visualization</h1>
        <p style={styles.subtitle}>
          Vessel density and litter data for European waters (2017-2021)
        </p>

        <div style={styles.options}>
          <button
            style={styles.option}
            onClick={() => onSelect("aggregated")}
          >
            <div style={styles.optionTitle}>Quick View</div>
            <div style={styles.optionDesc}>
              See all data combined (2017–2021)
            </div>
            <div style={styles.optionMeta}>~170 MB</div>
          </button>

          <button
            style={styles.option}
            onClick={() => onSelect("yearly")}
          >
            <div style={styles.optionTitle}>Compare Years</div>
            <div style={styles.optionDesc}>
              Switch between individual years
            </div>
            <div style={styles.optionMeta}>
              ~830 MB · <span style={styles.warning}>Loads slower</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1c20",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  card: {
    backgroundColor: "rgba(36, 39, 48, 0.95)",
    borderRadius: "8px",
    padding: "40px",
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: 600,
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#a0a7b4",
    fontSize: "14px",
    margin: "0 0 32px 0",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  option: {
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    backgroundColor: "rgba(255,255,255,0.05)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    width: "100%",
  },
  optionTitle: {
    color: "#1fbad6",
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  optionDesc: {
    color: "#e0e0e0",
    fontSize: "14px",
    marginBottom: "8px",
  },
  optionMeta: {
    color: "#6a7485",
    fontSize: "12px",
  },
  warning: {
    color: "#f5a623",
    fontWeight: 500,
  },
};

export default ModeSelector;
