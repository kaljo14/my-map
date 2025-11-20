# Barbershop Analysis Map

A Vue 3 + TypeScript application for analyzing barbershop locations in Sofia, featuring interactive maps, filtering, and opportunity zone analysis.

## Features

-   **Interactive Map**: Visualize barbershops on a Leaflet map.
-   **Clustering**: Efficiently handle large numbers of markers.
-   **Filtering**: Filter by rating, price, and services.
-   **Opportunity Zones**: Identify areas with low competition.
-   **Authentication**: Secure login via Keycloak to protect data modification.
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

3.  **Start Keycloak Infrastructure**
    This project uses Keycloak for authentication. You need to start the local identity server before running the app.
    ```bash
    docker-compose up -d
    ```

3.  **Configure Keycloak**
    Since this is a local setup, you need to configure the realm manually once:
    
    1.  **Access Admin Console**: [http://localhost:8081](http://localhost:8081)
    2.  **Login**: `admin` / `admin`
    3.  **Create Realm**:
        -   Create a new realm named `barbershop-realm`.
    4.  **Create Client**:
        -   Create a new client named `barbershop-app`.
        -   **Client authentication**: Off (Public).
        -   **Valid redirect URIs**: `http://localhost:5173/*`
        -   **Web origins**: `+`
    5.  **Create User**:
        -   Create a new user (e.g., `user`).
        -   Set credentials (password) and turn off "Temporary".

4.  **Run the Application**
    ```bash
    npm run dev
    ```

## Usage

-   **View Map**: Browse barbershops in Sofia.
-   **Login**: Click the "Login" button in the top-right header to authenticate with Keycloak.
-   **Edit/Delete**: Once logged in, click on any barbershop marker to see the "Edit" (⚙️) button in the popup.
