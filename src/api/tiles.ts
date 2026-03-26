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
     * Fetches grid labels for analysis
     */
    async getGridLabels(): Promise<any> {
        const response = await fetch(`${API_CONFIG.ANALYSIS_BASE_URL}/analysis/grid`);
        if (!response.ok) {
            throw new Error('Failed to fetch grid labels');
        }
        return await response.json();
    }
}

export default new TilesAPI();
