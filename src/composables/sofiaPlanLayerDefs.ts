import type { ExpressionSpecification } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { gradientBar } from './mapLayerUtils';

export type ChoroplethLayerKey =
    | 'income' | 'propertyPrices' | 'metroCatchments' | 'sofiaPlanPopulation'
    | 'businessTurnover' | 'developmentPotential' | 'zoningParams'
    | 'demographicForecast' | 'demographicForecastGe' | 'populationPotential'
    | 'residentialLoad' | 'healthServiceConcentration' | 'healthInfrastructureConcentration'
    | 'buildingDensityGe' | 'buildingFootprintGe'
    | 'floodRiskLow' | 'floodRiskMedium' | 'floodRiskHigh';

export interface SofiaPlanChoroplethDef {
    key: ChoroplethLayerKey;
    sourceId: string;
    tileUrl: string;
    sourceLayer: string;
    fillLayerId: string;
    outlineLayerId: string;
    /** MapLibre paint expression for fill-color. */
    colorExpr: ExpressionSpecification;
    fillOpacity: number;
    /** Popup max-width override (default '240px'). */
    popupMaxWidth?: string;
    /** Optional custom outline paint overrides (defaults: white, 0.5 width, 0.4 opacity). */
    outlinePaint?: { color: string; width: number; opacity: number };
    popup: {
        icon: string;
        title: string;
        /** How to render the main score value. Return an HTML string. */
        scoreHtml: (score: number, label: string, props: Record<string, unknown>) => string;
    };
}

