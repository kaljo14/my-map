import { watch, createApp } from 'vue';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Ref } from 'vue';

import i18n from '@/i18n';
import auth from '@/services/auth';
import type { Place } from '@/api/places';
import type { ComparisonPin } from '@/composables/useLocationComparison';
import type { ShopLocation } from '@/composables/useShopManagement';
import ShopPopup from '@/components/map/ShopPopup.vue';

// ── Composable ──────────────────────────────────────────────────────────────

export function useMapMarkers(
  mapInstance: Ref<MapLibreMap | null>,
  opts: {
    userAddedShops: Ref<ShopLocation[]>;
    newShopPin: Ref<{ lat: number; lng: number } | null>;
    comparisonPins: Ref<ComparisonPin[]>;
    removeComparisonPin: (id: string) => void;
    togglePinMode: () => void;
    editBarbershop: (shop: Place) => void;
    confirmDelete: (shop: Place) => void;
  },
) {
  const { isAuthenticated } = auth;

  // Internal marker caches
  const comparisonMarkers = new Map<string, maplibregl.Marker>();
  const userShopMarkerCache = new Map<string, maplibregl.Marker>();
  let activeShopPopup: maplibregl.Popup | null = null;
  let newShopPinMarker: maplibregl.Marker | null = null;

  // ── Shop popup ──────────────────────────────────────────────────────────

  function openShopPopup(
    place: Place,
    lngLat: maplibregl.LngLat,
    inst: { config: { category: string }; [key: string]: unknown },
  ) {
    const el = document.createElement('div');
    const app = createApp(ShopPopup, {
      shop: place,
      isAuthenticated: isAuthenticated.value,
      onEdit: (s: Place) => inst.config.category === 'barbershop' ? opts.editBarbershop(s) : null,
      onDelete: (s: Place) => inst.config.category === 'barbershop' ? opts.confirmDelete(s) : null,
    });
    app.use(i18n);
    app.mount(el);
    activeShopPopup?.remove();
    activeShopPopup = new maplibregl.Popup({ maxWidth: '400px', closeButton: true })
      .setLngLat(lngLat)
      .setDOMContent(el)
      .addTo(mapInstance.value!);
  }

  // ── User-added shops sync ───────────────────────────────────────────────

  function syncUserAddedShops(map: MapLibreMap) {
    const current = new Set(opts.userAddedShops.value.map(s => `${s.lat},${s.lng}`));

    // Add new
    for (const shop of opts.userAddedShops.value) {
      const key = `${shop.lat},${shop.lng}`;
      if (userShopMarkerCache.has(key)) continue;
      const el = document.createElement('div');
      el.className = 'shop-marker-wrapper saved-shop-marker';
      el.style.cssText = 'cursor:pointer;transform:translate(-50%,-100%)';
      el.innerHTML = '<div class="shop-pin-marker"><div class="shop-pin-head"><span class="material-symbols-outlined">content_cut</span></div></div>';
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([shop.lng, shop.lat])
        .addTo(map);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        activeShopPopup?.remove();
        activeShopPopup = new maplibregl.Popup()
          .setLngLat([shop.lng, shop.lat])
          .setHTML(`<div class="popup-content"><h3 class="popup-title">${shop.name}</h3><div class="popup-info"><div class="info-row"><strong>Added:</strong> ${new Date(shop.timestamp).toLocaleDateString()}</div></div></div>`)
          .addTo(map);
      });
      userShopMarkerCache.set(key, marker);
    }

    // Remove stale
    for (const [key, marker] of userShopMarkerCache) {
      if (!current.has(key)) {
        marker.remove();
        userShopMarkerCache.delete(key);
      }
    }
  }

  // ── New shop pin sync ───────────────────────────────────────────────────

  function syncNewShopPin(map: MapLibreMap) {
    if (opts.newShopPin.value) {
      if (!newShopPinMarker) {
        const el = document.createElement('div');
        el.className = 'shop-marker-wrapper new-shop-marker';
        el.style.cssText = 'transform:translate(-50%,-100%)';
        el.innerHTML = '<div class="shop-pin-marker"><div class="shop-pin-head new-pin"><span class="material-symbols-outlined">location_on</span></div></div>';
        newShopPinMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([opts.newShopPin.value.lng, opts.newShopPin.value.lat])
          .addTo(map);
      } else {
        newShopPinMarker.setLngLat([opts.newShopPin.value.lng, opts.newShopPin.value.lat]);
      }
    } else if (newShopPinMarker) {
      newShopPinMarker.remove();
      newShopPinMarker = null;
    }
  }

  // ── Comparison pin markers ──────────────────────────────────────────────

  function addComparisonMarker(pin: ComparisonPin, map: MapLibreMap, dotIndex: number) {
    const el = document.createElement('div');
    el.className = 'comparison-pin-marker';
    el.dataset.pinId = pin.id;
    el.style.cssText = 'cursor:pointer;transform:translate(-50%,-100%)';
    el.innerHTML = `<div class="comparison-pin-dot dot-${dotIndex}"><span style="transform:rotate(45deg);display:block">${pin.index}</span></div>`;
    el.title = 'Click to remove';
    el.addEventListener('click', (evt) => {
      evt.stopPropagation();
      opts.removeComparisonPin(pin.id);
    });
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([pin.lng, pin.lat])
      .addTo(map);
    comparisonMarkers.set(pin.id, marker);
  }

  // Watch for removed comparison pins -> remove their map markers
  watch(opts.comparisonPins, (newPins) => {
    for (const [id, marker] of comparisonMarkers) {
      if (!newPins.find(p => p.id === id)) {
        marker.remove();
        comparisonMarkers.delete(id);
      }
    }
  });

  /** Attach to map's render event to keep DOM markers in sync */
  function syncMarkers(map: MapLibreMap) {
    syncUserAddedShops(map);
    syncNewShopPin(map);
  }

  return {
    openShopPopup,
    addComparisonMarker,
    syncMarkers,
  };
}
