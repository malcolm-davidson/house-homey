# Home Shopper Map App — Product & Technical Spec

Version: 1.0  
Audience: Codex / engineer implementing the MVP  
Primary owner: User  
Deployment target: GitHub Pages (static site)

---

## 1. Product summary

Build a lightweight, client-side web app that helps the user evaluate a small set of home listings against lifestyle geography.

The app is not a home-search marketplace. It is a personal decision-support tool for comparing a shortlist of homes on an interactive map.

The app must let the user:
- upload or paste a small batch of listings (typically 10–20)
- see those listings immediately on a map
- overlay downtown walkability regions for selected downtown cores
- view distances from each listing to specific anchors (school/work/recreation)
- favorite or dismiss listings
- save state locally in the browser

Primary question the app should answer:
> Which homes are worth seeing in person based on walkability to preferred downtowns and proximity to important anchors?

---

## 2. Intended users

### Primary user
- the buyer
- priorities: walkability, commute relevance, recreation, lifestyle fit

### Secondary user
- spouse/partner
- priorities overlap enough that the same app should be usable without a separate account system

### Usage model
- personal tool
- small number of records at a time
- browser-based
- no login for MVP
- static deploy on GitHub Pages

---

## 3. Goals and non-goals

### Goals
1. Replace spreadsheet + map hopping.
2. Make walkability-to-downtown easy to visualize.
3. Make key anchors visible and comparable.
4. Support small-batch home tour decisions.
5. Require minimal setup and avoid paid APIs for MVP.

### Non-goals for MVP
- MLS scraping
- authenticated multi-user collaboration
- backend database
- server-side processing
- advanced ranking engine
- subjective annotations/comments
- school data integration
- drive-time or traffic-aware commute APIs
- production-grade bulk geocoding pipeline

---

## 4. MVP scope

### In scope
- single-page map app
- CSV upload and paste input
- support listings with required address and optional metadata
- support optional pre-geocoded `lat`/`lng`
- geocode missing coordinates on demand, with caching
- map markers for listings
- downtown cores as center points
- walkability circles representing approximate 10/15/20 minute walks
- markers for anchors:
  - Downtown Mountain View
  - Downtown Sunnyvale
  - Downtown Campbell
  - Patrick Henry 2
  - Apple Park
  - Shoreline Lake
- listing detail popup/panel with computed distances
- favorite and dismiss actions
- local browser persistence

### Explicitly out of scope for MVP
- true network-based walking isochrones
- bike-time or drive-time calculations
- route directions
- account sync across devices
- realtor-facing workflows

---

## 5. Product decisions already made

1. **Platform**: static client-side app that can be deployed to GitHub Pages.
2. **Listing volume**: approximately 10–20 listings at once.
3. **Core representation**: downtowns are represented as a point center plus walkability radius approximation.
4. **Walkability representation in MVP**: circles approximating 10/15/20 minute walking thresholds.
5. **Persistence**: browser local persistence for saved cores, favorites, dismissed listings, cached geocodes, and last project state.
6. **Primary output**: map-first UI; ranking/table is secondary and not required for MVP.
7. **Avoid paid APIs**: preferred.

---

## 6. UX requirements

### Core workflow
1. User opens app.
2. User uploads a CSV or pastes listing rows.
3. App parses records and resolves coordinates.
4. Map zooms to fit listings and selected cores.
5. User toggles walkability preset: 10 / 15 / 20 minutes.
6. App draws downtown circles.
7. User clicks a listing marker.
8. App shows listing details and distances to downtowns/anchors.
9. User favorites or dismisses listings.
10. App persists state locally.

### UX principles
- fast first render
- no required account
- very small learning curve
- map-first, not table-first
- forgiving input pipeline
- obvious visual distinction between listings, downtown cores, and anchors

---

## 7. Screens and information architecture

## 7.1 Single-page app layout

### Left control panel
Sections:
1. **Listings input**
   - Upload CSV
   - Paste CSV / line-delimited addresses
   - Clear current project
2. **Walkability controls**
   - Walkability preset selector: 10 / 15 / 20 minutes
   - Toggle per downtown core
3. **Filters**
   - Show favorites only
   - Hide dismissed
4. **Project actions**
   - Save current project to local storage
   - Reset saved state

### Main map area
Displays:
- listing markers
- downtown core markers
- walkability circles
- anchor markers
- popup on marker click

### Optional right details drawer (preferred if easy)
Shows selected listing details:
- address
- metadata fields
- nearest downtown core
- inside/outside each walkability circle
- distances to anchors
- favorite/dismiss buttons

