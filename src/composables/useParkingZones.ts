import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

// sofiaplan_parking_green = city-centre BLUE zone (синя зона)
// sofiaplan_parking_blue  = outer GREEN zone (зелена зона)

export function useParkingZones() {
    const showParkingZones = ref(false);
    const showBlueZone     = ref(true);
    const showGreenZone    = ref(true);
    let activePopup: maplibregl.Popup | null = null;

    function ensureLayers(map: MapLibreMap) {
        // ── Green zone (outer) — added first so blue renders on top ──────────
        if (!map.getSource('parking-green')) {
            map.addSource('parking-green', {
                type: 'vector',
                tiles: [TilesAPI.getParkingGreenTileUrl()],
                maxzoom: 22,
            });
            map.addLayer({
                id: 'parking-green-fill',
                type: 'fill',
                source: 'parking-green',
                'source-layer': 'sofiaplan_parking_blue',
                layout: { visibility: 'none' },
                paint: { 'fill-color': 'rgba(0,180,0,0.2)' },
            });
            map.addLayer({
                id: 'parking-green-outline',
                type: 'line',
                source: 'parking-green',
                'source-layer': 'sofiaplan_parking_blue',
                layout: { visibility: 'none' },
                paint: { 'line-color': '#00b400', 'line-width': 1.5 },
            });
        }

        // ── Blue zone (city centre) — added second so it renders on top ──────
        if (!map.getSource('parking-blue')) {
            map.addSource('parking-blue', {
                type: 'vector',
                tiles: [TilesAPI.getParkingBlueTileUrl()],
                maxzoom: 22,
            });
            map.addLayer({
                id: 'parking-blue-fill',
                type: 'fill',
                source: 'parking-blue',
                'source-layer': 'sofiaplan_parking_green',
                layout: { visibility: 'none' },
                paint: { 'fill-color': 'rgba(0,100,255,0.5)' },
            });
            map.addLayer({
                id: 'parking-blue-outline',
                type: 'line',
                source: 'parking-blue',
                'source-layer': 'sofiaplan_parking_green',
                layout: { visibility: 'none' },
                paint: { 'line-color': '#0064ff', 'line-width': 1.5 },
            });

            map.on('click', 'parking-blue-fill', (e) => showPopup(map, e, 'Blue Zone', '#0064ff'));
            map.on('click', 'parking-green-fill', (e) => showPopup(map, e, 'Green Zone', '#00b400'));
            map.on('mouseenter', 'parking-blue-fill',  () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'parking-blue-fill',  () => { map.getCanvas().style.cursor = ''; });
            map.on('mouseenter', 'parking-green-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'parking-green-fill', () => { map.getCanvas().style.cursor = ''; });
        }
    }

    function showPopup(map: MapLibreMap, e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }, name: string, dotColor: string) {
        activePopup?.remove();
        activePopup = new maplibregl.Popup({ maxWidth: '220px' })
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="font-family:system-ui,sans-serif;min-width:160px;color:#0f172a">
                    <h3 style="margin:0 0 8px 0;border-bottom:1px solid #e2e8f0;padding-bottom:6px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">local_parking</span>
                        Parking Zone
                    </h3>
                    <div style="display:flex;align-items:center;gap:6px">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${dotColor}"></span>
                        <span style="font-size:14px;font-weight:600;color:#1e293b">${name}</span>
                    </div>
                </div>
            `)
            .addTo(map);
    }

    function setVisibility(map: MapLibreMap, visible: boolean) {
        const blue  = visible && showBlueZone.value  ? 'visible' : 'none';
        const green = visible && showGreenZone.value ? 'visible' : 'none';
        if (map.getLayer('parking-blue-fill'))    map.setLayoutProperty('parking-blue-fill',    'visibility', blue);
        if (map.getLayer('parking-blue-outline'))  map.setLayoutProperty('parking-blue-outline',  'visibility', blue);
        if (map.getLayer('parking-green-fill'))   map.setLayoutProperty('parking-green-fill',   'visibility', green);
        if (map.getLayer('parking-green-outline')) map.setLayoutProperty('parking-green-outline', 'visibility', green);
    }

    const toggleParkingZones = (map: MapLibreMap | null) => {
        if (!map) return;
        showParkingZones.value = !showParkingZones.value;
        ensureLayers(map);
        setVisibility(map, showParkingZones.value);
    };

    const toggleBlueZone = (map: MapLibreMap | null) => {
        if (!map || !showParkingZones.value) return;
        showBlueZone.value = !showBlueZone.value;
        setVisibility(map, true);
    };

    const toggleGreenZone = (map: MapLibreMap | null) => {
        if (!map || !showParkingZones.value) return;
        showGreenZone.value = !showGreenZone.value;
        setVisibility(map, true);
    };

    return {
        showParkingZones,
        showBlueZone,
        showGreenZone,
        toggleParkingZones,
        toggleBlueZone,
        toggleGreenZone,
    };
}
