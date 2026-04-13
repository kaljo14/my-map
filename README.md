# Barbershop Analysis Map

A Vue 3 + TypeScript application for analyzing barbershop locations in Sofia, featuring interactive maps, filtering, and opportunity zone analysis.

## Features

-   **Interactive Map**: Visualize barbershops on a Leaflet map.
-   **Clustering**: Efficiently handle large numbers of markers.
-   **Filtering**: Filter by rating, price, and services.
-   **Opportunity Zones**: Identify areas with low competition.
-   **Authentication**: Secure login via Clerk to protect data modification.
-   **Management**: Edit and delete barbershop entries (requires login).

## Prerequisites

-   Node.js (v16+)
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
