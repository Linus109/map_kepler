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

# Build and serve (useful for testing Web Component)
npm run build:serve
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
- `src/App.jsx` - Redux store setup, MapTiler style definitions, mode selection state
- `src/useLoadData.js` - Custom hook for loading datasets, accepts mode parameter
- `src/KeplerMap.jsx` - Thin wrapper around `<KeplerGl>` component
- `src/ModeSelector.jsx` - Initial mode selection screen (Quick View vs Year Filtering)
- `src/YearSelector.jsx` - Year filter UI (2017-2021 buttons), only shown in yearly mode
- `src/keplerConfig.json` - Exported Kepler.gl configuration with layer definitions
- `src/LitterAppWebComponent.jsx` - Full app as Web Component for external embedding
- `src/litter-app.js` - Entry point for Web Component library build
- `test.html` - Test page for Web Component (loads built UMD bundle)
- `public/data/*.geojson` - 12 GeoJSON files (6 per-year + 6 aggregated)

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

### Data Modes
The app offers two loading modes selected at startup via `ModeSelector`:

**Quick View** (~167 MB):
- Aggregated data across all years (2017-2021)
- Files: `*_agg.geojson`
- Faster load, no year filtering

**Year Filtering** (~827 MB):
- Per-year data with `year` field
- Files: `*.geojson` (without `_agg`)
- Shows `YearSelector` UI for filtering by year

### Data Processing
- All GeoJSON files loaded in parallel via `Promise.all()`
- Mode determines file suffix: aggregated uses `_agg`, yearly uses no suffix
- Loading state watches Kepler.gl Redux state for layer count to show accurate progress
- Original data prepared via `Wiss-Arbeiten/EDA/src/data_prep.py` (generates both versions)

### Year Filtering (yearly mode only)
- `YearSelector` component provides buttons for 2017-2021 and "All"
- Uses Kepler.gl's `addFilter` and `setFilter` actions (wrapped with `wrapTo`)
- Filters are created on first year selection, then updated on subsequent selections

### Web Component

The full app can be built as a standalone Web Component (`<litter-app>`) for embedding in external HTML pages. Includes ModeSelector, data loading, YearSelector, and the Kepler map.

**Build:**
```bash
npm run build  # Outputs to dist/litter-app.umd.cjs
```

**Usage:**
```html
<!-- With ModeSelector (user chooses mode) -->
<litter-app></litter-app>

<!-- Skip ModeSelector, load Quick View directly -->
<litter-app mode="aggregated"></litter-app>

<!-- Skip ModeSelector, load Year Filtering directly -->
<litter-app mode="yearly"></litter-app>

<script src="./dist/litter-app.umd.cjs"></script>
```

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `"aggregated"` \| `"yearly"` | - | Skip ModeSelector if set |
| `data-base-url` | string | `/data` | Base URL for GeoJSON files (e.g., jsDelivr CDN) |
| `latitude` | number | 55.0 | Initial map latitude |
| `longitude` | number | 4.0 | Initial map longitude |
| `zoom` | number | 4 | Initial zoom level |
| `map-style` | string | `maptiler-dark` | Style ID (`maptiler-streets`, `maptiler-satellite`, `maptiler-dark`) |
| `maptiler-api-key` | string | Build-time key | MapTiler API key |
| `read-only` | `"true"` | - | Hide Kepler UI controls |

**Loading data from CDN (jsDelivr):**
```html
<litter-app
  mode="aggregated"
  data-base-url="https://cdn.jsdelivr.net/gh/USER/REPO@TAG/public/data"
></litter-app>
```

**Data Requirements:**
- Host must serve GeoJSON files at `/data/*.geojson`
- Files needed: `vessel_density_cargo.geojson`, `vessel_density_fishing.geojson`, `vessel_density_tanker.geojson`, `beach_litter.geojson`, `seafloor_litter.geojson`, `floating_litter.geojson`
- For aggregated mode: use `*_agg.geojson` files

**Architecture:**
- `LitterAppWebComponent.jsx` extends `HTMLElement` (Custom Element v1)
- No Shadow DOM (Kepler.gl/mapbox-gl require direct DOM access)
- Creates own Redux store instance per component
- Contains `InnerApp` React component that manages mode state and renders ModeSelector/Map/YearSelector
- Uses `useLoadData` hook for data fetching
- `litter-app.js` registers the custom element via `customElements.define("litter-app", ...)`

**Vite Library Build:**
- Entry point: `src/litter-app.js`
- All dependencies bundled (no externals)
- Outputs UMD format for browser compatibility

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
- `VITE_DATA_BASE_URL` - Optional base URL for GeoJSON data (e.g., Cloudflare R2). Falls back to `/data` (local) if not set
- Accessed via `import.meta.env.VITE_*`
- Stored in `.env` file (git-ignored)

## Project Constraints

- No testing framework currently configured
- Large data files (~175 MB) stored in `public/data/` directory
- Temporal data filtered to overlap period: 2017-2021
- Built for modern browsers (ES2020+)
