import { ref, computed } from 'vue';
import type { Barbershop } from './useBarbershops';

export interface OpportunityZone {
    lat: number;
    lng: number;
    nearestDistance: number;
}

export function useOpportunityZones(barbershops: { value: Barbershop[] }) {
    const searchRadius = ref(1.5); // km
    const showOpportunityZones = ref(false);

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const opportunityZones = computed((): OpportunityZone[] => {
        if (!showOpportunityZones.value) return [];

        const zones: OpportunityZone[] = [];

        // Define Sofia bounds
        const latStart = 42.62;
        const latEnd = 42.75;
        const minLng = 23.27;
        const maxLng = 23.38;

        // Grid step size (smaller = more points, more accurate but slower)
        // Using 0.015 (~1.5km) for better performance while maintaining accuracy
        const gridStep = 0.015;

        // Check each grid point
        for (let lat = latStart; lat <= latEnd; lat += gridStep) {
            for (let lng = minLng; lng <= maxLng; lng += gridStep) {
                // Find distance to nearest barbershop
                let minDistance = Infinity;

                barbershops.value.forEach(shop => {
                    const dist = calculateDistance(lat, lng, shop.lat, shop.lng);
                    if (dist < minDistance) minDistance = dist;
                });

                // If nearest shop is further than radius, it's an opportunity zone
                if (minDistance > searchRadius.value) {
                    zones.push({
                        lat,
                        lng,
                        nearestDistance: minDistance
                    });
                }
            }
        }

        // Filter to avoid too many overlapping points
        // Keep only zones that are at least 0.5km apart
        const filteredZones: OpportunityZone[] = [];
        const minZoneDistance = 0.5; // km

        zones.forEach(zone => {
            const isTooClose = filteredZones.some(existing =>
                calculateDistance(zone.lat, zone.lng, existing.lat, existing.lng) < minZoneDistance
            );

            if (!isTooClose) {
                filteredZones.push(zone);
            }
        });

        // Sort by distance (furthest from nearest barbershop = best opportunity)
        return filteredZones.sort((a, b) => b.nearestDistance - a.nearestDistance);
    });

    const toggleOpportunityZones = () => {
        showOpportunityZones.value = !showOpportunityZones.value;
    };

    return {
        searchRadius,
        showOpportunityZones,
        opportunityZones,
        toggleOpportunityZones
    };
}
