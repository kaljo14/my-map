import { ref, computed } from 'vue';

export interface ComparisonPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  index: number;
}

export interface PinMetrics {
  footTraffic: number;
  lowCompetition: number;
  transitAccess: number;
  demographicsFit: number;
  rentValue: number;
}

// Deterministic dummy metrics based on lat/lng
function generateMetrics(lat: number, lng: number): PinMetrics {
  const seed = (lat * 1000 + lng * 1000) % 100;
  const r = (base: number, offset: number) => Math.min(99, Math.max(10, Math.round((seed + base + offset) % 90) + 10));
  return {
    footTraffic:     r(13, 1),
    lowCompetition:  r(47, 2),
    transitAccess:   r(31, 3),
    demographicsFit: r(22, 4),
    rentValue:       r(58, 5),
  };
}

function computeScore(m: PinMetrics): number {
  return Math.round((m.footTraffic + m.lowCompetition + m.transitAccess + m.demographicsFit + m.rentValue) / 5);
}

const pins = ref<ComparisonPin[]>([]);
const isPinMode = ref(false);
const isComparisonOpen = ref(false);

let pinCounter = 0;

const pinCount = computed(() => pins.value.length);

function getNeighborhoodName(lat: number, lng: number): string {
  // Rough Sofia neighborhood mapping based on coordinates
  if (lat > 42.72) return 'Lozenets';
  if (lat > 42.71 && lng < 23.31) return 'Ilinden';
  if (lat > 42.71 && lng > 23.33) return 'Izgrev';
  if (lat > 42.70 && lng < 23.32) return 'Center';
  if (lat > 42.70 && lng > 23.34) return 'Mladost';
  if (lng < 23.29) return 'Nadezhda';
  return 'Sofia';
}

function addPin(lat: number, lng: number): ComparisonPin {
  pinCounter++;
  const neighborhood = getNeighborhoodName(lat, lng);
  const pin: ComparisonPin = {
    id: `pin-${Date.now()}`,
    lat,
    lng,
    label: `${neighborhood} #${pinCounter}`,
    index: pinCounter,
  };
  pins.value = [...pins.value, pin];
  return pin;
}

function removePin(id: string) {
  pins.value = pins.value.filter(p => p.id !== id);
  if (pins.value.length < 2) isComparisonOpen.value = false;
}

function clearPins() {
  pins.value = [];
  pinCounter = 0;
  isPinMode.value = false;
  isComparisonOpen.value = false;
}

function togglePinMode() {
  isPinMode.value = !isPinMode.value;
}

function openComparison() {
  if (pins.value.length >= 2) {
    isComparisonOpen.value = true;
  }
}

function closeComparison() {
  isComparisonOpen.value = false;
}

function getPinMetrics(pin: ComparisonPin): PinMetrics {
  return generateMetrics(pin.lat, pin.lng);
}

function getPinScore(pin: ComparisonPin): number {
  return computeScore(getPinMetrics(pin));
}

export function useLocationComparison() {
  return {
    pins,
    isPinMode,
    isComparisonOpen,
    pinCount,
    addPin,
    removePin,
    clearPins,
    togglePinMode,
    openComparison,
    closeComparison,
    getPinMetrics,
    getPinScore,
  };
}
