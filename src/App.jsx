import * as React from "react";
import ReactDOM from "react-dom/client";
import document from "global/document";

import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { connect, Provider } from "react-redux";

import keplerGlReducer, { enhanceReduxMiddleware } from "@kepler.gl/reducers";

import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import KeplerMap from "./KeplerMap";
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

const App = () => {
  // Load all datasets on mount
  useLoadData();

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
