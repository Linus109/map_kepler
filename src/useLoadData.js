import { useEffect } from "react";
import { useDispatch } from "react-redux";
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

export function useLoadData() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function loadAllData() {
      try {
        // Fetch all datasets in parallel
        const [
          cargoRes,
          fishingRes,
          tankerRes,
          beachRes,
          seafloorRes,
          floatingRes,
        ] = await Promise.all([
          fetch("/data/vessel_density_cargo.geojson"),
          fetch("/data/vessel_density_fishing.geojson"),
          fetch("/data/vessel_density_tanker.geojson"),
          fetch("/data/beach_litter.geojson"),
          fetch("/data/seafloor_litter.geojson"),
          fetch("/data/floating_litter.geojson"),
        ]);

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

        // Parse the saved config using KeplerGlSchema
        // This is required for visualChannels to be properly applied
        // Note: parseSavedConfig expects the full object with version included
        const parsedConfig = KeplerGlSchema.parseSavedConfig(savedConfig);
        console.log("Parsed config:", parsedConfig);

        // Add all datasets with the parsed Kepler config
        dispatch(
          addDataToMap({
            datasets: [
              {
                info: { id: "cargo_density", label: "Cargo Vessel Density" },
                data: processGeojson(cargoData),
              },
              {
                info: { id: "fishing_density", label: "Fishing Vessel Density" },
                data: processGeojson(fishingData),
              },
              {
                info: { id: "tanker_density", label: "Tanker Vessel Density" },
                data: processGeojson(tankerData),
              },
              {
                info: { id: "beach_litter", label: "Beach Litter" },
                data: processGeojson(beachData),
              },
              {
                info: { id: "seafloor_litter", label: "Seafloor Litter" },
                data: processGeojson(seafloorData),
              },
              {
                info: { id: "floating_litter", label: "Floating Micro-litter" },
                data: processGeojson(floatingData),
              },
            ],
            options: {
              centerMap: false, // Use fixed European center (some data is global but focus is Europe)
              readOnly: false,
            },
            config: parsedConfig, // Use the parsed config
          })
        );

        console.log("✓ All datasets loaded with parsed Kepler configuration");
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }

    loadAllData();
  }, [dispatch]);
}
