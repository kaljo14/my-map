import { ref, watch, type Ref } from 'vue';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';

export interface GeocodingResult {
  name: string;
  street?: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  displayName: string;
}

const PHOTON_BASE = 'https://photon.komoot.io/api/';
const SOFIA_LAT = 42.6977;
const SOFIA_LNG = 23.3219;
const DEBOUNCE_MS = 300;
const RESULT_LIMIT = 5;

function formatResult(feature: any): GeocodingResult {
  const props = feature.properties ?? {};
  const [lng, lat] = feature.geometry.coordinates;
  const parts = [props.name, props.street, props.city ?? props.state, props.country].filter(Boolean);
  return {
    name: props.name ?? '',
    street: props.street,
    city: props.city ?? props.state,
    country: props.country,
    lat,
    lng,
    displayName: parts.join(', '),
  };
}

export function useGeocoding(mapInstance: Ref<MapLibreMap | null>) {
  const query = ref('');
  const results = ref<GeocodingResult[]>([]);
  const isLoading = ref(false);
  const isOpen = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout>;
  let abortController: AbortController | null = null;
  let marker: maplibregl.Marker | null = null;

  async function search(q: string) {
    if (q.length < 2) {
      results.value = [];
      return;
    }

    abortController?.abort();
    abortController = new AbortController();

    isLoading.value = true;
    try {
      const params = new URLSearchParams({
        q,
        lang: 'en',
        limit: String(RESULT_LIMIT),
        lat: String(SOFIA_LAT),
        lon: String(SOFIA_LNG),
        bbox: '23.18,42.60,23.50,42.80',
      });
      const res = await fetch(`${PHOTON_BASE}?${params}`, {
        signal: abortController.signal,
      });
      if (!res.ok) return;
      const data = await res.json();
      results.value = (data.features ?? []).map(formatResult);
      isOpen.value = results.value.length > 0;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('[Geocoding] search failed:', e);
      }
    } finally {
      isLoading.value = false;
    }
  }

  watch(query, (q) => {
    clearTimeout(debounceTimer);
    if (!q.trim()) {
      results.value = [];
      isOpen.value = false;
      return;
    }
    debounceTimer = setTimeout(() => search(q.trim()), DEBOUNCE_MS);
  });

  function selectResult(result: GeocodingResult) {
    const map = mapInstance.value;
    if (!map) return;

    query.value = result.displayName;
    results.value = [];
    isOpen.value = false;

    map.flyTo({ center: [result.lng, result.lat], zoom: 16 });

    if (!marker) {
      const el = document.createElement('div');
      el.className = 'geocoding-marker';
      el.innerHTML =
        '<div class="geocoding-marker-dot">' +
        '<span class="material-symbols-outlined" style="transform:rotate(45deg);color:#fff;font-size:16px">search</span>' +
        '</div>';
      marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([result.lng, result.lat])
        .addTo(map);
    } else {
      marker.setLngLat([result.lng, result.lat]);
    }
  }

  function clearSearch() {
    query.value = '';
    results.value = [];
    isOpen.value = false;
    abortController?.abort();
    if (marker) {
      marker.remove();
      marker = null;
    }
  }

  return {
    query,
    results,
    isLoading,
    isOpen,
    selectResult,
    clearSearch,
  };
}
