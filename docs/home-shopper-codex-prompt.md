# Codex Build Brief — Home Shopper Map App

Use this as the implementation brief.

## Objective
Build a lightweight static web app for comparing a small set of home listings against walkability to downtown cores and distances to key anchors. The app must compile to static assets and be deployable on GitHub Pages.

## Hard constraints
- static client-side app only
- no backend
- no auth
- no paid API dependency required for core functionality
- must work well with CSVs that already include lat/lng
- geocoding must be optional and pluggable
- keep dependencies minimal

## Recommended stack
- Vite
- TypeScript
- Leaflet
- Papa Parse
- localStorage
- Vitest

## Primary workflow
1. User uploads CSV or pastes listing rows.
2. App parses listings.
3. If lat/lng exist, use them directly.
4. If coordinates are missing, optionally geocode and cache.
5. App renders listing markers on a map.
6. App renders downtown walkability circles for selected downtowns.
7. App shows distances from listings to downtowns and anchors.
8. User can favorite or dismiss listings.
9. State persists locally.

## Seed downtown cores
- Downtown Mountain View
- Downtown Sunnyvale
- Downtown Campbell

## Seed anchors
- Patrick Henry 2
- Apple Park
- Shoreline Lake

## Walkability presets
Approximate walkability using circles:
- 10 min = 0.5 miles
- 15 min = 0.75 miles
- 20 min = 1.0 miles

Store these as editable constants.

## Required features
- CSV upload
- paste input
- map with markers
- walkability circle overlays
- popup or side panel with listing details
- distance calculations to cores and anchors
- favorite and dismiss state
- favorites-only / hide-dismissed filters
- local persistence
- graceful error handling
- basic tests
- GitHub Pages deployment setup

## CSV schema
Required:
- address

Optional:
- price
- beds
- baths
- sqft
- lot_size
- year_built
- hoa
- url
- lat
- lng

## Acceptance criteria
- importing 3 valid listings shows 3 markers
- lat/lng rows skip geocoding
- missing lat/lng rows can geocode and cache
- selecting 15-minute preset draws the 15-minute circles
- clicking a listing shows distances to all downtowns and anchors
- favorites/dismissed state survives reload
- build output is static and deployable to GitHub Pages

## Architecture notes
- keep domain logic separate from UI
- geometry/distance code should be tested and framework-agnostic
- geocoder must be an interface, not hardcoded throughout the app
- design walkability overlays so GeoJSON polygons can replace circles later

## Deliverables
1. Complete source code
2. README with local dev and deploy instructions
3. `.nojekyll` if needed
4. GitHub Actions workflow for Pages deployment or equivalent clear setup
5. tests for parsing, distance, walkability, and persistence

Read the full product spec in `home-shopper-app-spec.md` and follow it unless a simpler implementation still satisfies all acceptance criteria.
