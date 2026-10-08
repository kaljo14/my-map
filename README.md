# Barbershop Analysis Map

A Vue 3 + TypeScript application for analyzing barbershop locations in Sofia, featuring interactive maps, filtering, and opportunity zone analysis.

## Features

-   **Interactive Map**: MapLibre GL JS renders the map, vector data layers, drawing tools, markers, and popups.
-   **Clustering**: Supercluster groups places; deck.gl renders their icons and cluster labels over MapLibre.
-   **Filtering**: Filter by rating, price, and services.
-   **Opportunity Zones**: Identify areas with low competition.
-   **Authentication**: Secure login via Clerk to protect data modification.
-   **Management**: Edit and delete barbershop entries (requires login).

## Prerequisites

-   Node.js 22.20+ recommended (the regression tests use Node's experimental module mocking)
-   Docker & Docker Compose

## Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**
    Copy the example environment file and update the values as needed:
    ```bash
    cp .env.example .env
    ```
    
    Available environment variables:
    - `VITE_API_BASE_URL`: Base URL for the barbershop API (default: `http://localhost:8080`)
    - `VITE_TILE_SERVER_URL`: Base URL for the tile server (default: `http://localhost:8080`)

3.  **Run the Application**
    ```bash
    npm run dev
    ```

## Usage

-   **View Map**: Browse barbershops in Sofia.
-   **Login**: Click the "Login" button in the top-right header to authenticate with Clerk.
-   **Edit/Delete**: Once logged in, click on any barbershop marker to see the "Edit" (⚙️) button in the popup.

## Map architecture and validation

OpenFreeMap supplies light/dark basemap styles. Martin and the API supply application data; MapLibre renders the vector and GeoJSON overlays. Basemap switches preserve the overlays, their filters, and visibility. Map coordinates use `[longitude, latitude]`; polygon/filter state uses `[latitude, longitude]` and converts at the rendering boundary.

The installed deck.gl 9.2 integration uses `MapboxOverlay` from `@deck.gl/mapbox` for MapLibre compatibility. This is an overlay adapter, not the Mapbox GL JS renderer. There is no `mapbox-gl` dependency or renderer token requirement. Google Maps links and place photos are separate place-data features.

```bash
npm test         # Map lifecycle, URL sync, theme preservation, clustering, drawing
npm run build   # Type-check and production bundle
```

See [the migration plan and verification checklist](docs/maplibre-migration.md) for the audit, completed changes, and remaining live-browser checks.

## Image releases

See [Semantic image releases](RELEASE.md) for version tags, GitHub secrets, and deployment.
