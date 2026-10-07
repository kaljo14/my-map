/**
 * API Configuration
 * Centralizes configuration for all API services
 */

export const API_CONFIG = {
    // Base URL for the Places API (Barbershops, etc.)
    PLACES_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/places',

    // Base URL for the Tile Server
    TILES_BASE_URL: import.meta.env.VITE_TILE_SERVER_URL || '/api/tiles',

    // Base URL for Analysis Service
    ANALYSIS_BASE_URL: import.meta.env.VITE_ANALYSIS_BASE_URL || 'http://localhost:8001',

    // Base URL for Martin tile server (vector tiles for opportunity heatmap).
    // Routed through nginx/Vite proxy at /api/martin.
    // MapLibre GL requires absolute URLs for tile sources.
    MARTIN_BASE_URL: `${window.location.origin}/api/martin`,
};