If a drawer is too much for MVP, a marker popup is acceptable.

---

## 8. Functional requirements

## 8.1 Listing ingestion

### Supported input methods
1. CSV upload
2. Paste text into textarea

### Supported listing fields
Required:
- `address`

Optional:
- `price`
- `beds`
- `baths`
- `sqft`
- `lot_size`
- `year_built`
- `hoa`
- `url`
- `lat`
- `lng`

### Input behavior
- If `lat` and `lng` are present and valid, use them directly.
- If coordinates are missing, geocode the address.
- Invalid or ungeocodable records should not crash the app.
- Show a visible warning list for records that failed to geocode.

### Paste support
Support two formats:
1. raw line-delimited addresses
2. CSV text with header row

---

## 8.2 Geocoding

### Requirements
- Geocoding must be abstracted behind a provider interface.
- Cached results must be reused before any outbound request.
- Requests must be user-triggered, not background bulk jobs.
- The implementation must allow geocoder replacement without large code changes.

### Provider interface
```ts
interface Geocoder {
  geocode(address: string): Promise<{ lat: number; lng: number; normalizedAddress?: string } | null>;
}
```

### MVP default behavior
- Support pre-geocoded CSV as the most reliable path.
- Also support a simple geocoding provider for occasional use.
- Cache by normalized address string in localStorage.

### Important implementation note
Because the app is static and avoids paid APIs, geocoding should be treated as a convenience path, not the only path. The app should work well with pre-geocoded inputs.

### Required safeguards
- throttle requests
- do not autocomplete
- do not retry aggressively
- cache successful responses
- allow provider switching via config

---

## 8.3 Map behavior

### Base map
- Interactive slippy map
- Initial center: South Bay / Peninsula region if no data is present
- After data load: fit bounds to all visible markers and selected cores

### Marker types
1. **Listing markers**
   - default state
   - favorite state
   - dismissed state (either hidden or visually muted)
2. **Downtown core markers**
   - distinct icon/color
3. **Anchor markers**
   - distinct icon/color

### Marker interactions
- click listing marker → show details
- click core marker → show core info
- click anchor marker → show anchor name

---

## 8.4 Walkability overlays

### MVP approximation
Use circles around downtown center points.

### Presets
- 10 min walk ≈ 0.5 miles
- 15 min walk ≈ 0.75 miles
- 20 min walk ≈ 1.0 miles

These values should be configurable constants.

### Overlay behavior
- user selects one global walkability preset
- app draws circles for enabled downtown cores
- app computes whether each listing falls inside each enabled circle

### Future compatibility
Design overlay system so circles can later be replaced by GeoJSON polygons for true walking isochrones.

Suggested abstraction:
```ts
interface WalkabilityRegion {
  id: string;
  name: string;
  contains(lat: number, lng: number): boolean;
  toLeafletLayer(): L.Layer;
}
```

---

## 8.5 Distance calculations

### Required distances per listing
Compute straight-line distance from each listing to:
- Downtown Mountain View
- Downtown Sunnyvale
- Downtown Campbell
- Patrick Henry 2
- Apple Park
- Shoreline Lake

### Output fields
For each listing, compute:
- `distanceToMountainViewMiles`
- `distanceToSunnyvaleMiles`
- `distanceToCampbellMiles`
- `distanceToPatrickHenry2Miles`
- `distanceToAppleParkMiles`
- `distanceToShorelineLakeMiles`
- `nearestDowntownCore`
- `insideWalkZoneIds[]`

### Precision
- Display to 1 decimal place
- Internal math can use haversine or geodesic approximation

---

## 8.6 Favorites and dismissed listings

### Favorite behavior
- user can mark listing as favorite
- favorite state persists locally
- favorite marker style is visibly distinct

### Dismiss behavior
- user can dismiss listing
- dismissed state persists locally
- default behavior: dismissed listings remain stored but can be hidden by filter

---

## 8.7 Local persistence

Persist these in localStorage:
- imported listings
- geocode cache
- favorite state
- dismissed state
- enabled cores
- last selected walkability preset
- last map viewport if convenient

Use versioned storage keys.

Example:
```ts
const STORAGE_KEYS = {
  project: 'home-shopper:v1:project',
  geocodeCache: 'home-shopper:v1:geocode-cache',
  settings: 'home-shopper:v1:settings',
};
```

---

## 9. Data model

## 9.1 Listing
```ts
export interface Listing {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lotSize?: number | null;
  yearBuilt?: number | null;
  hoa?: number | null;
  url?: string | null;
  favorite: boolean;
  dismissed: boolean;
  sourceRow?: number;
}
```

