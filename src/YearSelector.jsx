import { useState } from "react";
import { useDispatch } from "react-redux";
import { addFilter, setFilter, wrapTo } from "@kepler.gl/actions";

const YEARS = [2017, 2018, 2019, 2020, 2021];
const MAP_ID = "map"; // Must match the id in KeplerMap.jsx

const DATASET_IDS = [
  "cargo_density",
  "fishing_density",
  "tanker_density",
  "beach_litter",
  "seafloor_litter",
  "floating_litter",
];

const YearSelector = () => {
  const dispatch = useDispatch();
  const [selectedYear, setSelectedYear] = useState(null);
  const [filtersCreated, setFiltersCreated] = useState(false);

  const handleYearSelect = (year) => {
    // If clicking the same year, clear selection (show all)
    const newYear = year === selectedYear ? null : year;
    setSelectedYear(newYear);

    if (!filtersCreated && newYear !== null) {
      // Create filters for each dataset on first use
      DATASET_IDS.forEach((dataId) => {
        dispatch(wrapTo(MAP_ID, addFilter(dataId)));
      });
      setFiltersCreated(true);

      // Wait for filters to be created, then set values
      setTimeout(() => {
        DATASET_IDS.forEach((_, idx) => {
          dispatch(wrapTo(MAP_ID, setFilter(idx, "name", "year")));
          dispatch(wrapTo(MAP_ID, setFilter(idx, "value", [newYear, newYear])));
        });
      }, 100);
    } else if (filtersCreated) {
      // Update existing filters
      DATASET_IDS.forEach((_, idx) => {
        if (newYear === null) {
          // Show all years
          dispatch(wrapTo(MAP_ID, setFilter(idx, "value", [2017, 2021])));
        } else {
          dispatch(wrapTo(MAP_ID, setFilter(idx, "value", [newYear, newYear])));
        }
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.label}>Year</div>
      <div style={styles.buttons}>
        {YEARS.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            style={{
              ...styles.button,
              ...(year === selectedYear ? styles.buttonActive : {}),
            }}
          >
            {year}
          </button>
        ))}
        <button
          onClick={() => handleYearSelect(null)}
          style={{
            ...styles.button,
            ...styles.allButton,
            ...(selectedYear === null ? styles.buttonActive : {}),
          }}
        >
          All
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    backgroundColor: "rgba(36, 39, 48, 0.95)",
    borderRadius: "4px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  label: {
    color: "#a0a7b4",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  buttons: {
    display: "flex",
    gap: "4px",
  },
  button: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "3px",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#a0a7b4",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  buttonActive: {
    backgroundColor: "#1fbad6",
    color: "#fff",
  },
  allButton: {
    marginLeft: "4px",
  },
};

export default YearSelector;
