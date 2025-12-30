# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based geospatial visualization application built with Kepler.gl for analyzing marine litter and vessel traffic patterns. The app visualizes:
- **Vessel density** by ship type (cargo, fishing, tanker) from 2017-2021
- **Marine litter** data (beach, seafloor, floating micro-litter) from EMODnet Chemistry

Data sources are documented in `public/data/data.md`.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to /dist)
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Architecture

### Data Flow
1. **App.jsx** sets up Redux store with Kepler.gl reducer and MapTiler map styles
2. **useLoadData.js** hook (called from App) fetches 6 GeoJSON files in parallel on mount
3. Data is processed with `@kepler.gl/processors.processGeojson()`
4. **keplerConfig.json** is parsed with `KeplerGlSchema.parseSavedConfig()` to ensure layer configurations are properly applied
5. All datasets dispatched to Redux via `addDataToMap` action
6. **KeplerMap.jsx** renders the Kepler.gl component with responsive sizing

### Key Files
- `src/App.jsx` - Redux store setup, MapTiler style definitions (streets/satellite/dark), initial map state centered on North Sea
- `src/useLoadData.js` - Custom hook for loading all 6 GeoJSON datasets and dispatching to Redux
- `src/KeplerMap.jsx` - Thin wrapper around `<KeplerGl>` component
- `src/keplerConfig.json` - Exported Kepler.gl configuration with layer definitions (spectral color gradients for vessel density, 3D hexbins for litter)
- `public/data/*.geojson` - 6 GeoJSON datasets (~175 MB total)

### State Management
- Redux with `@kepler.gl/reducers`
- Store created in App.jsx (not src/store.js which is unused)
- Initial state includes mapState, uiState, and mapStyle configuration

### Map Configuration
- **Map provider**: MapTiler (not Mapbox) via `VITE_MAPTILER_API_KEY` environment variable
- **Map styles**: 3 custom MapTiler styles defined in App.jsx (Streets, Satellite, Dark)
- **Default style**: maptiler-dark
- **centerMap disabled**: Uses fixed European center (North Sea: lat 55.0, lon 4.0, zoom 4) since some data is global but focus is Europe
- **Map view**: Top-down 2D view (bearing: 0, pitch: 0). The mapState in keplerConfig.json must match App.jsx initial state to avoid view jumps on load

### Data Processing
- All GeoJSON files loaded in parallel via `Promise.all()`
- Vessel density datasets contain 200k+ polygon features (3km grid cells)
- Litter datasets contain point features with aggregated counts
- Original data prepared via external Python script at `Wiss-Arbeiten/EDA/src/data_prep.py`

## Important Technical Details

### Kepler.gl Configuration
- Configuration must be parsed with `KeplerGlSchema.parseSavedConfig()` before use
- This ensures visualChannels (color scales, elevation, etc.) are properly applied
- Config exported from Kepler.gl UI includes version field required for parsing

### Dataset IDs
When modifying data loading in useLoadData.js, dataset IDs must match those referenced in keplerConfig.json:
- `cargo_density` - Cargo Vessel Density
- `fishing_density` - Fishing Vessel Density
- `tanker_density` - Tanker Vessel Density
- `beach_litter` - Beach Litter
- `seafloor_litter` - Seafloor Litter
- `floating_litter` - Floating Micro-litter

### ESLint Custom Rules
- `no-unused-vars` allows variables starting with uppercase (for React components)
- Uses ESLint v9 flat config format
- Ignores `/dist` directory

### Environment Variables
- `VITE_MAPTILER_API_KEY` - Required for MapTiler map tiles
- Accessed via `import.meta.env.VITE_MAPTILER_API_KEY`
- Stored in `.env` file (git-ignored)

## Project Constraints

- No testing framework currently configured
- Large data files (~175 MB) stored in `public/data/` directory
- Temporal data filtered to overlap period: 2017-2021
- Built for modern browsers (ES2020+)
