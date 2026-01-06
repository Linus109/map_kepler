import * as React from "react";
import { useState } from "react";
import ReactDOM from "react-dom/client";
import document from "global/document";

import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { connect, Provider } from "react-redux";

import keplerGlReducer, { enhanceReduxMiddleware } from "@kepler.gl/reducers";

import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import KeplerMap from "./KeplerMap";
import YearSelector from "./YearSelector";
import ModeSelector from "./ModeSelector";
import CompassButton from "./CompassButton";
import { useLoadData } from "./useLoadData";

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

const mapStyles = [
  {
    id: "maptiler-streets",
    label: "Streets",
    url: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`,
    icon: `https://api.maptiler.com/maps/streets-v2/256/0/0/0.png?key=${MAPTILER_API_KEY}`,
    layerGroups: [
      {
        slug: "label",
        filter: ({ id }) => id.includes("label"),
        defaultVisibility: true,
      },
      {
        slug: "road",
        filter: ({ id }) =>
          id.includes("road") || id.includes("street") || id.includes("path"),
        defaultVisibility: true,
      },
      {
        slug: "building",
        filter: ({ id }) => id.includes("building"),
        defaultVisibility: true,
      },
      {
        slug: "water",
        filter: ({ id }) => id.includes("water"),
        defaultVisibility: true,
      },
    ],
  },
  {
    id: "maptiler-satellite",
    label: "Satellite",
    url: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`,
    icon: `https://api.maptiler.com/maps/satellite/256/0/0/0.jpg?key=${MAPTILER_API_KEY}`,
    layerGroups: [],
  },
  {
    id: "maptiler-dark",
    label: "Dark",
    url: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_API_KEY}`,
    icon: `https://api.maptiler.com/maps/dataviz-dark/256/0/0/0.png?key=${MAPTILER_API_KEY}`,
    layerGroups: [
      {
        slug: "label",
        filter: ({ id }) => id.includes("label"),
        defaultVisibility: true,
      },
      {
        slug: "road",
        filter: ({ id }) => id.includes("road") || id.includes("street"),
        defaultVisibility: true,
      },
      {
        slug: "building",
        filter: ({ id }) => id.includes("building"),
        defaultVisibility: true,
      },
    ],
  },
];

const reducers = combineReducers({
  keplerGl: keplerGlReducer.initialState({
    mapState: {
      latitude: 55.0,
      longitude: 4.0,
      zoom: 4,
    },
    uiState: {
      readOnly: false,
      currentModal: null,
    },
    mapStyle: {
      styleType: "maptiler-dark",
    },
  }),
});

const middleWares = enhanceReduxMiddleware([
  // Add other middlewares here
]);

const enhancers = applyMiddleware(...middleWares);

const initialState = {};
const store = createStore(reducers, initialState, compose(enhancers));

const LoadingOverlay = ({ progress, mode }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(36, 39, 48, 0.95)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "3px solid rgba(255,255,255,0.1)",
        borderTopColor: "#1fbad6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div
      style={{
        marginTop: "20px",
        color: "#a0a7b4",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      {progress}
    </div>
    <div
      style={{
        marginTop: "8px",
        color: "#6a7485",
        fontSize: "12px",
      }}
    >
      Loading {mode === "yearly" ? "~827 MB" : "~175 MB"} of geospatial data
    </div>
  </div>
);

const App = () => {
  const [mode, setMode] = useState(null); // null | "aggregated" | "yearly"

  // Load datasets only after mode is selected
  const { loading, progress } = useLoadData(mode);

  // Show mode selector first
  if (!mode) {
    return <ModeSelector onSelect={setMode} />;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <KeplerMap height={height} width={width} mapStyles={mapStyles} />
        )}
      </AutoSizer>
      {!loading && <CompassButton />}
      {!loading && mode === "yearly" && <YearSelector />}
      {loading && <LoadingOverlay progress={progress} mode={mode} />}
    </div>
  );
};

const mapStateToProps = (state) => state;
const dispatchToProps = (dispatch) => ({ dispatch });
const ConnectedApp = connect(mapStateToProps, dispatchToProps)(App);
const Root = () => (
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
);

export default Root;
