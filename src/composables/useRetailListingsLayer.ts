import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import RetailListingsAPI, { type RetailListing } from '@/api/retailListings';

const TEAL = '#0d9488';
const TEAL_TRANSLUCENT = 'rgba(13, 148, 136, 0.35)';

export function useRetailListingsLayer() {
    const showRetailListings = ref(false);
    const listings = ref<RetailListing[]>([]);

    let activePopup: maplibregl.Popup | null = null;
    let cachedGeoJSON: GeoJSON.FeatureCollection | null = null;

    function buildGeoJSON(data: RetailListing[]): GeoJSON.FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: data.map(l => ({
                type: 'Feature' as const,
                geometry: {
                    type: 'Point' as const,
                    coordinates: [l.lng, l.lat],
                },
                properties: {
                    id: l.id,
                    title: l.title,
                    address: l.address ?? '',
                    lat: l.lat,
                    lng: l.lng,
                    size_sqm: l.size_sqm ?? null,
                    price_eur: l.price_eur ?? null,
                    listing_url: l.listing_url ?? '',
                    google_maps_url: l.google_maps_url ?? '',
                    is_exact: l.is_exact,
                    created_by: l.created_by ?? '',
                },
            })),
        };
    }

    function formatSize(sqm: number | null): string {
        if (!sqm) return '';
        return `${sqm.toLocaleString()} m\u00B2`;
    }

    function formatPrice(eur: number | null): string {
        if (!eur) return '';
        return `\u20AC${eur.toLocaleString()}/mo`;
    }

    function buildPopupHTML(props: Record<string, any>): string {
        const badge = props.is_exact
            ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:600;background:rgba(13,148,136,0.15);color:#0d9488">Exact</span>'
            : '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:600;background:rgba(245,158,11,0.15);color:#d97706">Approximate</span>';

        const parts: string[] = [
            `<div style="font-family:system-ui;min-width:200px;max-width:300px">`,
            `<h3 style="margin:0 0 6px 0;font-size:1.05rem;font-weight:700;color:#131314">${props.title}</h3>`,
            badge,
        ];

        if (props.address) {
            parts.push(`<p style="margin:8px 0 0;font-size:0.85rem;color:#4a4030"><strong>Address:</strong> ${props.address}</p>`);
        }
        if (props.size_sqm) {
            parts.push(`<p style="margin:4px 0 0;font-size:0.85rem;color:#4a4030"><strong>Size:</strong> ${formatSize(props.size_sqm)}</p>`);
        }
        if (props.price_eur) {
            parts.push(`<p style="margin:4px 0 0;font-size:0.85rem;color:#4a4030"><strong>Price:</strong> ${formatPrice(props.price_eur)}</p>`);
        }

        // Action links row
        const linkStyle = 'color:#0d9488;text-decoration:none;font-size:0.85rem;font-weight:600';
        const actions: string[] = [];

        if (props.listing_url) {
            actions.push(`<a href="${props.listing_url}" target="_blank" rel="noopener" style="${linkStyle}">View Listing &rarr;</a>`);
        }

        if (props.google_maps_url) {
            actions.push(`<a href="${props.google_maps_url}" target="_blank" rel="noopener" style="${linkStyle}">Google Maps &rarr;</a>`);
        }

        if (actions.length > 0) {
            parts.push(`<div style="margin:10px 0 0;display:flex;flex-wrap:wrap;gap:8px 16px">${actions.join('')}</div>`);
        }

        parts.push('</div>');
        return parts.join('');
    }

    async function ensureLayers(map: MapLibreMap) {
        if (!cachedGeoJSON) {
            listings.value = await RetailListingsAPI.getListings();
            cachedGeoJSON = buildGeoJSON(listings.value);
        }

        if (!map.getSource('retail-listings')) {
            map.addSource('retail-listings', {
                type: 'geojson',
                data: cachedGeoJSON,
            });

            // Exact locations: smaller, solid teal circles
            map.addLayer({
                id: 'retail-listings-exact',
                type: 'circle',
                source: 'retail-listings',
                filter: ['==', ['get', 'is_exact'], true],
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 7,
                    'circle-color': TEAL,
                    'circle-stroke-color': '#fff',
                    'circle-stroke-width': 2,
                    'circle-opacity': 0.9,
                },
            });

            // Approximate locations: larger, translucent teal circles
            map.addLayer({
                id: 'retail-listings-approx',
                type: 'circle',
                source: 'retail-listings',
                filter: ['==', ['get', 'is_exact'], false],
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 14,
                    'circle-color': TEAL_TRANSLUCENT,
                    'circle-stroke-color': TEAL,
                    'circle-stroke-width': 1.5,
                    'circle-opacity': 0.7,
                },
            });

            // Click handler for both layers
            for (const layerId of ['retail-listings-exact', 'retail-listings-approx']) {
                map.on('click', layerId, (e) => {
                    const feature = e.features?.[0];
                    if (!feature) return;
                    activePopup?.remove();
                    activePopup = new maplibregl.Popup({ offset: 12 })
                        .setLngLat(e.lngLat)
                        .setHTML(buildPopupHTML(feature.properties))
                        .addTo(map);
                });
                map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
            }
        } else {
            // Source exists — just update data
            const source = map.getSource('retail-listings') as maplibregl.GeoJSONSource | undefined;
            if (source) source.setData(cachedGeoJSON);
        }
    }

    const toggleRetailListings = async (map: MapLibreMap | null) => {
        if (!map) return;
        showRetailListings.value = !showRetailListings.value;
        try {
            await ensureLayers(map);
        } catch (e) {
            showRetailListings.value = !showRetailListings.value;
            console.error('[RetailListings] Failed to load listings:', e);
            return;
        }
        const vis = showRetailListings.value ? 'visible' : 'none';
        if (map.getLayer('retail-listings-exact')) {
            map.setLayoutProperty('retail-listings-exact', 'visibility', vis);
        }
        if (map.getLayer('retail-listings-approx')) {
            map.setLayoutProperty('retail-listings-approx', 'visibility', vis);
        }
    };

    const refresh = async (map: MapLibreMap | null) => {
        if (!map) return;
        cachedGeoJSON = null;
        listings.value = await RetailListingsAPI.getListings();
        cachedGeoJSON = buildGeoJSON(listings.value);
        const source = map.getSource('retail-listings') as maplibregl.GeoJSONSource | undefined;
        if (source) source.setData(cachedGeoJSON);
    };

    return {
        showRetailListings,
        listings,
        toggleRetailListings,
        refresh,
    };
}
