import httpClient from './httpClient';

const RETAIL_LISTINGS_ENDPOINT = '/api/retail-listings';

export interface RetailListing {
    id: string;
    title: string;
    address?: string;
    lat: number;
    lng: number;
    size_sqm?: number;
    price_eur?: number;
    listing_url?: string;
    google_maps_url?: string;
    is_exact: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateRetailListingRequest {
    title: string;
    lat: number;
    lng: number;
    address?: string;
    size_sqm?: number;
    price_eur?: number;
    listing_url?: string;
    google_maps_url?: string;
    is_exact: boolean;
}

export type UpdateRetailListingRequest = Partial<CreateRetailListingRequest>;

class RetailListingsAPI {
    async getListings(): Promise<RetailListing[]> {
        const response = await httpClient.get(RETAIL_LISTINGS_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data ?? [];
    }

    async createListing(data: CreateRetailListingRequest): Promise<RetailListing> {
        const response = await httpClient.post(RETAIL_LISTINGS_ENDPOINT, data);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async getListing(id: string): Promise<RetailListing> {
        const response = await httpClient.get(`${RETAIL_LISTINGS_ENDPOINT}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async updateListing(id: string, data: UpdateRetailListingRequest): Promise<RetailListing> {
        const response = await httpClient.put(`${RETAIL_LISTINGS_ENDPOINT}/${id}`, data);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async deleteListing(id: string): Promise<void> {
        const response = await httpClient.delete(`${RETAIL_LISTINGS_ENDPOINT}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
}

export default new RetailListingsAPI();
