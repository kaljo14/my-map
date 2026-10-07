import auth from '@/services/auth';
import { API_CONFIG } from './config';

class TilesAPI {
    /**
     * Gets the base URL for the tile server
     */
    getBaseUrl(): string {
        return API_CONFIG.TILES_BASE_URL;
    }

    /**
     * Gets the URL template for vector tiles
     */
    getTileUrlTemplate(): string {
        return `${this.getBaseUrl()}/data/density/{z}/{x}/{y}.pbf`;
    }


    /**
     * Gets the URL template for population grid vector tiles served by Martin.
     */
    getPopulationGridTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/population_grid/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for specific metro line vector tiles served by Martin.
     * @param lineId - The ID of the metro line (e.g., 'M1', 'M2')
     */
    getMetroLineTileUrlTemplate(lineId: string): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/metro_line_${lineId}/{z}/{x}/{y}`;
    }

    /**
     * Gets authentication headers for tile requests
     */
    getAuthHeaders(): Record<string, string> {
        const token = auth.getToken();
        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Gets the URL template for the opportunity heatmap vector tiles served by Martin.
     * Tile layer name: opportunity_heatmap; feature properties: category (string), score (0–100).
     */
    getOpportunityHeatmapTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/opportunity_heatmap/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for OSM pedestrian network edge tiles served by Martin.
     * Tile layer name: osm_edges; feature properties: walk_score (0–100), highway, osm_way_id.
     */
    getOsmEdgesTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/osm_edges/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for OSM POI tiles served by Martin.
     * Tile layer name: osm_pois; feature properties: name, category, amenity, shop, tourism, leisure.
     */
    getOsmPoisTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/osm_pois/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan urban zoning vector tiles served by Martin.
     * Tile layer name: sofiaplan_zoning_tiles; feature properties: score, label.
     */
    getSofiaPlanZoningTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_zoning_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan income levels vector tiles served by Martin.
     * Tile layer name: sofiaplan_income_tiles; feature properties: score (903–1806 BGN), label.
     */
    getSofiaPlanIncomeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_income_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan property prices vector tiles served by Martin.
     * Tile layer name: sofiaplan_property_prices_tiles; feature properties: score (121–2412 BGN/m²), label.
     */
    getSofiaPlanPropertyPricesTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_property_prices_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan metro catchment zones vector tiles served by Martin.
     * Tile layer name: sofiaplan_metro_catchments_tiles; feature properties: score (400–2000 m), label.
     */
    getSofiaPlanMetroCatchmentsTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_metro_catchments_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan pedestrian space syntax vector tiles served by Martin.
     * Tile layer name: sofiaplan_pedestrian_syntax_tiles; feature properties: score (3–17828), label.
     */
    getSofiaPlanPedestrianSyntaxTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_syntax_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan population grid vector tiles served by Martin.
     * Tile layer name: sofiaplan_population_grid_tiles; feature properties: score (0–23934), label.
     */
    getSofiaPlanPopulationGridTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_population_grid_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan business turnover vector tiles served by Martin.
     * Tile layer name: sofiaplan_business_turnover_tiles; feature properties: score (38–14576), label.
     */
    getSofiaPlanBusinessTurnoverTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_business_turnover_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan development potential vector tiles served by Martin.
     * Tile layer name: sofiaplan_development_potential_tiles; feature properties: score (1–3), label.
     */
    getSofiaPlanDevelopmentPotentialTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_development_potential_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan zoning parameters vector tiles served by Martin.
     * Tile layer name: sofiaplan_zoning_params; feature properties: far (float), max_height (integer).
     */
    getSofiaPlanZoningParamsTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_zoning_params/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan neighborhoods vector tiles served by Martin.
     * Tile layer name: sofiaplan_neighborhoods_tiles; feature properties: label (neighborhood name).
     */
    getSofiaPlanNeighborhoodsTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_neighborhoods_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan census addresses vector tiles served by Martin.
     * Tile layer name: sofiaplan_census_addresses_tiles; feature properties: score (population per address).
     */
    getSofiaPlanCensusAddressesTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_census_addresses_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan demographic forecast vector tiles served by Martin.
     * Tile layer name: sofiaplan_demographic_forecast_tiles; feature properties: score (pop 2017), forecast_2030, forecast_2040, forecast_2050.
     */
    getSofiaPlanDemographicForecastTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_demographic_forecast_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan demographic forecast GE vector tiles served by Martin.
     * Tile layer name: sofiaplan_demographic_forecast_ge_tiles; feature properties: score (pop per planning unit), forecast_2030, forecast_2040, forecast_2050.
     */
    getSofiaPlanDemographicForecastGeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_demographic_forecast_ge_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan population potential vector tiles served by Martin.
     * Tile layer name: sofiaplan_population_potential_tiles; feature properties: score (potential pop at 30m²/person).
     */
    getSofiaPlanPopulationPotentialTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_population_potential_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan residential load vector tiles served by Martin.
     * Tile layer name: sofiaplan_residential_load_tiles; feature properties: score (residential load density).
     */
    getSofiaPlanResidentialLoadTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_residential_load_tiles/{z}/{x}/{y}`;
    }

    // ── Accessibility & Transport tile URL templates ──────────────────────────

    /**
     * Gets the URL template for transit accessibility by GE (urban planning unit) tiles.
     * Tile layer name: sofiaplan_transit_access_ge_tiles; feature properties: score (accessibility index), label.
     */
    getSofiaPlanTransitAccessGeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_transit_access_ge_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for transit accessibility by transport district tiles.
     * Tile layer name: sofiaplan_transit_access_district_tiles; feature properties: score (accessibility index), label.
     */
    getSofiaPlanTransitAccessDistrictTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_transit_access_district_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for metro accessibility 800 m catchment tiles.
     * Tile layer name: sofiaplan_metro_access_800m_tiles; feature properties: score (break distance m), label.
     */
    getSofiaPlanMetroAccess800mTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_metro_access_800m_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for metro accessibility 1200 m+ catchment tiles.
     * Tile layer name: sofiaplan_metro_access_1200m_tiles; feature properties: score (break distance m), label.
     */
    getSofiaPlanMetroAccess1200mTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_metro_access_1200m_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for bus lines (primary dataset) tiles.
     * Tile layer name: sofiaplan_bus_lines_tiles; feature properties: label (route number).
     */
    getSofiaPlanBusLinesTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_bus_lines_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for bus lines (alternate dataset) tiles.
     * Tile layer name: sofiaplan_bus_lines_alt_tiles; feature properties: label (route number).
     */
    getSofiaPlanBusLinesAltTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_bus_lines_alt_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for trolleybus lines tiles.
     * Tile layer name: sofiaplan_trolleybus_lines_tiles; feature properties: label (route number).
     */
    getSofiaPlanTrolleybusLinesTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_trolleybus_lines_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for tram lines (primary dataset) tiles.
     * Tile layer name: sofiaplan_tram_lines_tiles; feature properties: label (route number).
     */
    getSofiaPlanTramLinesTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_tram_lines_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for tram lines (alternate dataset) tiles.
     * Tile layer name: sofiaplan_tram_lines_alt_tiles; feature properties: label (route number).
     */
    getSofiaPlanTramLinesAltTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_tram_lines_alt_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for railway stations with passenger load tiles.
     * Tile layer name: sofiaplan_railway_stations_tiles; feature properties: score (annual passengers), label.
     */
    getSofiaPlanRailwayStationsTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_railway_stations_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for built cycling network (primary) tiles.
     * Tile layer name: sofiaplan_cycling_network_tiles; feature properties: label (path type), direction, length_m.
     */
    getSofiaPlanCyclingNetworkTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_cycling_network_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for built cycling network (alternate) tiles.
     * Tile layer name: sofiaplan_cycling_network_alt_tiles; feature properties: label (path type), direction.
     */
    getSofiaPlanCyclingNetworkAltTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_cycling_network_alt_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for planned cycling extensions tiles.
     * Tile layer name: sofiaplan_cycling_planned_tiles; feature properties: label (street name), priority, project, note.
     */
    getSofiaPlanCyclingPlannedTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_cycling_planned_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for health service concentration vector tiles served by Martin.
     * Tile layer name: sofiaplan_health_service_concentration_tiles; feature properties: score (concentration index), label.
     */
    getSofiaPlanHealthServiceConcentrationTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_health_service_concentration_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for health infrastructure concentration by GE vector tiles served by Martin.
     * Tile layer name: sofiaplan_health_infrastructure_concentration_tiles; feature properties: score (concentration index), label.
     */
    getSofiaPlanHealthInfrastructureConcentrationTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_health_infrastructure_concentration_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan building density by GE vector tiles served by Martin.
     * Tile layer name: sofiaplan_building_density_ge_tiles; feature properties: ge_id, label, district, score (density/plot_coverage 0–1), intensity (floor_area_ratio), enclosure_ratio, avg_floors.
     */
    getSofiaPlanBuildingDensityGeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_building_density_ge_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan building footprint by GE vector tiles served by Martin.
     * Tile layer name: sofiaplan_building_footprint_ge_tiles; feature properties: ge_id, label, district, score=rzp (total floor area m²), zp (footprint m²), rzp, avg_floors.
     */
    getSofiaPlanBuildingFootprintGeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_building_footprint_ge_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan residential typology by GE vector tiles served by Martin.
     * Tile layer name: sofiaplan_residential_typology_ge_tiles; feature properties: ge_id, label, district, typology (string), single_pct, multi_pct, panel_pct, score (1=single, 2=multi, 3=panel, 0=unknown).
     */
    getSofiaPlanResidentialTypologyGeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_residential_typology_ge_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for SofiaPlan urban morphology by GE vector tiles served by Martin.
     * Tile layer name: sofiaplan_urban_morphology_ge_tiles; feature properties: ge_id, label, district, morphology (string), score (1=вили, 2=компактна, 3=панелна/масив, 4=индустриална, 5=смесена, 0=unknown).
     */
    getSofiaPlanUrbanMorphologyGeTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_urban_morphology_ge_tiles/{z}/{x}/{y}`;
    }

    /** Blue (city-centre) parking zone — table sofiaplan_parking_green */
    getParkingBlueTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_parking_green/{z}/{x}/{y}`;
    }

    /** Green (outer) parking zone — table sofiaplan_parking_blue */
    getParkingGreenTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_parking_blue/{z}/{x}/{y}`;
    }

    // ── Pedestrian Network tile URL templates ──────────────────────────────────

    /** Pedestrian network — Sofia city (ID 318). Line layer: score, choice, connectivity, segment_length. */
    getPedestrianCityTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_city_tiles/{z}/{x}/{y}`;
    }

    /** Pedestrian network — Sofia city alt (ID 309). Line layer: score, choice, connectivity, segment_length. */
    getPedestrianCityAltTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_city_alt_tiles/{z}/{x}/{y}`;
    }

    /** Pedestrian network — Sofia municipality (ID 332). Line layer: score, choice, connectivity, segment_length. */
    getPedestrianMunicipalityTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_municipality_tiles/{z}/{x}/{y}`;
    }

    /** Pedestrian network — Sofia municipality alt (ID 361). Line layer: score, choice, connectivity, segment_length. */
    getPedestrianMunicipalityAltTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_municipality_alt_tiles/{z}/{x}/{y}`;
    }

    /** Pedestrian network segmented (ID 284). Line layer: score, choice, connectivity, segment_length. */
    getPedestrianSegmentedTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_segmented_tiles/{z}/{x}/{y}`;
    }

    /** Pedestrian integration near infrastructure dividers (ID 603). Polygon layer: label, district, score, choice. */
    getPedestrianIntegrationTileUrl(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_pedestrian_integration_tiles/{z}/{x}/{y}`;
    }

    // ── Flood Risk tile URL templates ─────────────────────────────────────

    /** Flood risk — low probability (dataset 465). Polygon layer: label, zone_id, score=1, risk_level=1. */
    getSofiaPlanFloodRiskLowTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_flood_risk_low_tiles/{z}/{x}/{y}`;
    }

    /** Flood risk — medium probability (dataset 412). Polygon layer: label, zone_id, score=2, risk_level=2. */
    getSofiaPlanFloodRiskMediumTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_flood_risk_medium_tiles/{z}/{x}/{y}`;
    }

    /** Flood risk — high probability (dataset 446). Polygon layer: label, zone_id, score=3, risk_level=3. */
    getSofiaPlanFloodRiskHighTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/sofiaplan_flood_risk_high_tiles/{z}/{x}/{y}`;
    }

    // ── Food Access (Desert) tile URL templates ──────────────────────────────

    /** Grocery desert H3 hexagons — big-chain supermarkets only. Feature properties: score (0–100), population, nearest_m, poi_count. */
    getGroceryDesertTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/grocery_desert_tiles/{z}/{x}/{y}`;
    }

    /**
     * Fetches grid labels for analysis
     */
    async getGridLabels(): Promise<any> {
        const response = await fetch(`${API_CONFIG.ANALYSIS_BASE_URL}/analysis/grid`);
        if (!response.ok) {
            throw new Error('Failed to fetch grid labels');
        }
        return await response.json();
    }

    /**
     * Gets the URL template for pedestrian sensor tiles served by Martin.
     * Tile layer name: pedestrian_sensors_tiles; feature properties: device_id, total_pedestrians, total_left, total_right, reading_count.
     */
    getPedestrianSensorsTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/pedestrian_sensors_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for calibrated foot traffic vector tiles served by Martin.
     * Tile layer name: calibrated_foot_traffic_tiles; feature properties: predicted_hourly (int), integration, choice, neighborhood, segment_length.
     */
    getCalibratedFootTrafficTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/calibrated_foot_traffic_tiles/{z}/{x}/{y}`;
    }

    /**
     * Gets the URL template for ultimate foot traffic vector tiles served by Martin.
     * Tile layer name: ultimate_foot_traffic_tiles; feature properties:
     * predicted_hourly (int), integration, syntax_pctl, pop_pctl, poi_pctl, transit_pctl, neighborhood, segment_length.
     */
    getUltimateFootTrafficTileUrlTemplate(): string {
        return `${API_CONFIG.MARTIN_BASE_URL}/ultimate_foot_traffic_tiles/{z}/{x}/{y}`;
    }
}

export default new TilesAPI();
