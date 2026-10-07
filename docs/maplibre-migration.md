# MapLibre migration plan and audit

## Starting state

The map renderer, vector/GeoJSON layers, polygon drawing, geocoding markers, comparison pins, and popups already used MapLibre GL JS 5.21.1. Places used deck.gl 9.2.11 and Supercluster. The dependency manifest and lockfile had no Leaflet or Mapbox GL JS renderer package.

Migration was incomplete at the page boundary: `index.html` still loaded Leaflet JavaScript, Leaflet CSS, and MarkerCluster JavaScript/CSS from a CDN. Documentation still described Leaflet. Some click handlers still expected Leaflet-shaped events. The direct MapLibre integration also lacked the lifecycle and reactive camera behavior previously provided by the Vue map wrapper.

## Plan and completed implementation

1. **Audit the rendering stack.** Inspect entry points, dependencies, CSS, all map composables, controls, sources, and deployment configuration. Keep the existing MapLibre renderer and supported place-overlay integration.
2. **Remove legacy runtime assets.** Remove all five Leaflet/MarkerCluster CDN resources. Use the MapLibre stylesheet bundled by Vite. Pass MapLibre click coordinates directly into shop/listing actions.
3. **Finish lifecycle integration.** Register place composables during Vue setup, publish the map only when loaded, scope deck overlays to each map, cancel pending initialization on unmount, remove the map, disconnect resize observers, cancel URL timers, unmount popup Vue apps, and clean up markers/geocoding. Dispose the map-owned layer store so reopening starts with consistent layer visibility.
4. **Restore URL camera behavior.** Apply route coordinates to the MapLibre camera, retain fractional zoom levels, and avoid feedback loops from rounded URL writes.
5. **Validate and document.** Add runnable regression tests, run type checking and the production build, audit the generated entry page and dependency tree, and document browser checks.

## Why some names remain

- `@deck.gl/mapbox` / `MapboxOverlay`: the installed deck.gl 9.2 adapter explicitly supports MapLibre; it does not install or instantiate Mapbox GL JS. Keep all deck.gl packages compatible when upgrading. Newer deck.gl documentation describes a separate `@deck.gl/maplibre` adapter; adopting it is a dependency upgrade, not required to remove the old renderer from this project.
- `application/vnd.mapbox-vector-tile`: the standard MVT content type used by the tile server, supported by MapLibre.
- Google Maps links/photo URLs: place metadata and photos, independent of the map renderer.
- `LatLng` polygon state: the application's coordinate tuple type, not an imported Leaflet type. It is converted to GeoJSON longitude/latitude order when drawn.

## Automated verification

`npm test` uses real Vue reactivity, component lifecycle, Supercluster, and deck.gl layers with mocked browser map/control interfaces. It checks:

- Light/dark switching preserves application sources, layer order, filters, and visibility without duplicate basemap resources.
- Initial and subsequent URL views preserve longitude/latitude order and fractional zoom; URL writes do not cause camera loops.
- Unmount aborts pending style requests, removes the map, disconnects observers, and cancels URL timers.
- Separate/recreated maps receive independent deck overlays.
- Cluster expansion, visibility, clustering toggles, and watcher/listener cleanup work.
- Polygon drawing converts coordinates, closes rings, clears temporary lines, and updates the area filter.

The tests and `npm run build` passed in the migration workspace. `git diff --check` passed. No Leaflet assets remain in the production entry page, source, manifest, or lockfile.

The existing `npm run lint` fails independently of this migration: its configuration scans generated `dist` files and lacks TypeScript parsing for application files. The build also reports existing large-chunk, stale browser-data, and loaders.gl browser-external warnings.

## Live-browser verification

The workspace sandbox blocked binding the Vite server (`listen EPERM`) and launching a headless browser. The automated checks do not validate actual GPU rendering, external tiles, Clerk authentication, or live API responses. Complete this checklist with the normal development services before deployment:

- Open `/map` while signed in; confirm basemap, attribution, controls, and place icons, with no Leaflet downloads.
- Toggle place categories and clustering, expand a cluster, and open/close a place popup.
- Draw/clear a polygon; add/remove comparison pins and open the listing form from a map click.
- Enable vector/GeoJSON analysis layers; switch light/dark repeatedly and confirm data, filters, legends, and popups remain usable.
- Search an address, resize the sidebar/window, and check the camera and marker position.
- Open a URL with fractional zoom, change coordinates through router navigation, and verify the camera updates.
- Leave `/map`, return, and repeat; confirm one map/overlay set and working toggles without stale state or duplicate listeners.
