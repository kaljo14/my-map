import httpClient from './httpClient';

const ENDPOINT = '/api/adres-locations';

export interface AdresLocation {
    offer_id: number;
    url: string;
    property_type?: string;
    neighborhood?: string;
    area_sqm?: number;
    price_eur?: number;
    price_per_sqm?: number;
    floor?: number;
    address_text?: string;
    lat: number;
    lng: number;
    geo_source?: string;
    scraped_at?: string;
}

class AdresLocationsAPI {
    async getListings(): Promise<AdresLocation[]> {
        const response = await httpClient.get(ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data ?? [];
    }
}

export default new AdresLocationsAPI();
