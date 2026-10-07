import httpClient from './httpClient';

// API calls use a relative path so they are handled by whatever is serving
// port 8888 — nginx in production (which proxies /api/* to the backend),
// or the Vite dev proxy in development.
const PLACES_ENDPOINT = '/api/places';

export interface Place {
    place_id: string;
    name: string;
    lat: number;
    lng: number;
    category: string;
    address?: string;
    business_status?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    google_maps_url?: string;
    opening_hours?: string;
    photos?: string;
    icon_url?: string;
    types?: string;
    reviews?: string;
    editorial_summary?: string;
    curbside_pickup?: boolean;
    delivery?: boolean;
    dine_in?: boolean;
    takeout?: boolean;
    reservable?: boolean;
    wheelchair_accessible?: boolean;
    utc_offset_minutes?: number;
    estimated_monthly_visitors?: number;
    visitor_location_score?: number;
    tags?: string[];
    photo_url?: string | null;
    is_open_now?: boolean | null;
    opening_hours_text?: string | null;
    parsed_reviews?: any[] | null;
    // Legacy fields
    id?: string | number;
    price?: number;
    services?: string[];
}

class PlacesAPI {
    async getPlaces(category?: string): Promise<Place[]> {
        const url = category
            ? `${PLACES_ENDPOINT}?category=${encodeURIComponent(category)}`
            : PLACES_ENDPOINT;

        const response = await httpClient.get(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data ?? [];
    }

    async createPlace(data: Partial<Place>): Promise<Place> {
        const response = await httpClient.post(PLACES_ENDPOINT, data);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async deletePlace(placeId: string): Promise<void> {
        const response = await httpClient.delete(`${PLACES_ENDPOINT}/${placeId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
}

export default new PlacesAPI();
