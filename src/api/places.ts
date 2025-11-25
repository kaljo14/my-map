import httpClient from './httpClient';
import { API_CONFIG } from './config';

export interface Barbershop {
    place_id: string;
    name: string;
    lat: number;
    lng: number;
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
    // Legacy fields for compatibility
    id?: string | number;
    price?: number;
    services?: string[];
}

class PlacesAPI {
    /**
     * Fetches all barbershops
     */
    async getBarbershops(): Promise<Barbershop[]> {
        const response = await httpClient.get(`${API_CONFIG.PLACES_BASE_URL}/api/barbershops`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}

export default new PlacesAPI();
