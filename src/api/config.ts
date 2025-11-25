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
};
