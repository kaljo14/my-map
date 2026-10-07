import httpClient from './httpClient';


export interface MetroLineProperties {
    route_color: string;
    route_short_name: string;
    route_long_name: string;
}

export interface MetroFeature {
    type: "Feature";
    properties: MetroLineProperties;
    geometry: {
        type: "LineString";
        coordinates: number[][];
    };
}

export interface MetroFeatureCollection {
    type: "FeatureCollection";
    features: MetroFeature[];
}

export interface MetroStopProperties {
    line: string;
    route_color: string;
    route_text_color: string;
    stop_id: string;
    stop_name: string;
}

export interface MetroStopFeature {
    type: "Feature";
    properties: MetroStopProperties;
    geometry: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
}

export interface MetroStopFeatureCollection {
    type: "FeatureCollection";
    features: MetroStopFeature[];
}

export interface TransitStopProperties {
    stop_id: string;
    stop_name: string;
    stop_type: string; // "bus" | "tram" | "trolleybus" | "other"
}

export interface TransitStopFeature {
    type: "Feature";
    properties: TransitStopProperties;
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
}

export interface TransitStopFeatureCollection {
    type: "FeatureCollection";
    features: TransitStopFeature[];
}

class MetroAPI {
    /**
     * Fetches metro line shapes
     */
    async getMetroShapes(): Promise<MetroFeatureCollection> {
        // Use the proxy path configured in vite.config.ts or the base URL from config if applicable
        // Since we added /api/metro proxy, we can target it directly relative to root if we want,
        // but let's stick to a pattern.
        // API_CONFIG doesn't have METRO_BASE_URL, but we can assume it follows the pattern.
        // Let's assume the proxy /api/metro forwards to localhost:8080/api/metro
        // So requesting /api/metro/shapes should work if the backend expects /api/metro/shapes.
        // Wait, the requirement says "API Endpoint: GET /api/metro/shapes".
        // The proxy sends /api/metro -> http://localhost:8080/api/metro.
        // So we request /api/metro/shapes.

        const response = await httpClient.get('/api/metro/shapes');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetches metro stops
     */
    async getMetroStops(): Promise<MetroStopFeatureCollection> {
        const response = await httpClient.get('/api/metro/stops');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetches transit stops (bus, tram, trolleybus)
     */
    async getTransitStops(): Promise<TransitStopFeatureCollection> {
        const response = await httpClient.get('/api/metro/transit-stops');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}

export default new MetroAPI();