## 9.2 Core
```ts
export interface Core {
  id: string;
  name: string;
  lat: number;
  lng: number;
  enabled: boolean;
}
```

## 9.3 Anchor
```ts
export interface Anchor {
  id: string;
  name: string;
  lat: number;
  lng: number;
}
```

## 9.4 Derived listing metrics
```ts
export interface ListingMetrics {
  listingId: string;
  nearestDowntownCoreId: string | null;
  distancesMiles: Record<string, number>;
  insideWalkZoneIds: string[];
}
```

## 9.5 App settings
```ts
export type WalkPreset = 10 | 15 | 20;

export interface AppSettings {
  walkPreset: WalkPreset;
  hideDismissed: boolean;
  favoritesOnly: boolean;
}
```

---

## 10. Seed data

## 10.1 Downtown cores
The exact coordinates can be refined during implementation, but the seed set must include:
- Downtown Mountain View
- Downtown Sunnyvale
- Downtown Campbell

## 10.2 Anchors
The exact coordinates can be refined during implementation, but the seed set must include:
- Patrick Henry 2
- Apple Park
- Shoreline Lake

Implementation note: keep this data in a dedicated `src/data/anchors.ts` file so it is easy to adjust.

---

## 11. CSV contract

### Supported header names
Required minimum:
```csv
address
```

Preferred full schema:
```csv
address,price,beds,baths,sqft,lot_size,year_built,hoa,url,lat,lng
```

### Example file
```csv
address,price,beds,baths,sqft,lot_size,year_built,hoa,url,lat,lng
321 Santa Diana Terrace,1800000,3,2,1450,5200,1968,0,,,
415 Santo Domingo Terrace,2100000,4,3,1900,6000,1975,0,,,
63 Braxton Terrace,1950000,3,2.5,1650,3000,2002,250,,,
```

### Parser requirements
- header names should be normalized case-insensitively
- blank numeric fields should become `null`
- parse numeric fields safely
- skip blank lines
- preserve source row number for error reporting

---

## 12. Technical architecture

## 12.1 Recommended stack
Use:
- **Vite**
- **TypeScript**
- **Leaflet** for mapping
- **Papa Parse** for CSV ingestion
- **localStorage** for persistence
- **Vitest** for unit tests

Avoid introducing a backend.

### Why this stack
- compiles to static assets for GitHub Pages
- small footprint
- no server needed
- good fit for a single-page map tool
- simple local development

---

## 12.2 Project structure
```text
home-shopper/
  public/
    .nojekyll
  src/
    app/
      initApp.ts
      state.ts
      storage.ts
    components/
      ControlPanel.ts
      MapView.ts
      ListingDetails.ts
      Toasts.ts
    data/
      cores.ts
      anchors.ts
    domain/
      listings.ts
      metrics.ts
      walkability.ts
      geocoder.ts
    services/
      csv.ts
      geocoding/
        Geocoder.ts
        CachedGeocoder.ts
        NominatimGeocoder.ts
      persistence/
        localProjectStore.ts
    utils/
      distance.ts
      ids.ts
      numbers.ts
      strings.ts
    styles/
      app.css
    main.ts
  tests/
    csv.test.ts
    distance.test.ts
    walkability.test.ts
    storage.test.ts
  index.html
  package.json
  vite.config.ts
  README.md
```

If Codex prefers a lighter structure, preserve the separation of concerns even if file names differ.

---

## 12.3 State management

Use a simple application state container.

Minimum state:
```ts
interface AppState {
  listings: Listing[];
  metricsByListingId: Record<string, ListingMetrics>;
  cores: Core[];
  anchors: Anchor[];
  settings: AppSettings;
  selectedListingId: string | null;
  geocodeFailures: string[];
}
```

Do not over-engineer state management. A small custom store is preferred over a heavy framework.

---

## 13. Key algorithms

## 13.1 Distance calculation
Use haversine formula.

Signature:
```ts
function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number
```

## 13.2 Inside walkability circle
```ts
function isInsideRadiusMiles(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusMiles: number
): boolean
```

## 13.3 Nearest downtown core
Return nearest among enabled downtown cores.

---

## 14. Error handling requirements

The app must fail gracefully for:
- malformed CSV
- missing address values
- invalid lat/lng
- geocoding failures
- localStorage quota or parse issues

UI expectations:
- show non-blocking warning messages
- keep successfully parsed listings usable even if some rows fail
- never blank the whole map due to one bad row

---

## 15. Accessibility and responsiveness

