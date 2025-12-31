import * as React from "react";
import { useState } from "react";
import ReactDOM from "react-dom/client";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";
import keplerGlReducer, { enhanceReduxMiddleware } from "@kepler.gl/reducers";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";

import KeplerMap from "./KeplerMap";
import YearSelector from "./YearSelector";
import ModeSelector from "./ModeSelector";
import { useLoadData } from "./useLoadData";

// API Key aus .env zur Build-Zeit eingebettet
const DEFAULT_MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || "";

// Loading Overlay Component
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

// Inner App Component - manages mode state and renders the app
const InnerApp = ({ initialMode, mapStyles, dataBaseUrl }) => {
  const [mode, setMode] = useState(initialMode);
  const { loading, progress } = useLoadData(mode, dataBaseUrl);

  // Show mode selector if no mode set
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
      {!loading && mode === "yearly" && <YearSelector />}
      {loading && <LoadingOverlay progress={progress} mode={mode} />}
    </div>
  );
};

class LitterAppWebComponent extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.store = null;
    this.container = null;
  }

  getPropsFromAttributes() {
    const modeAttr = this.getAttribute("mode");
    return {
      // Mode can be null (show ModeSelector), "aggregated", or "yearly"
      mode: modeAttr === "aggregated" || modeAttr === "yearly" ? modeAttr : null,
      latitude: parseFloat(this.getAttribute("latitude")) || 55.0,
      longitude: parseFloat(this.getAttribute("longitude")) || 4.0,
      zoom: parseFloat(this.getAttribute("zoom")) || 4,
      mapStyle: this.getAttribute("map-style") || "maptiler-dark",
      maptilerApiKey: this.getAttribute("maptiler-api-key") || DEFAULT_MAPTILER_API_KEY,
      readOnly: this.getAttribute("read-only") === "true",
      dataBaseUrl: this.getAttribute("data-base-url") || "",
    };
  }

  createMapStyles(apiKey) {
    return [
      {
        id: "maptiler-streets",
        label: "Streets",
        url: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
        icon: `https://api.maptiler.com/maps/streets-v2/256/0/0/0.png?key=${apiKey}`,
        layerGroups: [
          { slug: "label", filter: ({ id }) => id.includes("label"), defaultVisibility: true },
          {
            slug: "road",
            filter: ({ id }) => id.includes("road") || id.includes("street") || id.includes("path"),
            defaultVisibility: true,
          },
          { slug: "building", filter: ({ id }) => id.includes("building"), defaultVisibility: true },
          { slug: "water", filter: ({ id }) => id.includes("water"), defaultVisibility: true },
        ],
      },
      {
        id: "maptiler-satellite",
        label: "Satellite",
        url: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
        icon: `https://api.maptiler.com/maps/satellite/256/0/0/0.jpg?key=${apiKey}`,
        layerGroups: [],
      },
      {
        id: "maptiler-dark",
        label: "Dark",
        url: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${apiKey}`,
        icon: `https://api.maptiler.com/maps/dataviz-dark/256/0/0/0.png?key=${apiKey}`,
        layerGroups: [
          { slug: "label", filter: ({ id }) => id.includes("label"), defaultVisibility: true },
          {
            slug: "road",
            filter: ({ id }) => id.includes("road") || id.includes("street"),
            defaultVisibility: true,
          },
          { slug: "building", filter: ({ id }) => id.includes("building"), defaultVisibility: true },
        ],
      },
    ];
  }

  connectedCallback() {
    // Kein Shadow DOM - Kepler.gl/mapbox-gl brauchen direkten DOM-Zugriff
    const props = this.getPropsFromAttributes();

    // Container erstellen (direkt im Element, nicht im Shadow DOM)
    this.container = document.createElement("div");
    this.container.style.cssText = "width: 100%; height: 100%; position: absolute; top: 0; left: 0;";
    this.appendChild(this.container);

    // Styles für das Host-Element
    this.style.cssText = "display: block; position: relative; overflow: hidden; height: 100%;";

    // Map Styles erstellen
    const mapStyles = this.createMapStyles(props.maptilerApiKey);

    // Redux Store erstellen
    const reducers = combineReducers({
      keplerGl: keplerGlReducer.initialState({
        mapState: {
          latitude: props.latitude,
          longitude: props.longitude,
          zoom: props.zoom,
        },
        uiState: {
          readOnly: props.readOnly,
          currentModal: null,
        },
        mapStyle: {
          styleType: props.mapStyle,
        },
      }),
    });

    const middleWares = enhanceReduxMiddleware([]);
    const enhancers = applyMiddleware(...middleWares);
    this.store = createStore(reducers, {}, compose(enhancers));

    // React App rendern
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <Provider store={this.store}>
        <InnerApp initialMode={props.mode} mapStyles={mapStyles} dataBaseUrl={props.dataBaseUrl} />
      </Provider>
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.store = null;
  }
}

export default LitterAppWebComponent;
