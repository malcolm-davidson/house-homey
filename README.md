# Home Shopper Map (MVP)

Static, client-side app for comparing a shortlist of home listings against downtown walkability circles and anchor distances.

## Stack
- Vite + TypeScript
- Leaflet (map)
- Papa Parse (CSV)
- localStorage persistence
- Vitest

## Features in MVP
- CSV upload and paste input (CSV text or line-delimited addresses)
- Example CSV loader (`public/home-shopper-example-listings.csv`)
- Optional geocoding for missing coordinates (Nominatim + cache)
- Listing markers + downtown core markers + anchor markers
- Walkability overlays for 10/15/20 minute presets
- Listing details with imported fields and computed distances
- Favorite / dismiss controls with local persistence
- Filters: favorites-only and hide-dismissed

## Setup
```bash
npm install
```

## Local development
```bash
npm run dev
```

## Tests
```bash
npm test
```

## Production build
```bash
npm run build
```

The app builds to static assets in `dist/` and is suitable for static hosting.

## Deploy to GitHub Pages
1. Push this repo to GitHub.
2. In repository settings, enable **Pages** with **GitHub Actions** source.
3. Ensure your default deployment branch is `main` (workflow triggers on push to `main`).
4. Push commits; `.github/workflows/deploy-pages.yml` builds and deploys `dist`.

## Geocoding note
Core usage should prefer CSV rows with `lat`/`lng`. Geocoding is intentionally optional and pluggable via `Geocoder` and `CachedGeocoder` abstractions.

## Remaining work for Phase 2 (not in MVP)
- Replace circles with polygon/isochrone overlays
- Add better marker clustering and table/ranking view
- Add explicit geocode provider configuration UI
- Improve error toasts and import diagnostics UX
- Add map viewport persistence and richer saved-project management