export const CHOROPLETH_LAYERS: SofiaPlanChoroplethDef[] = [
    // ── 1. INCOME ──────────────────────────────────────────────────────────
    {
        key: 'income',
        sourceId: 'sofiaplan-income',
        tileUrl: TilesAPI.getSofiaPlanIncomeTileUrlTemplate(),
        sourceLayer: 'sofiaplan_income_tiles',
        fillLayerId: 'sofiaplan-income-fill',
        outlineLayerId: 'sofiaplan-income-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 900],
            900, '#f7f4f9', 1125, '#c994c7', 1350, '#dd1c77', 1575, '#980043', 1800, '#67001f'],
        fillOpacity: 0.45,
        popup: {
            icon: 'payments',
            title: 'Income Level',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:28px;font-weight:700;color:#dd1c77">${score.toLocaleString()}<span style="font-size:14px;color:#64748b;font-weight:400"> BGN/month</span></div>
                ${gradientBar('linear-gradient(to right,#f7f4f9,#c994c7,#dd1c77,#67001f)', ['900', '1,350', '1,800'])}`,
        },
    },
    // ── 2. PROPERTY PRICES ─────────────────────────────────────────────────
    {
        key: 'propertyPrices',
        sourceId: 'sofiaplan-property-prices',
        tileUrl: TilesAPI.getSofiaPlanPropertyPricesTileUrlTemplate(),
        sourceLayer: 'sofiaplan_property_prices_tiles',
        fillLayerId: 'sofiaplan-property-prices-fill',
        outlineLayerId: 'sofiaplan-property-prices-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 100],
            100, '#ffffcc', 700, '#fed976', 1300, '#fd8d3c', 1900, '#f03b20', 2500, '#bd0026'],
        fillOpacity: 0.45,
        popup: {
            icon: 'real_estate_agent',
            title: 'Property Price',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:24px;font-weight:700;color:#fd8d3c">${score.toLocaleString()}<span style="font-size:13px;color:#64748b;font-weight:400"> BGN/m\u00B2</span></div>
                ${gradientBar('linear-gradient(to right,#ffffcc,#fed976,#fd8d3c,#bd0026)', ['100', '1,300', '2,500'])}`,
        },
    },
    // ── 3. METRO CATCHMENTS ────────────────────────────────────────────────
    {
        key: 'metroCatchments',
        sourceId: 'sofiaplan-metro-catchments',
        tileUrl: TilesAPI.getSofiaPlanMetroCatchmentsTileUrlTemplate(),
        sourceLayer: 'sofiaplan_metro_catchments_tiles',
        fillLayerId: 'sofiaplan-metro-catchments-fill',
        outlineLayerId: 'sofiaplan-metro-catchments-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 400],
            400, '#f7fbff', 800, '#9ecae1', 1200, '#3182bd', 1600, '#08519c', 2000, '#08306b'],
        fillOpacity: 0.45,
        popup: {
            icon: 'train',
            title: 'Metro Catchment',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:28px;font-weight:700;color:#3182bd">${score.toLocaleString()}<span style="font-size:14px;color:#64748b;font-weight:400"> m</span></div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px">Catchment radius</div>
                ${gradientBar('linear-gradient(to right,#f7fbff,#9ecae1,#3182bd,#08306b)', ['400 m', '1,200 m', '2,000 m'])}`,
        },
    },
    // ── 4. POPULATION GRID ─────────────────────────────────────────────────
    {
        key: 'sofiaPlanPopulation',
        sourceId: 'sofiaplan-population-grid',
        tileUrl: TilesAPI.getSofiaPlanPopulationGridTileUrlTemplate(),
        sourceLayer: 'sofiaplan_population_grid_tiles',
        fillLayerId: 'sofiaplan-population-grid-fill',
        outlineLayerId: 'sofiaplan-population-grid-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#3288bd', 6000, '#abdda4', 12000, '#fee08b', 18000, '#fdae61', 24000, '#f46d43'],
        fillOpacity: 0.45,
        popup: {
            icon: 'group',
            title: 'Population Grid (1\u00D71 km)',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:24px;font-weight:700;color:#f46d43">${score.toLocaleString()}<span style="font-size:13px;color:#64748b;font-weight:400"> residents</span></div>
                ${gradientBar('linear-gradient(to right,#3288bd,#abdda4,#fee08b,#f46d43)', ['0', '12,000', '24,000'])}`,
        },
    },
    // ── 5. BUSINESS TURNOVER ───────────────────────────────────────────────
    {
        key: 'businessTurnover',
        sourceId: 'sofiaplan-business-turnover',
        tileUrl: TilesAPI.getSofiaPlanBusinessTurnoverTileUrlTemplate(),
        sourceLayer: 'sofiaplan_business_turnover_tiles',
        fillLayerId: 'sofiaplan-business-turnover-fill',
        outlineLayerId: 'sofiaplan-business-turnover-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#e5f5e0', 3500, '#a1d99b', 7000, '#41ab5d', 10500, '#238b45', 14500, '#005a32'],
        fillOpacity: 0.45,
        popup: {
            icon: 'storefront',
            title: 'Business Activity',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:28px;font-weight:700;color:#41ab5d">${score.toLocaleString()}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px">Turnover index (2016)</div>
                ${gradientBar('linear-gradient(to right,#e5f5e0,#41ab5d,#005a32)', ['0', '7,000', '14,500'])}`,
        },
    },
    // ── 6. DEVELOPMENT POTENTIAL ───────────────────────────────────────────
    {
        key: 'developmentPotential',
        sourceId: 'sofiaplan-dev-potential',
        tileUrl: TilesAPI.getSofiaPlanDevelopmentPotentialTileUrlTemplate(),
        sourceLayer: 'sofiaplan_development_potential_tiles',
        fillLayerId: 'sofiaplan-dev-potential-fill',
        outlineLayerId: 'sofiaplan-dev-potential-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 1],
            1, '#313695', 1.5, '#74add1', 2, '#fee090', 2.5, '#f46d43', 3, '#a50026'],
        fillOpacity: 0.45,
        popup: {
            icon: 'construction',
            title: 'Development Potential',
            scoreHtml: (score, label) => {
                const potentialLabel = score >= 2.5 ? 'High Potential' : score >= 1.5 ? 'Moderate' : 'Low Potential';
                const color = score >= 2.5 ? '#a50026' : score >= 1.5 ? '#fee090' : '#74add1';
                return `
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:${color}">${score.toFixed(0)}<span style="font-size:14px;color:#64748b;font-weight:400"> / 3</span></div>
                    <div style="font-size:12px;color:${color};font-weight:600;margin-top:4px">${potentialLabel}</div>
                    ${gradientBar('linear-gradient(to right,#313695,#74add1,#fee090,#a50026)', ['1', '2', '3'])}`;
            },
        },
    },
    // ── 7. ZONING PARAMETERS ───────────────────────────────────────────────
    {
        key: 'zoningParams',
        sourceId: 'sofiaplan-zoning-params',
        tileUrl: TilesAPI.getSofiaPlanZoningParamsTileUrlTemplate(),
        sourceLayer: 'sofiaplan_zoning_params',
        fillLayerId: 'sofiaplan-zoning-params-fill',
        outlineLayerId: 'sofiaplan-zoning-params-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'far'], 0],
            0, '#f0f0f0', 1, '#bdbdbd', 2, '#969696', 3.5, '#525252', 5, '#252525'],
        fillOpacity: 0.5,
        popup: {
            icon: 'rule',
            title: 'Zoning Parameters',
            scoreHtml: (_score, _label, props) => {
                const far = Number(props.far ?? 0).toFixed(1);
                const maxHeight = props.max_height ? `${props.max_height} m` : '\u2014';
                return `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div style="background:#f8fafc;padding:8px;border-radius:6px">
                            <div style="font-size:11px;color:#64748b;margin-bottom:3px">Floor Area Ratio</div>
                            <div style="font-size:20px;font-weight:700;color:#525252">FAR ${far}</div>
                        </div>
                        <div style="background:#f8fafc;padding:8px;border-radius:6px">
                            <div style="font-size:11px;color:#64748b;margin-bottom:3px">Max Height</div>
                            <div style="font-size:20px;font-weight:700;color:#525252">${maxHeight}</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#f0f0f0,#969696,#252525)', ['FAR 0', 'FAR 2.5', 'FAR 5+'])}`;
            },
        },
    },
    // ── 8. DEMOGRAPHIC FORECAST ────────────────────────────────────────────
    {
        key: 'demographicForecast',
        sourceId: 'sofiaplan-demo-forecast',
        tileUrl: TilesAPI.getSofiaPlanDemographicForecastTileUrlTemplate(),
        sourceLayer: 'sofiaplan_demographic_forecast_tiles',
        fillLayerId: 'sofiaplan-demo-forecast-fill',
        outlineLayerId: 'sofiaplan-demo-forecast-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#f7fcf5', 5000, '#a1d99b', 15000, '#41ab5d', 30000, '#006d2c', 50000, '#00441b'],
        fillOpacity: 0.45,
        popupMaxWidth: '280px',
        popup: {
            icon: 'trending_up',
            title: 'Demographic Forecast',
            scoreHtml: (score, label, props) => {
                const f2030 = props.forecast_2030 != null ? Number(props.forecast_2030).toLocaleString() : '\u2014';
                const f2040 = props.forecast_2040 != null ? Number(props.forecast_2040).toLocaleString() : '\u2014';
                const f2050 = props.forecast_2050 != null ? Number(props.forecast_2050).toLocaleString() : '\u2014';
                return `
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#41ab5d">${score.toLocaleString()}<span style="font-size:13px;color:#64748b;font-weight:400"> pop (2017)</span></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2030</div>
                            <div style="font-size:14px;font-weight:600;color:#006d2c">${f2030}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2040</div>
                            <div style="font-size:14px;font-weight:600;color:#006d2c">${f2040}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2050</div>
                            <div style="font-size:14px;font-weight:600;color:#006d2c">${f2050}</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#f7fcf5,#a1d99b,#41ab5d,#00441b)', ['0', '25,000', '50,000'])}`;
            },
        },
    },
    // ── 9. DEMOGRAPHIC FORECAST GE ─────────────────────────────────────────
    {
        key: 'demographicForecastGe',
        sourceId: 'sofiaplan-demo-forecast-ge',
        tileUrl: TilesAPI.getSofiaPlanDemographicForecastGeTileUrlTemplate(),
        sourceLayer: 'sofiaplan_demographic_forecast_ge_tiles',
        fillLayerId: 'sofiaplan-demo-forecast-ge-fill',
        outlineLayerId: 'sofiaplan-demo-forecast-ge-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#fff7ec', 5000, '#fdbb84', 15000, '#fc8d59', 30000, '#d7301f', 50000, '#7f0000'],
        fillOpacity: 0.45,
        popupMaxWidth: '280px',
        popup: {
            icon: 'area_chart',
            title: 'Forecast (Planning Unit)',
            scoreHtml: (score, label, props) => {
                const f2030 = props.forecast_2030 != null ? Number(props.forecast_2030).toLocaleString() : '\u2014';
                const f2040 = props.forecast_2040 != null ? Number(props.forecast_2040).toLocaleString() : '\u2014';
                const f2050 = props.forecast_2050 != null ? Number(props.forecast_2050).toLocaleString() : '\u2014';
                return `
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#d7301f">${score.toLocaleString()}<span style="font-size:13px;color:#64748b;font-weight:400"> pop (current)</span></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2030</div>
                            <div style="font-size:14px;font-weight:600;color:#7f0000">${f2030}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2040</div>
                            <div style="font-size:14px;font-weight:600;color:#7f0000">${f2040}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2050</div>
                            <div style="font-size:14px;font-weight:600;color:#7f0000">${f2050}</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#fff7ec,#fc8d59,#7f0000)', ['0', '25,000', '50,000'])}`;
            },
        },
    },
    // ── 10. POPULATION POTENTIAL ───────────────────────────────────────────
    {
        key: 'populationPotential',
        sourceId: 'sofiaplan-pop-potential',
        tileUrl: TilesAPI.getSofiaPlanPopulationPotentialTileUrlTemplate(),
        sourceLayer: 'sofiaplan_population_potential_tiles',
        fillLayerId: 'sofiaplan-pop-potential-fill',
        outlineLayerId: 'sofiaplan-pop-potential-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#f7fcf0', 10000, '#addd8e', 25000, '#41ab5d', 50000, '#006837', 80000, '#004529'],
        fillOpacity: 0.45,
        popup: {
            icon: 'groups',
            title: 'Population Potential',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:28px;font-weight:700;color:#41ab5d">${score.toLocaleString()}<span style="font-size:14px;color:#64748b;font-weight:400"> potential residents</span></div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px">At 30 m\u00B2/person</div>
                ${gradientBar('linear-gradient(to right,#f7fcf0,#addd8e,#41ab5d,#004529)', ['0', '40,000', '80,000'])}`,
        },
    },
    // ── 11. RESIDENTIAL LOAD ──────────────────────────────────────────────
    {
        key: 'residentialLoad',
        sourceId: 'sofiaplan-residential-load',
        tileUrl: TilesAPI.getSofiaPlanResidentialLoadTileUrlTemplate(),
        sourceLayer: 'sofiaplan_residential_load_tiles',
        fillLayerId: 'sofiaplan-residential-load-fill',
        outlineLayerId: 'sofiaplan-residential-load-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#eff3ff', 25, '#9ecae1', 50, '#4292c6', 75, '#2171b5', 100, '#084594'],
        fillOpacity: 0.45,
        popup: {
            icon: 'apartment',
            title: 'Residential Load',
            scoreHtml: (score, label) => `
                ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                <div style="font-size:28px;font-weight:700;color:#2171b5">${score.toLocaleString()}<span style="font-size:14px;color:#64748b;font-weight:400"> density index</span></div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px">Current residential load</div>
                ${gradientBar('linear-gradient(to right,#eff3ff,#4292c6,#084594)', ['Low', 'Medium', 'High'])}`,
        },
    },
    // ── 12. HEALTH SERVICE CONCENTRATION ───────────────────────────────────
    {
        key: 'healthServiceConcentration',
        sourceId: 'sofiaplan-health-service-concentration',
        tileUrl: TilesAPI.getSofiaPlanHealthServiceConcentrationTileUrlTemplate(),
        sourceLayer: 'sofiaplan_health_service_concentration_tiles',
        fillLayerId: 'sofiaplan-health-service-concentration-fill',
        outlineLayerId: 'sofiaplan-health-service-concentration-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#ffffe5', 5, '#f7fcb9', 12, '#addd8e', 25, '#41ab5d', 50, '#006837'],
        fillOpacity: 0.6,
        popupMaxWidth: '260px',
        popup: {
            icon: 'medical_services',
            title: 'Health Service Concentration',
            scoreHtml: (score, _label, props) => {
                const label = String(props.label || '');
                const district = String(props.district || '');
                const rating = score === 0  ? { text: 'No services', color: '#94a3b8' }
                    : score <= 10  ? { text: 'Low', color: '#addd8e' }
                    : score <= 20  ? { text: 'Medium', color: '#41ab5d' }
                    : score <= 35  ? { text: 'Good', color: '#238b45' }
                    :                { text: 'High', color: '#006837' };
                return `
                    ${label ? `<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#64748b;margin-bottom:10px">${district} district</div>` : ''}
                    <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px">
                        <span style="font-size:32px;font-weight:700;color:${rating.color}">${score}</span>
                        <span style="font-size:13px;color:#64748b">health service facilities</span>
                    </div>
                    <div style="display:inline-block;padding:3px 10px;border-radius:12px;background:${rating.color}22;border:1px solid ${rating.color}66;color:${rating.color};font-size:12px;font-weight:600;margin-bottom:10px">${rating.text} coverage</div>
                    <div style="font-size:11px;color:#475569;line-height:1.6;margin-bottom:4px">
                        <b>What is counted:</b> pharmacies, opticians, and medical laboratories within the planning unit (GE).
                    </div>
                    <div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-bottom:8px">
                        Source: \u041E\u041F \u201E\u0421\u043E\u0444\u0438\u044F\u043F\u043B\u0430\u043D\u201C \u2014 Programme for Sofia 2020\u20132027, analysis I.7.1. Points georeferenced from official national registers (\u041D\u0421\u0418, \u041D\u0417\u041E\u041A).
                    </div>
                    ${gradientBar('linear-gradient(to right,#ffffe5,#addd8e,#41ab5d,#006837)', ['0', '12', '50'])}`;
            },
        },
    },
    // ── 13. HEALTH INFRASTRUCTURE CONCENTRATION ────────────────────────────
    {
        key: 'healthInfrastructureConcentration',
        sourceId: 'sofiaplan-health-infrastructure-concentration',
        tileUrl: TilesAPI.getSofiaPlanHealthInfrastructureConcentrationTileUrlTemplate(),
        sourceLayer: 'sofiaplan_health_infrastructure_concentration_tiles',
        fillLayerId: 'sofiaplan-health-infrastructure-concentration-fill',
        outlineLayerId: 'sofiaplan-health-infrastructure-concentration-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0, '#ffffcc', 25, '#fed976', 50, '#fd8d3c', 100, '#f03b20', 192, '#bd0026'],
        fillOpacity: 0.6,
        popupMaxWidth: '260px',
        popup: {
            icon: 'local_hospital',
            title: 'Health Infrastructure Concentration',
            scoreHtml: (score, _label, props) => {
                const label = String(props.label || '');
                const district = String(props.district || '');
                const rating = score === 0  ? { text: 'No infrastructure', color: '#94a3b8' }
                    : score <= 10  ? { text: 'Very low', color: '#fed976' }
                    : score <= 30  ? { text: 'Low', color: '#fd8d3c' }
                    : score <= 80  ? { text: 'Medium', color: '#f03b20' }
                    :                { text: 'High', color: '#bd0026' };
                return `
                    ${label ? `<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#64748b;margin-bottom:10px">${district} district</div>` : ''}
                    <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px">
                        <span style="font-size:32px;font-weight:700;color:${rating.color}">${score}</span>
                        <span style="font-size:13px;color:#64748b">health infrastructure points</span>
                    </div>
                    <div style="display:inline-block;padding:3px 10px;border-radius:12px;background:${rating.color}22;border:1px solid ${rating.color}66;color:${rating.color};font-size:12px;font-weight:600;margin-bottom:10px">${rating.text} density</div>
                    <div style="font-size:11px;color:#475569;line-height:1.6;margin-bottom:4px">
                        <b>What is counted:</b> licensed medical treatment facilities \u2014 hospitals, diagnostic-consultative centres (\u0414\u041A\u0426), GP and specialist doctor practices, dental practices, and emergency services within the planning unit (GE).
                    </div>
                    <div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-bottom:8px">
                        The highest value in Sofia (192) is the Medical Academy complex in \u0422\u0440\u0438\u0430\u0434\u0438\u0446\u0430, which concentrates 8 specialised hospitals on one campus. Areas with 0 points have no registered medical treatment facilities. Source: \u041E\u041F \u201E\u0421\u043E\u0444\u0438\u044F\u043F\u043B\u0430\u043D\u201C \u2014 Programme for Sofia 2020\u20132027, analysis I.7.1 (data as of 2021).
                    </div>
                    ${gradientBar('linear-gradient(to right,#ffffcc,#fed976,#fd8d3c,#f03b20,#bd0026)', ['0', '50', '100', '192'])}`;
            },
        },
    },
    // ── 14. BUILDING DENSITY BY GE ─────────────────────────────────────────
    {
        key: 'buildingDensityGe',
        sourceId: 'sofiaplan-building-density-ge',
        tileUrl: TilesAPI.getSofiaPlanBuildingDensityGeTileUrlTemplate(),
        sourceLayer: 'sofiaplan_building_density_ge_tiles',
        fillLayerId: 'sofiaplan-building-density-ge-fill',
        outlineLayerId: 'sofiaplan-building-density-ge-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0.0,  '#ffffcc',
            0.15, '#ffeda0',
            0.3,  '#fed976',
            0.45, '#feb24c',
            0.6,  '#fd8d3c',
            0.75, '#fc4e2a',
            0.9,  '#e31a1c',
            1.0,  '#800026'],
        fillOpacity: 0.82,
        outlinePaint: { color: '#7f0000', width: 0.7, opacity: 0.55 },
        popupMaxWidth: '280px',
        popup: {
            icon: '',
            title: '',
            scoreHtml: (_score, _label, props) => {
                const label = String(props.label || '');
                const district = String(props.district || '');
                const density = props.score != null ? Math.round(Number(props.score) * 100) : null;
                const intensity = props.intensity != null ? Number(props.intensity).toFixed(2) : '\u2014';
                const enclosure = props.enclosure_ratio != null ? Number(props.enclosure_ratio).toFixed(2) : '\u2014';
                const avgFloors = props.avg_floors != null ? Number(props.avg_floors).toFixed(1) : '\u2014';
                return `
                    <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        \uD83C\uDFD7\uFE0F \u0417\u0430\u0441\u0442\u0440\u043E\u044F\u0432\u0430\u043D\u0435 \u043F\u043E \u0413\u0415
                    </h3>
                    ${label ? `<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#64748b;margin-bottom:10px">${district}</div>` : ''}
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u041F\u043B\u044A\u0442\u043D\u043E\u0441\u0442</div>
                            <div style="font-size:18px;font-weight:700;color:#d7301f">${density != null ? density + '%' : '\u2014'}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u0418\u043D\u0442\u0435\u043D\u0437\u0438\u0432\u043D\u043E\u0441\u0442</div>
                            <div style="font-size:18px;font-weight:700;color:#ef6548">${intensity}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u0417\u0430\u0442\u0432\u043E\u0440\u0435\u043D\u043E\u0441\u0442</div>
                            <div style="font-size:18px;font-weight:700;color:#fc8d59">${enclosure}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u0421\u0440. \u0435\u0442\u0430\u0436\u043D\u043E\u0441\u0442</div>
                            <div style="font-size:18px;font-weight:700;color:#fdbb84">${avgFloors} <span style="font-size:11px;font-weight:400;color:#64748b">\u0435\u0442.</span></div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#ffffcc,#fed976,#fd8d3c,#e31a1c,#800026)', ['0%', '25%', '50%', '75%', '100%'])}`;
            },
        },
    },
    // ── 15. FLOOD RISK — LOW PROBABILITY ──────────────────────────────────
    {
        key: 'floodRiskLow',
        sourceId: 'sofiaplan-flood-risk-low',
        tileUrl: TilesAPI.getSofiaPlanFloodRiskLowTileUrlTemplate(),
        sourceLayer: 'sofiaplan_flood_risk_low_tiles',
        fillLayerId: 'sofiaplan-flood-risk-low-fill',
        outlineLayerId: 'sofiaplan-flood-risk-low-outline',
        colorExpr: ['match', ['to-number', ['get', 'risk_level'], 1], 1, '#93c4e8', '#93c4e8'],
        fillOpacity: 0.55,
        outlinePaint: { color: '#2e75b6', width: 1.2, opacity: 0.7 },
        popupMaxWidth: '260px',
        popup: {
            icon: '',
            title: '',
            scoreHtml: (_score, label, _props) => `
                <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                    \uD83D\uDCA7 Flood Risk Zone
                </h3>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:16px;background:#dbeafe;border:1px solid #93c4e8;color:#1d4ed8;font-size:13px;font-weight:600;margin-bottom:10px">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#93c4e8;border:2px solid #2e75b6"></span>
                    Low Probability
                </div>
                ${label ? `<div style="font-size:12px;color:#64748b;margin-top:4px">Zone: <span style="font-weight:600;color:#1e293b">${label}</span></div>` : ''}
                <div style="margin-top:10px;padding:8px 10px;background:#f0f9ff;border-radius:8px;border-left:3px solid #93c4e8">
                    <div style="font-size:11px;color:#475569;line-height:1.5">Area with low flood probability — risk exists but less frequent flood events expected.</div>
                </div>`,
        },
    },
    // ── 16. FLOOD RISK — MEDIUM PROBABILITY ───────────────────────────────
    {
        key: 'floodRiskMedium',
        sourceId: 'sofiaplan-flood-risk-medium',
        tileUrl: TilesAPI.getSofiaPlanFloodRiskMediumTileUrlTemplate(),
        sourceLayer: 'sofiaplan_flood_risk_medium_tiles',
        fillLayerId: 'sofiaplan-flood-risk-medium-fill',
        outlineLayerId: 'sofiaplan-flood-risk-medium-outline',
        colorExpr: ['match', ['to-number', ['get', 'risk_level'], 2], 2, '#2e75b6', '#2e75b6'],
        fillOpacity: 0.60,
        outlinePaint: { color: '#1f4e79', width: 1.2, opacity: 0.75 },
        popupMaxWidth: '260px',
        popup: {
            icon: '',
            title: '',
            scoreHtml: (_score, label, _props) => `
                <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                    \uD83C\uDF0A Flood Risk Zone
                </h3>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:16px;background:#bfdbfe;border:1px solid #2e75b6;color:#1e40af;font-size:13px;font-weight:600;margin-bottom:10px">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#2e75b6;border:2px solid #1f4e79"></span>
                    Medium Probability
                </div>
                ${label ? `<div style="font-size:12px;color:#64748b;margin-top:4px">Zone: <span style="font-weight:600;color:#1e293b">${label}</span></div>` : ''}
                <div style="margin-top:10px;padding:8px 10px;background:#eff6ff;border-radius:8px;border-left:3px solid #2e75b6">
                    <div style="font-size:11px;color:#475569;line-height:1.5">Area with medium flood probability — significant flood events expected at moderate recurrence intervals.</div>
                </div>`,
        },
    },
    // ── 17. FLOOD RISK — HIGH PROBABILITY ─────────────────────────────────
    {
        key: 'floodRiskHigh',
        sourceId: 'sofiaplan-flood-risk-high',
        tileUrl: TilesAPI.getSofiaPlanFloodRiskHighTileUrlTemplate(),
        sourceLayer: 'sofiaplan_flood_risk_high_tiles',
        fillLayerId: 'sofiaplan-flood-risk-high-fill',
        outlineLayerId: 'sofiaplan-flood-risk-high-outline',
        colorExpr: ['match', ['to-number', ['get', 'risk_level'], 3], 3, '#1f3864', '#1f3864'],
        fillOpacity: 0.70,
        outlinePaint: { color: '#0d1b3e', width: 1.5, opacity: 0.85 },
        popupMaxWidth: '260px',
        popup: {
            icon: '',
            title: '',
            scoreHtml: (_score, label, _props) => `
                <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                    \u26A0\uFE0F Flood Risk Zone
                </h3>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:16px;background:#1f3864;border:1px solid #0d1b3e;color:#dbeafe;font-size:13px;font-weight:600;margin-bottom:10px">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#dbeafe;border:2px solid #93c4e8"></span>
                    High Probability
                </div>
                ${label ? `<div style="font-size:12px;color:#64748b;margin-top:4px">Zone: <span style="font-weight:600;color:#1e293b">${label}</span></div>` : ''}
                <div style="margin-top:10px;padding:8px 10px;background:#fff1f2;border-radius:8px;border-left:3px solid #e11d48">
                    <div style="font-size:11px;color:#9f1239;font-weight:500;line-height:1.5">\u26A0\uFE0F High-frequency flood area. Frequent flood events expected. Exercise caution for planning decisions.</div>
                </div>`,
        },
    },
    // ── 18. BUILDING FOOTPRINT BY GE ───────────────────────────────────────
    {
        key: 'buildingFootprintGe',
        sourceId: 'sofiaplan-building-footprint-ge',
        tileUrl: TilesAPI.getSofiaPlanBuildingFootprintGeTileUrlTemplate(),
        sourceLayer: 'sofiaplan_building_footprint_ge_tiles',
        fillLayerId: 'sofiaplan-building-footprint-ge-fill',
        outlineLayerId: 'sofiaplan-building-footprint-ge-outline',
        colorExpr: ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
            0,      '#fff7bc',
            8000,   '#9dd56a',
            25000,  '#31b8a3',
            55000,  '#2166ac',
            100000, '#5e2a84'],
        fillOpacity: 0.82,
        outlinePaint: { color: '#1a1a3e', width: 0.7, opacity: 0.45 },
        popupMaxWidth: '280px',
        popup: {
            icon: '',
            title: '',
            scoreHtml: (_score, _label, props) => {
                const label = String(props.label || '');
                const district = String(props.district || '');
                const rzp = props.rzp != null ? Number(props.rzp).toLocaleString() : '\u2014';
                const zp = props.zp != null ? Number(props.zp).toLocaleString() : '\u2014';
                const buildingCount = props.avg_floors != null && Number(props.avg_floors) > 0 ? Math.round(Number(props.avg_floors)).toLocaleString() : '\u2014';
                return `
                    <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        \uD83C\uDFE2 \u0417\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u043F\u043B\u043E\u0449 \u043F\u043E \u0413\u0415
                    </h3>
                    ${label ? `<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#64748b;margin-bottom:10px">${district}</div>` : ''}
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u0420\u0417\u041F</div>
                            <div style="font-size:15px;font-weight:700;color:#2171b5">${rzp}</div>
                            <div style="font-size:10px;color:#94a3b8">\u043C\u00B2</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u0417\u041F</div>
                            <div style="font-size:15px;font-weight:700;color:#4292c6">${zp}</div>
                            <div style="font-size:10px;color:#94a3b8">\u043C\u00B2</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px">
                            <div style="font-size:10px;color:#64748b;margin-bottom:2px">\u0421\u0433\u0440\u0430\u0434\u0438</div>
                            <div style="font-size:15px;font-weight:700;color:#5e2a84">${buildingCount}</div>
                            <div style="font-size:10px;color:#94a3b8">\u0431\u0440.</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#fff7bc,#9dd56a,#31b8a3,#2166ac,#5e2a84)', ['0', '25\u043A', '55\u043A', '100\u043A \u043C\u00B2'])}`;
            },
        },
    },
];
