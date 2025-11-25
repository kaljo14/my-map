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
        return `${this.getBaseUrl()}/data/grid/{z}/{x}/{y}.pbf`;
    }

    /**
     * Gets the URL template for density vector tiles
     */
    getDensityTileUrlTemplate(): string {
        return `${this.getBaseUrl()}/data/density/{z}/{x}/{y}.pbf`;
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
