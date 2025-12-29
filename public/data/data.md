# Data Sources

## Vessel Traffic Density by Ship Type

### Cargo Vessels (`vessel_density_cargo.geojson`)
- **Source**: EMODnet Human Activities - Vessel Density Map (Ship Type 01)
- **URL**: https://ows.emodnet-humanactivities.eu/geonetwork/srv/api/records/0f2f3ff1-30ef-49e1-96e7-8ca78d58a07c
- **Period**: 2017-2021 (monthly data aggregated to annual average)
- **Processing**: 3x downsampled GeoTIFF → Polygon squares (3km cells), reprojected EPSG:3035 → EPSG:4326
- **Records**: ~200,000 polygon squares
- **Unit**: Hours per km² per year

### Fishing Vessels (`vessel_density_fishing.geojson`)
- **Source**: EMODnet Human Activities - Vessel Density Map (Ship Type 04)
- **Period**: 2017-2021 (monthly data aggregated to annual average)
- **Records**: ~58,000 polygon squares

### Tanker Vessels (`vessel_density_tanker.geojson`)
- **Source**: EMODnet Human Activities - Vessel Density Map (Ship Type 10)
- **Period**: 2017-2021 (monthly data aggregated to annual average)
- **Records**: ~109,000 polygon squares

---

## EMODnet Litter Datasets

### Beach Litter (`beach_litter.geojson`)
- **Source**: EMODnet Chemistry 2023 - European beach litter standardized datasets
- **URL**: https://emodnet.ec.europa.eu/geonetwork/srv/api/records/2b444000-036e-49ee-92c8-e5b265cf4a4f
- **Period**: Filtered to 2017-2021
- **Processing**: Aggregated from XLSX (Beaches + Surveys + Litter sheets)
- **Records**: 1,340 beach locations
- **Fields**: `total_items`, `survey_count`, `years`

### Seafloor Litter (`seafloor_litter.geojson`)
- **Source**: EMODnet Chemistry 2021 - European seafloor litter datasets
- **URL**: https://emodnet.ec.europa.eu/geonetwork/srv/api/records/72155279-1315-48ce-99a1-48a957ed599b
- **Period**: Filtered to 2017-2021
- **Processing**: Aggregated from CSV, coordinates rounded to 0.01°
- **Records**: 14,849 trawl survey locations
- **Fields**: `total_items`, `trawl_count`

### Floating Micro-litter (`floating_litter.geojson`)
- **Source**: EMODnet Chemistry 2024 - European floating micro-litter datasets
- **URL**: https://emodnet.ec.europa.eu/geonetwork/srv/api/records/962dd666-0aef-4792-8bff-c9f8129f701f
- **Period**: Filtered to 2017-2021
- **Processing**: Parsed ODV format, coordinates rounded to 0.1°
- **Records**: 1,544 sample locations
- **Fields**: `sample_count`

---

*Data prepared: 2025-12-29*
*Processing script: `Wiss-Arbeiten/EDA/src/data_prep.py`*
*Temporal overlap period: 2017-2021*
