import httpClient from './httpClient';

const PARKING_ZONES_ENDPOINT = '/api/parking-zones';

export interface ParkingZoneFeature {
    type: 'Feature';
    geometry: GeoJSON.Geometry;
    properties: {
        zone_id: number;
        name: string;
        color: 'blue' | 'green';
    };
}

export interface ParkingZoneCollection {
    type: 'FeatureCollection';
    features: ParkingZoneFeature[];
}

class ParkingZonesAPI {
    async getParkingZones(): Promise<ParkingZoneCollection> {
        const response = await httpClient.get(PARKING_ZONES_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
}

export default new ParkingZonesAPI();
