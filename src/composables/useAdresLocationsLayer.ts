import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import AdresLocationsAPI, { type AdresLocation } from '@/api/adresLocations';

const PURPLE = '#7c3aed';
const PURPLE_TRANSLUCENT = 'rgba(124, 58, 237, 0.3)';

export function useAdresLocationsLayer() {
    const showAdresLocations = ref(false);
    const listings = ref<AdresLocation[]>([]);

    let activePopup: maplibregl.Popup | null = null;
    let cachedGeoJSON: GeoJSON.FeatureCollection | null = null;

    function buildGeoJSON(data: AdresLocation[]): GeoJSON.FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: data.map(l => ({
                type: 'Feature' as const,
                geometry: {
                    type: 'Point' as const,
                    coordinates: [l.lng, l.lat],
                },
                properties: {
                    offer_id: l.offer_id,
                    url: l.url,
                    property_type: l.property_type ?? '',
                    neighborhood: l.neighborhood ?? '',
                    area_sqm: l.area_sqm ?? null,
                    price_eur: l.price_eur ?? null,
                    price_per_sqm: l.price_per_sqm ?? null,
                    floor: l.floor ?? null,
                    address_text: l.address_text ?? '',
                    geo_source: l.geo_source ?? '',
                    scraped_at: l.scraped_at ?? '',
                },
            })),
        };
    }

    function formatFloor(floor: number | null): string {
        if (floor === null || floor === undefined) return '';
        if (floor === 0) return 'Ground floor';
        if (floor === -1) return 'Basement';
        return `Floor ${floor}`;
    }

    function buildPopupHTML(props: Record<string, any>): string {
        const typeColors: Record<string, string> = {
            'Магазин': '#16a34a',
            'Офис': '#2563eb',
            'Цех/Склад': '#d97706',
            'Офис Сграда/Търговски център': '#7c3aed',
        };
        const typeColor = typeColors[props.property_type] || PURPLE;
        const typeBadge = props.property_type
            ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:600;background:${typeColor}20;color:${typeColor}">${props.property_type}</span>`
            : '';

        const parts: string[] = [
            `<div style="font-family:system-ui;min-width:220px;max-width:320px">`,
        ];

        // Title: property type + neighborhood
        const title = [props.property_type, props.neighborhood].filter(Boolean).join(' \u2014 ');
        if (title) {
            parts.push(`<h3 style="margin:0 0 6px 0;font-size:1.05rem;font-weight:700;color:#131314">${title}</h3>`);
        }

        if (typeBadge) {
            parts.push(typeBadge);
        }

        // Info grid
        const gridItems: string[] = [];

        if (props.area_sqm) {
            gridItems.push(`<div><span style="color:#6b7280;font-size:0.75rem">Area</span><br><strong>${props.area_sqm.toLocaleString()} m\u00B2</strong></div>`);
        }
        if (props.price_eur) {
            gridItems.push(`<div><span style="color:#6b7280;font-size:0.75rem">Price</span><br><strong>\u20AC${props.price_eur.toLocaleString()}/mo</strong></div>`);
        }
        if (props.price_per_sqm) {
            gridItems.push(`<div><span style="color:#6b7280;font-size:0.75rem">\u20AC/m\u00B2</span><br><strong>\u20AC${props.price_per_sqm.toFixed(2)}</strong></div>`);
        }
        if (props.floor !== null && props.floor !== undefined) {
            gridItems.push(`<div><span style="color:#6b7280;font-size:0.75rem">Floor</span><br><strong>${formatFloor(props.floor)}</strong></div>`);
        }

        if (gridItems.length > 0) {
            parts.push(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin:10px 0 0;font-size:0.85rem;color:#1f2937">${gridItems.join('')}</div>`);
        }

        if (props.neighborhood) {
            parts.push(`<p style="margin:8px 0 0;font-size:0.8rem;color:#6b7280">\uD83D\uDCCD ${props.neighborhood}</p>`);
        }

        if (props.address_text) {
            // Clean up whitespace from scraped address
            const cleanAddr = props.address_text.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
            if (cleanAddr.length > 0 && cleanAddr.length < 120) {
                parts.push(`<p style="margin:4px 0 0;font-size:0.8rem;color:#6b7280">${cleanAddr}</p>`);
            }
        }

        // Link to address.bg listing
        if (props.url) {
            parts.push(`<div style="margin:10px 0 0"><a href="${props.url}" target="_blank" rel="noopener" style="color:${PURPLE};text-decoration:none;font-size:0.85rem;font-weight:600">View on address.bg \u2192</a></div>`);
        }

        parts.push('</div>');
        return parts.join('');
    }

    async function ensureLayers(map: MapLibreMap) {
        if (!cachedGeoJSON) {
            listings.value = await AdresLocationsAPI.getListings();
            cachedGeoJSON = buildGeoJSON(listings.value);
        }

        if (!map.getSource('adres-locations')) {
            map.addSource('adres-locations', {
                type: 'geojson',
                data: cachedGeoJSON,
            });

            // Main circles
            map.addLayer({
                id: 'adres-locations-circle',
                type: 'circle',
                source: 'adres-locations',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        10, 4,
                        14, 8,
                        18, 14,
                    ],
                    'circle-color': [
                        'match', ['get', 'property_type'],
                        'Магазин', '#16a34a',
                        'Офис', '#2563eb',
                        'Цех/Склад', '#d97706',
                        'Офис Сграда/Търговски център', '#7c3aed',
                        PURPLE,
                    ],
                    'circle-stroke-color': '#fff',
                    'circle-stroke-width': 1.5,
                    'circle-opacity': 0.85,
                },
            });

            // Hover halo
            map.addLayer({
                id: 'adres-locations-halo',
                type: 'circle',
                source: 'adres-locations',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        10, 8,
                        14, 16,
                        18, 22,
                    ],
                    'circle-color': PURPLE_TRANSLUCENT,
                    'circle-stroke-width': 0,
                    'circle-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0],
                },
            });

            // Click handler
            map.on('click', 'adres-locations-circle', (e) => {
                const feature = e.features?.[0];
                if (!feature) return;
                activePopup?.remove();
                activePopup = new maplibregl.Popup({ offset: 12, maxWidth: '340px' })
                    .setLngLat(e.lngLat)
                    .setHTML(buildPopupHTML(feature.properties))
                    .addTo(map);
            });

            map.on('mouseenter', 'adres-locations-circle', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'adres-locations-circle', () => {
                map.getCanvas().style.cursor = '';
            });
        } else {
            const source = map.getSource('adres-locations') as maplibregl.GeoJSONSource | undefined;
            if (source) source.setData(cachedGeoJSON);
        }
    }

    const toggleAdresLocations = async (map: MapLibreMap | null) => {
        if (!map) return;
        showAdresLocations.value = !showAdresLocations.value;
        try {
            await ensureLayers(map);
        } catch (e) {
            showAdresLocations.value = !showAdresLocations.value;
            console.error('[AdresLocations] Failed to load listings:', e);
            return;
        }
        const vis = showAdresLocations.value ? 'visible' : 'none';
        for (const layerId of ['adres-locations-circle', 'adres-locations-halo']) {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', vis);
            }
        }
    };

    const refresh = async (map: MapLibreMap | null) => {
        if (!map) return;
        cachedGeoJSON = null;
        listings.value = await AdresLocationsAPI.getListings();
        cachedGeoJSON = buildGeoJSON(listings.value);
        const source = map.getSource('adres-locations') as maplibregl.GeoJSONSource | undefined;
        if (source) source.setData(cachedGeoJSON);
    };

    return {
        showAdresLocations,
        listings,
        toggleAdresLocations,
        refresh,
    };
}
