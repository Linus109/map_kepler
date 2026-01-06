import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDataToMap } from "@kepler.gl/actions";
import { processGeojson } from "@kepler.gl/processors";
import KeplerGlSchema from "@kepler.gl/schemas";
import savedConfig from "./keplerConfig.json";

/**
 * Visualization strategy matching the paper:
 *
 * 1. Vessel Density by Type: Point layers colored by density (spectral: blue→red)
 *    - Cargo, Fishing, Tanker vessels
 * 2. Litter Data: 3D Hexbin layers (height = litter count)
 *
 * All data filtered to overlap period: 2017-2021
 *
 * Config is loaded from keplerConfig.json (exported from Kepler.gl UI)
 * The config is parsed using KeplerGlSchema.parseSavedConfig to ensure
 * visualChannels and other layer settings are properly applied.
 */

const EXPECTED_LAYERS = 6;

// Use env variable for remote data (Cloudflare R2), fallback to local with base path
const DEFAULT_DATA_URL = import.meta.env.VITE_DATA_BASE_URL || `${import.meta.env.BASE_URL}data`;

export function useLoadData(mode, baseUrl = DEFAULT_DATA_URL) {
  const dispatch = useDispatch();
  const [fetchProgress, setFetchProgress] = useState("Initializing...");
  const [dataDispatched, setDataDispatched] = useState(false);

  // Watch Kepler.gl state to detect when all layers are ready
  const layerCount = useSelector(
    (state) => state.keplerGl?.map?.visState?.layers?.length || 0
  );
  const datasetCount = useSelector(
    (state) => Object.keys(state.keplerGl?.map?.visState?.datasets || {}).length
  );

  // Data is fully loaded when all datasets and layers are present
  const isReady = dataDispatched && datasetCount >= EXPECTED_LAYERS && layerCount >= EXPECTED_LAYERS;

  // Determine current progress message
  let progress = fetchProgress;
  if (dataDispatched && !isReady) {
    progress = `Rendering layers... (${layerCount}/${EXPECTED_LAYERS})`;
  }

  useEffect(() => {
    // Don't load until mode is selected
    if (!mode) return;

    async function loadAllData() {
      try {
        setFetchProgress("Fetching datasets...");

        // Use aggregated files for quick view, yearly files for year filtering
        const suffix = mode === "aggregated" ? "_agg" : "";

        // Fetch all datasets in parallel
        // baseUrl can be empty (local) or a CDN URL like https://cdn.jsdelivr.net/gh/user/repo@tag/public/data
        const dataPath = baseUrl || DEFAULT_DATA_URL;
        const [
          cargoRes,
          fishingRes,
          tankerRes,
          beachRes,
          seafloorRes,
          floatingRes,
        ] = await Promise.all([
          fetch(`${dataPath}/vessel_density_cargo${suffix}.geojson`),
          fetch(`${dataPath}/vessel_density_fishing${suffix}.geojson`),
          fetch(`${dataPath}/vessel_density_tanker${suffix}.geojson`),
          fetch(`${dataPath}/beach_litter${suffix}.geojson`),
          fetch(`${dataPath}/seafloor_litter${suffix}.geojson`),
          fetch(`${dataPath}/floating_litter${suffix}.geojson`),
        ]);

        setFetchProgress("Parsing JSON data...");

        const [
          cargoData,
          fishingData,
          tankerData,
          beachData,
          seafloorData,
          floatingData,
        ] = await Promise.all([
          cargoRes.json(),
          fishingRes.json(),
          tankerRes.json(),
          beachRes.json(),
          seafloorRes.json(),
          floatingRes.json(),
        ]);

        console.log("Loaded datasets:", {
          cargo: cargoData.features?.length,
          fishing: fishingData.features?.length,
          tanker: tankerData.features?.length,
          beachLitter: beachData.features?.length,
          seafloorLitter: seafloorData.features?.length,
          floatingLitter: floatingData.features?.length,
        });

        setFetchProgress("Processing GeoJSON features...");

        // Small delay to let UI update before heavy processing
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Process GeoJSON data (this is CPU intensive)
        const processedData = {
          cargo: processGeojson(cargoData),
          fishing: processGeojson(fishingData),
          tanker: processGeojson(tankerData),
          beach: processGeojson(beachData),
          seafloor: processGeojson(seafloorData),
          floating: processGeojson(floatingData),
        };

        setFetchProgress("Building map layers...");
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Parse the saved config using KeplerGlSchema
        const parsedConfig = KeplerGlSchema.parseSavedConfig(savedConfig);
        console.log("Parsed config:", parsedConfig);

        // Add all datasets with the parsed Kepler config
        dispatch(
          addDataToMap({
            datasets: [
              {
                info: { id: "cargo_density", label: "Cargo Vessel Density" },
                data: processedData.cargo,
              },
              {
                info: { id: "fishing_density", label: "Fishing Vessel Density" },
                data: processedData.fishing,
              },
              {
                info: { id: "tanker_density", label: "Tanker Vessel Density" },
                data: processedData.tanker,
              },
              {
                info: { id: "beach_litter", label: "Beach Litter" },
                data: processedData.beach,
              },
              {
                info: { id: "seafloor_litter", label: "Seafloor Litter" },
                data: processedData.seafloor,
              },
              {
                info: { id: "floating_litter", label: "Floating Micro-litter" },
                data: processedData.floating,
              },
            ],
            options: {
              centerMap: false, // Use fixed European center (some data is global but focus is Europe)
              readOnly: false,
            },
            config: parsedConfig, // Use the parsed config
          })
        );

        console.log("✓ Data dispatched to Kepler.gl");
        setDataDispatched(true);
      } catch (error) {
        console.error("Failed to load data:", error);
        setFetchProgress("Error loading data");
      }
    }

    loadAllData();
  }, [dispatch, mode, baseUrl]);

  return { loading: !isReady, progress };
}
