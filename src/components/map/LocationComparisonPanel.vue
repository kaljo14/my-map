<template>
  <div class="comparison-panel">
    <PanelHeader title="Location Comparison" @close="$emit('close')" />

    <div class="panel-body">
      <!-- Pin cards -->
      <div
        v-for="(pin, idx) in props.pins"
        :key="pin.id"
        class="location-card"
        :style="{ borderColor: `${pinColor(idx)}22` }"
      >
        <div class="card-header">
          <div class="pin-badge" :style="{ background: `${pinColor(idx)}33`, color: pinColor(idx), borderColor: `${pinColor(idx)}66` }">{{ idx + 1 }}</div>
          <div class="pin-info">
            <span class="pin-label">{{ pin.label }}</span>
            <span class="pin-coords">{{ pin.lat.toFixed(4) }}, {{ pin.lng.toFixed(4) }}</span>
          </div>
          <div class="pin-score">
            <span class="score-value" :style="{ color: pinColor(idx) }">{{ getPinScore(pin) }}</span>
            <span class="score-max">/100</span>
          </div>
        </div>

        <div class="metrics-list">
          <MetricBar
            v-for="metric in getMetricRows(pin)"
            :key="metric.label"
            :label="metric.label"
            :value="metric.value"
            :color="pinColor(idx)"
          />
        </div>
      </div>

      <!-- Radar chart -->
      <div class="radar-section">
        <h3 class="radar-title">Radar Overview</h3>
        <div class="radar-wrapper">
          <svg class="radar-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
            <!-- Grid pentagons -->
            <polygon
              v-for="level in [0.25, 0.5, 0.75, 1.0]"
              :key="level"
              :points="getPentagonPoints(level, 100, 100, 80)"
              fill="none"
              stroke="rgba(245,240,232,0.08)"
              stroke-width="1"
            />
            <!-- Axis lines -->
            <line
              v-for="(axis, i) in axisAngles"
              :key="i"
              :x1="100"
              :y1="100"
              :x2="100 + 80 * Math.cos(axis)"
              :y2="100 + 80 * Math.sin(axis)"
              stroke="rgba(245,240,232,0.08)"
              stroke-width="1"
            />
            <!-- Data polygons: draw in reverse so pin 1 is on top -->
            <polygon
              v-for="pin in [...props.pins].reverse()"
              :key="'radar-' + pin.id"
              :points="getDataPoints(pin, 100, 100, 80)"
              :fill="pinFill(pinIdx(pin))"
              :stroke="pinColor(pinIdx(pin))"
              stroke-width="1.5"
            />
            <!-- Axis labels -->
            <text
              v-for="(label, i) in axisLabels"
              :key="'lbl-' + i"
              :x="100 + 95 * Math.cos(axisAngles[i]!)"
              :y="100 + 95 * Math.sin(axisAngles[i]!) + 4"
              fill="rgba(245,240,232,0.45)"
              font-size="9"
              text-anchor="middle"
              font-family="system-ui, sans-serif"
            >{{ label }}</text>
          </svg>
        </div>

        <!-- Legend -->
        <div v-if="props.pins.length >= 2" class="radar-legend">
          <div class="legend-item" v-for="(pin, idx) in props.pins" :key="pin.id">
            <span class="legend-dot" :style="{ background: pinColor(idx) }"></span>
            <span class="legend-label">{{ pin.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComparisonPin } from '@/composables/useLocationComparison';
import { useLocationComparison } from '@/composables/useLocationComparison';
import MetricBar from '@/components/ui/MetricBar.vue';
import PanelHeader from '@/components/ui/PanelHeader.vue';

const props = defineProps<{
  pins: ComparisonPin[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'export'): void;
}>();

const { getPinMetrics, getPinScore } = useLocationComparison();

const PIN_COLORS = ['#d97757', '#10b981', '#f59e0b', '#c4b8ae', '#c05e3a'];

function pinColor(idx: number): string {
  return PIN_COLORS[idx % PIN_COLORS.length]!;
}

function pinIdx(pin: ComparisonPin): number {
  return props.pins.indexOf(pin);
}

function pinFill(idx: number): string {
  const c = pinColor(idx);
  return `${c}1a`;
}

function getMetricRows(pin: ComparisonPin) {
  const m = getPinMetrics(pin);
  return [
    { label: 'Foot Traffic',     value: m.footTraffic },
    { label: 'Low Competition',  value: m.lowCompetition },
    { label: 'Transit Access',   value: m.transitAccess },
    { label: 'Demographics Fit', value: m.demographicsFit },
    { label: 'Rent Value',       value: m.rentValue },
  ];
}

// Radar chart math
const AXES = 5;
// Angles starting from top (-π/2), going clockwise
const axisAngles = Array.from({ length: AXES }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / AXES);
const axisLabels = ['Traffic', 'Low Comp.', 'Transit', 'Demo.', 'Rent'];

function getPentagonPoints(level: number, cx: number, cy: number, maxR: number): string {
  return axisAngles
    .map(a => `${cx + maxR * level * Math.cos(a)},${cy + maxR * level * Math.sin(a)}`)
    .join(' ');
}

function getDataPoints(pin: ComparisonPin, cx: number, cy: number, maxR: number): string {
  const m = getPinMetrics(pin);
  const values = [m.footTraffic, m.lowCompetition, m.transitAccess, m.demographicsFit, m.rentValue];
  return axisAngles
    .map((a, i) => {
      const r = (values[i]! / 100) * maxR;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(' ');
}
</script>

<style scoped>
.comparison-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: 320px;
  z-index: 1500;
  background: rgba(22, 27, 22, 0.96);
  border: 1px solid rgba(245, 240, 232, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Body */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-body::-webkit-scrollbar { width: 4px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb {
  background: rgba(245, 240, 232, 0.12);
  border-radius: 2px;
}

/* Location card */
.location-card {
  background: rgba(245, 240, 232, 0.03);
  border: 1px solid rgba(245, 240, 232, 0.07);
  border-radius: 12px;
  padding: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.pin-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* pin badge colors applied via inline style */

.pin-info {
  flex: 1;
  min-width: 0;
}

.pin-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #f5f0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pin-coords {
  display: block;
  font-size: 0.7rem;
  color: #5a5048;
  margin-top: 1px;
}

.pin-score {
  flex-shrink: 0;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  line-height: 1;
}

.score-max {
  font-size: 0.65rem;
  color: #5a5048;
}

/* Metrics */
.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

/* Radar */
.radar-section {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(245, 240, 232, 0.06);
  border-radius: 12px;
  padding: 14px;
}

.radar-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #c4b8ae;
  margin: 0 0 12px;
}

.radar-wrapper {
  display: flex;
  justify-content: center;
}

.radar-svg {
  width: 180px;
  height: 180px;
}

.radar-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: #8a7e72;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

/* legend dot colors applied via inline style */
</style>
