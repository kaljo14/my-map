import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useSofiaPlanLayers } from '@/composables/useSofiaPlanLayers';
import { usePedestrianNetworkLayers } from '@/composables/usePedestrianNetworkLayers';
import { useTransportLayers } from '@/composables/useTransportLayers';
import { useParkingZones } from '@/composables/useParkingZones';
import { usePopulationLayers } from '@/composables/usePopulationLayers';
import { useAnalysisGrid } from '@/composables/useAnalysisGrid';
import { useOpportunityHeatmap } from '@/composables/useOpportunityHeatmap';
import type { HeatmapCategory } from '@/composables/useOpportunityHeatmap';
import { useMetroLines } from '@/composables/useMetroLines';
import { useMetroStops } from '@/composables/useMetroStops';
import { usePedestrianNetwork } from '@/composables/usePedestrianNetwork';
import { useOsmPois } from '@/composables/useOsmPois';

export const useLayerStore = defineStore('layers', () => {
    const mapInstance = shallowRef<MapLibreMap | null>(null);

    function setMap(map: MapLibreMap) {
        mapInstance.value = map;
    }

    // ── Layer composables ───────────────────────────────────────────
    const sofiaPlan = useSofiaPlanLayers();
    const pedestrianNetwork = usePedestrianNetworkLayers();
    const transport = useTransportLayers();
    const parking = useParkingZones();
    const population = usePopulationLayers();
    const analysisGrid = useAnalysisGrid();
    const opportunityHeatmap = useOpportunityHeatmap();
    const metro = useMetroLines();
    const metroStops = useMetroStops();
    const pedestrian = usePedestrianNetwork();
    const osmPois = useOsmPois();

    // ── Convenience toggles that auto-inject mapInstance ────────────

    // SofiaPlan
    const toggleZoning = () => sofiaPlan.toggleZoning(mapInstance.value);
    const toggleZoningCategory = (cat: string) => sofiaPlan.toggleZoningCategory(mapInstance.value, cat);
    const toggleIncome = () => sofiaPlan.toggleIncome(mapInstance.value);
    const togglePropertyPrices = () => sofiaPlan.togglePropertyPrices(mapInstance.value);
    const toggleMetroCatchments = () => sofiaPlan.toggleMetroCatchments(mapInstance.value);
    const togglePedestrianSyntax = () => sofiaPlan.togglePedestrianSyntax(mapInstance.value);
    const setPedestrianSyntaxThreshold = (v: number) => sofiaPlan.setPedestrianSyntaxThreshold(mapInstance.value, v);
    const selectPedestrianNeighborhood = (names: string[]) => sofiaPlan.selectPedestrianNeighborhood(mapInstance.value, names);
    const toggleSofiaPlanPopulation = () => sofiaPlan.toggleSofiaPlanPopulation(mapInstance.value);
    const toggleBusinessTurnover = () => sofiaPlan.toggleBusinessTurnover(mapInstance.value);
    const toggleDevelopmentPotential = () => sofiaPlan.toggleDevelopmentPotential(mapInstance.value);
    const toggleZoningParams = () => sofiaPlan.toggleZoningParams(mapInstance.value);
    const toggleNeighborhoods = () => sofiaPlan.toggleNeighborhoods(mapInstance.value);
    const toggleCensusAddresses = () => sofiaPlan.toggleCensusAddresses(mapInstance.value);
    const toggleDemographicForecast = () => sofiaPlan.toggleDemographicForecast(mapInstance.value);
    const toggleDemographicForecastGe = () => sofiaPlan.toggleDemographicForecastGe(mapInstance.value);
    const togglePopulationPotential = () => sofiaPlan.togglePopulationPotential(mapInstance.value);
    const toggleResidentialLoad = () => sofiaPlan.toggleResidentialLoad(mapInstance.value);
    const toggleHealthServiceConcentration = () => sofiaPlan.toggleHealthServiceConcentration(mapInstance.value);
    const toggleHealthInfrastructureConcentration = () => sofiaPlan.toggleHealthInfrastructureConcentration(mapInstance.value);
    const toggleBuildingDensityGe = () => sofiaPlan.toggleBuildingDensityGe(mapInstance.value);
    const toggleBuildingFootprintGe = () => sofiaPlan.toggleBuildingFootprintGe(mapInstance.value);
    const toggleResidentialTypologyGe = () => sofiaPlan.toggleResidentialTypologyGe(mapInstance.value);
    const toggleUrbanMorphologyGe = () => sofiaPlan.toggleUrbanMorphologyGe(mapInstance.value);
    const toggleAllSofiaPlan = () => sofiaPlan.toggleAllSofiaPlan(mapInstance.value);

    // Pedestrian Network
    const togglePedestrianCity = () => pedestrianNetwork.togglePedestrianCity(mapInstance.value);
    const togglePedestrianCityAlt = () => pedestrianNetwork.togglePedestrianCityAlt(mapInstance.value);
    const togglePedestrianMunicipality = () => pedestrianNetwork.togglePedestrianMunicipality(mapInstance.value);
    const togglePedestrianMunicipalityAlt = () => pedestrianNetwork.togglePedestrianMunicipalityAlt(mapInstance.value);
    const togglePedestrianSegmented = () => pedestrianNetwork.togglePedestrianSegmented(mapInstance.value);
    const togglePedestrianIntegration = () => pedestrianNetwork.togglePedestrianIntegration(mapInstance.value);
    const toggleAllPedestrianNetwork = () => pedestrianNetwork.toggleAllPedestrianNetwork(mapInstance.value);

    // Transport
    const toggleTransitAccessGe = () => transport.toggleTransitAccessGe(mapInstance.value);
    const toggleTransitAccessDistrict = () => transport.toggleTransitAccessDistrict(mapInstance.value);
    const toggleMetroAccess800m = () => transport.toggleMetroAccess800m(mapInstance.value);
    const toggleMetroAccess1200m = () => transport.toggleMetroAccess1200m(mapInstance.value);
    const toggleBusLines = () => transport.toggleBusLines(mapInstance.value);
    const toggleBusLinesAlt = () => transport.toggleBusLinesAlt(mapInstance.value);
    const toggleTrolleybusLines = () => transport.toggleTrolleybusLines(mapInstance.value);
    const toggleTramLines = () => transport.toggleTramLines(mapInstance.value);
    const toggleTramLinesAlt = () => transport.toggleTramLinesAlt(mapInstance.value);
    const toggleRailwayStations = () => transport.toggleRailwayStations(mapInstance.value);
    const toggleCyclingNetwork = () => transport.toggleCyclingNetwork(mapInstance.value);
    const toggleCyclingNetworkAlt = () => transport.toggleCyclingNetworkAlt(mapInstance.value);
    const toggleCyclingPlanned = () => transport.toggleCyclingPlanned(mapInstance.value);
    const toggleAllTransport = () => transport.toggleAllTransport(mapInstance.value);

    // Parking
    const toggleParkingZones = () => parking.toggleParkingZones(mapInstance.value);
    const toggleBlueZone = () => parking.toggleBlueZone(mapInstance.value);
    const toggleGreenZone = () => parking.toggleGreenZone(mapInstance.value);

    // Metro
    const toggleMetroVector = () => metro.toggleMetroVector(mapInstance.value);
    const toggleMetroLine = (line: string) => metro.toggleMetroLine(line, mapInstance.value);
    const toggleMetroStopsToggle = () => metroStops.toggleMetroStops(mapInstance.value);
    const toggleStopLine = (line: string) => metroStops.toggleStopLine(line, mapInstance.value);

    // Pedestrian (Walk Score)
    const togglePedestrianNet = () => pedestrian.togglePedestrianNetwork(mapInstance.value);

    // OSM POIs
    const toggleOsmPoisToggle = () => osmPois.toggleOsmPois(mapInstance.value);

    // Population Grid (mutual exclusion with analysis grid)
    const togglePopulationGrid = () => {
        if (analysisGrid.showAnalysisGrid.value) analysisGrid.toggleAnalysisGrid(mapInstance.value);
        population.togglePopulationGrid(mapInstance.value);
    };

    // Analysis Grid (mutual exclusion with population grid)
    const toggleAnalysisGridToggle = () => {
        if (population.showPopulationGrid.value) population.togglePopulationGrid(mapInstance.value);
        analysisGrid.toggleAnalysisGrid(mapInstance.value);
    };

    const updateThreshold = (v: number) => population.updateThreshold(v);

    // Opportunity Heatmap
    const toggleOpportunityHeatmapToggle = () => opportunityHeatmap.toggleOpportunityHeatmap(mapInstance.value);
    const setHeatmapCategory = (cat: string) => opportunityHeatmap.setHeatmapCategory(cat as HeatmapCategory, mapInstance.value);

    return {
        mapInstance,
        setMap,

        // Raw composable refs (for reading visibility state)
        sofiaPlan,
        pedestrianNetwork,
        transport,
        parking,
        population,
        analysisGrid,
        opportunityHeatmap,
        metro,
        metroStops,
        pedestrian,
        osmPois,

        // Convenience toggles (auto-inject mapInstance)
        toggleZoning, toggleZoningCategory,
        toggleIncome, togglePropertyPrices, toggleMetroCatchments,
        togglePedestrianSyntax, setPedestrianSyntaxThreshold, selectPedestrianNeighborhood,
        toggleSofiaPlanPopulation, toggleBusinessTurnover, toggleDevelopmentPotential,
        toggleZoningParams, toggleNeighborhoods, toggleCensusAddresses,
        toggleDemographicForecast, toggleDemographicForecastGe,
        togglePopulationPotential, toggleResidentialLoad,
        toggleHealthServiceConcentration, toggleHealthInfrastructureConcentration,
        toggleBuildingDensityGe, toggleBuildingFootprintGe,
        toggleResidentialTypologyGe, toggleUrbanMorphologyGe,
        toggleAllSofiaPlan,

        togglePedestrianCity, togglePedestrianCityAlt,
        togglePedestrianMunicipality, togglePedestrianMunicipalityAlt,
        togglePedestrianSegmented, togglePedestrianIntegration,
        toggleAllPedestrianNetwork,

        toggleTransitAccessGe, toggleTransitAccessDistrict,
        toggleMetroAccess800m, toggleMetroAccess1200m,
        toggleBusLines, toggleBusLinesAlt,
        toggleTrolleybusLines, toggleTramLines, toggleTramLinesAlt,
        toggleRailwayStations,
        toggleCyclingNetwork, toggleCyclingNetworkAlt, toggleCyclingPlanned,
        toggleAllTransport,

        toggleParkingZones, toggleBlueZone, toggleGreenZone,

        toggleMetroVector, toggleMetroLine,
        toggleMetroStops: toggleMetroStopsToggle,
        toggleStopLine,

        togglePedestrianNetwork: togglePedestrianNet,
        toggleOsmPois: toggleOsmPoisToggle,

        togglePopulationGrid, toggleAnalysisGrid: toggleAnalysisGridToggle,
        updateThreshold,

        toggleOpportunityHeatmap: toggleOpportunityHeatmapToggle,
        setHeatmapCategory,
    };
});
