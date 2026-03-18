import { ref } from 'vue';

export type LatLng = [number, number];

function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function usePolygonFilter() {
  const isDrawingMode = ref(false);
  const drawingVertices = ref<LatLng[]>([]);
  const activePolygon = ref<LatLng[] | null>(null);

  const startDrawing = () => {
    activePolygon.value = null;
    drawingVertices.value = [];
    isDrawingMode.value = true;
  };

  const addVertex = (lat: number, lng: number) => {
    drawingVertices.value = [...drawingVertices.value, [lat, lng]];
  };

  const finishDrawing = () => {
    if (drawingVertices.value.length >= 3) {
      activePolygon.value = [...drawingVertices.value];
    }
    isDrawingMode.value = false;
    drawingVertices.value = [];
  };

  const clearPolygon = () => {
    activePolygon.value = null;
    isDrawingMode.value = false;
    drawingVertices.value = [];
  };

  const isInsideActivePolygon = (lat: number, lng: number): boolean => {
    if (!activePolygon.value || activePolygon.value.length < 3) return true;
    return pointInPolygon([lat, lng], activePolygon.value);
  };

  return {
    isDrawingMode,
    drawingVertices,
    activePolygon,
    startDrawing,
    addVertex,
    finishDrawing,
    clearPolygon,
    isInsideActivePolygon,
  };
}