### MVP minimums
- keyboard-accessible buttons and inputs
- visible focus styles
- sufficient contrast
- map usable on laptop screens
- control panel still usable on narrower screens

### Responsive target
- laptop-first
- acceptable tablet behavior
- mobile polish not required for MVP

---

## 16. Testing requirements

At minimum, add unit tests for:
1. CSV parsing
2. numeric normalization
3. haversine distance calculation
4. walkability circle inclusion
5. localStorage read/write versioning
6. listing metrics derivation

Add at least one integration-style test for:
- importing a CSV and deriving listing metrics correctly

---

## 17. Acceptance criteria

### AC1 — Import
Given a valid CSV with 3 listings, the app imports them and renders 3 listing markers.

### AC2 — Pre-geocoded input
Given a CSV with valid `lat`/`lng`, the app must not call the geocoder for those rows.

### AC3 — Missing coordinates
Given a CSV with addresses but no coordinates, the app attempts geocoding and caches successful results.

### AC4 — Walkability circles
When the user selects 15-minute mode, the app draws enabled downtown circles using the configured 15-minute radius.

### AC5 — Distance details
When a user clicks a listing, the app shows distances to all configured downtowns and anchors.

### AC6 — Persistence
Favorites, dismissed status, enabled cores, and selected walkability preset persist across reloads.

### AC7 — Graceful failure
If one listing fails to geocode, the rest of the listings still render and the UI shows a warning.

### AC8 — GitHub Pages compatibility
The built app outputs static assets and can be hosted on GitHub Pages.

---

## 18. Implementation phases

## Phase 1 — Scaffolding
- create Vite + TypeScript app
- add Leaflet and Papa Parse
- set up folder structure
- add base CSS
- add `.nojekyll`
- set up build for GitHub Pages

## Phase 2 — Core map and data model
- implement seed cores and anchors
- render map
- render static core/anchor markers
- add listing domain models

## Phase 3 — Import pipeline
- implement CSV upload and paste parsing
- normalize rows into `Listing`
- support optional `lat`/`lng`
- show parse errors and warnings

## Phase 4 — Geocoding and caching
- implement geocoder interface
- implement cache layer
- resolve missing coordinates on demand
- persist geocode cache

## Phase 5 — Metrics and overlays
- implement distance calculations
- implement walkability presets
- render circles
- compute inside/outside membership
- show listing details popup/drawer

## Phase 6 — Persistence and filtering
- favorite/dismiss actions
- favorites-only and hide-dismissed filters
- save and restore app state

## Phase 7 — Polish and tests
- refine marker styles
- improve empty states and warnings
- add tests
- validate GitHub Pages deployment

---

## 19. GitHub Pages deployment requirements

The deliverable must be a static build output suitable for GitHub Pages.

### Requirements
- no backend
- no server-only runtime code
- no secrets required for the core app
- include `.nojekyll` if needed
- include a GitHub Actions workflow or clear branch-based publish instructions

### Preferred deployment approach
- build with GitHub Actions
- publish generated static site to GitHub Pages

---

## 20. Open issues to leave as TODOs (not blockers)

1. Exact center coordinates for downtown cores.
2. Exact coordinates for Patrick Henry 2 if multiple candidate locations exist.
3. Whether the right-side drawer is worth the added UI complexity versus popups.
4. Whether to add a lightweight results list below the map in V1.1.
5. Whether to support import from Redfin/Zillow URL in V1.1.
6. Whether to replace circles with true walking isochrones in V2.

Codex should not block MVP delivery on these items; seed reasonable defaults.

---

## 21. V2 roadmap (do not implement now)

- true walk-time isochrones using GeoJSON polygons
- driving/biking time layers
- school overlays
- export shortlist CSV
- simple score/ranking system
- spouse comments or notes
- shared project state

---

## 22. Definition of done

The MVP is done when:
- user can upload a small set of listings
- listings render correctly on a map
- downtown walk circles render and can be toggled
- anchors are visible
- clicking a listing reveals useful distances
- favorites/dismissed state persists locally
- the app builds and deploys as a static site
- basic tests pass

---

## 23. Recommended implementation notes for Codex

1. Bias toward simplicity over framework cleverness.
2. Keep geometry and metrics logic framework-agnostic and testable.
3. Keep geocoding pluggable.
4. Build the app to work well even without geocoding by accepting pre-geocoded CSVs.
5. Do not add unnecessary libraries.
6. Treat walkability circles as a replaceable abstraction, not a permanent model.
7. Seed the core and anchor coordinates in config files so the owner can edit them manually.

