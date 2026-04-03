import TilesAPI from '@/api/tiles';

// ── Choropleth layer definition ──────────────────────────────────────────────

export interface TransportChoroLayerDef {
    kind: 'choro';
    key: string;
    sourceId: string;
    tileUrl: string;
    sourceLayer: string;
    fillLayerId: string;
    outlineLayerId: string;
    colorStops: number[];
    colors: string[];
    fillOpacity?: number;
    popup: {
        title: string;
        icon: string;
        unitLabel: string;
        gradientCss: string;
        gradientLabels: [string, string, string];
    };
}

// ── Line layer definition ────────────────────────────────────────────────────

export interface TransportLineLayerDef {
    kind: 'line';
    key: string;
    sourceId: string;
    tileUrl: string;
    sourceLayer: string;
    layerId: string;
    lineColor: string;
    lineWidth: number;
    popup: {
        title: string;
        icon: string;
    };
}

export type TransportLayerDef = TransportChoroLayerDef | TransportLineLayerDef;

// ── Data-driven choropleth layers ────────────────────────────────────────────

export const CHORO_LAYERS: TransportChoroLayerDef[] = [
    {
        kind: 'choro',
        key: 'transitAccessDistrict',
        sourceId: 'transport-transit-access-district',
        tileUrl: TilesAPI.getSofiaPlanTransitAccessDistrictTileUrlTemplate(),
        sourceLayer: 'sofiaplan_transit_access_district_tiles',
        fillLayerId: 'transport-transit-access-district-fill',
        outlineLayerId: 'transport-transit-access-district-outline',
        colorStops: [0, 500, 1000, 1500, 2000],
        colors: ['#f7fcf5', '#74c476', '#238b45', '#006d2c', '#00441b'],
        popup: {
            title: 'PT Access (by District)',
            icon: 'directions_transit',
            unitLabel: 'm',
            gradientCss: 'linear-gradient(to right,#f7fcf5,#74c476,#238b45,#00441b)',
            gradientLabels: ['0 m', '1000 m', '2000 m'],
        },
    },
];

// ── Data-driven line layers ──────────────────────────────────────────────────

export const LINE_LAYERS: TransportLineLayerDef[] = [
    {
        kind: 'line',
        key: 'busLines',
        sourceId: 'transport-bus-lines',
        tileUrl: TilesAPI.getSofiaPlanBusLinesTileUrlTemplate(),
        sourceLayer: 'sofiaplan_bus_lines_tiles',
        layerId: 'transport-bus-lines-line',
        lineColor: '#1565C0',
        lineWidth: 2,
        popup: { title: 'Bus Lines', icon: 'directions_bus' },
    },
    {
        kind: 'line',
        key: 'busLinesAlt',
        sourceId: 'transport-bus-lines-alt',
        tileUrl: TilesAPI.getSofiaPlanBusLinesAltTileUrlTemplate(),
        sourceLayer: 'sofiaplan_bus_lines_alt_tiles',
        layerId: 'transport-bus-lines-alt-line',
        lineColor: '#42A5F5',
        lineWidth: 2,
        popup: { title: 'Bus Lines (alt)', icon: 'directions_bus' },
    },
    {
        kind: 'line',
        key: 'trolleybusLines',
        sourceId: 'transport-trolleybus-lines',
        tileUrl: TilesAPI.getSofiaPlanTrolleybusLinesTileUrlTemplate(),
        sourceLayer: 'sofiaplan_trolleybus_lines_tiles',
        layerId: 'transport-trolleybus-lines-line',
        lineColor: '#00695C',
        lineWidth: 2,
        popup: { title: 'Trolleybus Lines', icon: 'electric_bolt' },
    },
    {
        kind: 'line',
        key: 'tramLines',
        sourceId: 'transport-tram-lines',
        tileUrl: TilesAPI.getSofiaPlanTramLinesTileUrlTemplate(),
        sourceLayer: 'sofiaplan_tram_lines_tiles',
        layerId: 'transport-tram-lines-line',
        lineColor: '#C62828',
        lineWidth: 2.5,
        popup: { title: 'Tram Lines', icon: 'tram' },
    },
    {
        kind: 'line',
        key: 'tramLinesAlt',
        sourceId: 'transport-tram-lines-alt',
        tileUrl: TilesAPI.getSofiaPlanTramLinesAltTileUrlTemplate(),
        sourceLayer: 'sofiaplan_tram_lines_alt_tiles',
        layerId: 'transport-tram-lines-alt-line',
        lineColor: '#EF5350',
        lineWidth: 2,
        popup: { title: 'Tram Lines (alt)', icon: 'tram' },
    },
];
