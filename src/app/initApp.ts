import { WALK_PRESET_MILES } from '../data/cores';
import { computeListingMetrics } from '../domain/metrics';
import type { GeocodeResult, Listing, WalkPreset } from '../domain/types';
import { parseListingCsv, parsePastedInput } from '../services/csv';
import { CachedGeocoder } from '../services/geocoding/CachedGeocoder';
import { NominatimGeocoder } from '../services/geocoding/NominatimGeocoder';
import { localProjectStore } from '../services/persistence/localProjectStore';
import { renderListingDetails } from '../components/ListingDetails';
import { MapView } from '../components/MapView';
import { defaultSettings, initialState } from './state';

export function initApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="layout">
      <aside class="panel">
        <h2>Home Shopper</h2>
        <section>
          <h3>Listings Input</h3>
          <input id="csvFile" type="file" accept=".csv" />
          <button id="loadExample">Load Example CSV</button>
          <textarea id="pasteArea" rows="6" placeholder="Paste CSV or one address per line"></textarea>
          <button id="importPaste">Import Pasted Input</button>
          <button id="clearProject">Clear Project</button>
          <button id="geocodeMissing">Geocode Missing Coordinates</button>
        </section>
        <section>
          <h3>Walkability</h3>
          <label><input type="radio" name="walkPreset" value="10" /> 10 min</label>
          <label><input type="radio" name="walkPreset" value="15" checked /> 15 min</label>
          <label><input type="radio" name="walkPreset" value="20" /> 20 min</label>
          <div id="coreToggles"></div>
        </section>
        <section>
          <h3>Filters</h3>
          <label><input id="favoritesOnly" type="checkbox" /> Favorites only</label>
          <label><input id="hideDismissed" type="checkbox" checked /> Hide dismissed</label>
        </section>
        <section>
          <h3>Listings</h3>
          <div id="listingList"></div>
        </section>
        <section>
          <h3>Warnings</h3>
          <ul id="warnings"></ul>
        </section>
      </aside>
      <main class="mapWrap"><div id="map"></div></main>
      <aside id="details" class="panel details"></aside>
    </div>
  `;

  const state = initialState();
  state.settings = localProjectStore.loadSettings(defaultSettings);
  const savedProject = localProjectStore.loadProject();
  if (savedProject) {
    state.listings = savedProject.listings;
    state.cores = savedProject.cores;
  }

  const mapView = new MapView(root.querySelector('#map') as HTMLElement, {
    onSelectListing: (listingId) => {
      state.selectedListingId = listingId;
      draw();
    },
  });

  const cacheReader = () => localProjectStore.loadGeocodeCache();
  const cacheWriter = (cache: Record<string, GeocodeResult>) => localProjectStore.saveGeocodeCache(cache);
  const geocoder = new CachedGeocoder(new NominatimGeocoder(), cacheReader, cacheWriter);

  const listingList = root.querySelector('#listingList') as HTMLElement;
  const warningsEl = root.querySelector('#warnings') as HTMLElement;
  const detailsEl = root.querySelector('#details') as HTMLElement;
  const coreToggles = root.querySelector('#coreToggles') as HTMLElement;

  const visibleListings = (): Listing[] =>
    state.listings.filter((l) => {
      if (state.settings.hideDismissed && l.dismissed) return false;
      if (state.settings.favoritesOnly && !l.favorite) return false;
      return true;
    });

  const recomputeMetrics = (): void => {
    state.metricsByListingId = {};
    const radius = WALK_PRESET_MILES[state.settings.walkPreset];
    state.listings.forEach((listing) => {
      const metrics = computeListingMetrics(listing, state.cores, state.anchors, radius);
      if (metrics) state.metricsByListingId[listing.id] = metrics;
    });
  };

  const persist = (): void => {
    localProjectStore.saveProject({ listings: state.listings, cores: state.cores });
    localProjectStore.saveSettings(state.settings);
  };

  const draw = (): void => {
    recomputeMetrics();
    mapView.render(visibleListings(), state.cores, state.anchors, state.settings.walkPreset);

    coreToggles.innerHTML = state.cores
      .map(
        (core) =>
          `<label><input type="checkbox" data-core="${core.id}" ${core.enabled ? 'checked' : ''}/> ${core.name}</label>`,
      )
      .join('');

    listingList.innerHTML = visibleListings()
      .map(
        (listing) => `<div class="listing-item">
        <button data-select="${listing.id}">${listing.address}</button>
        <button data-fav="${listing.id}">${listing.favorite ? '★' : '☆'}</button>
        <button data-dismiss="${listing.id}">${listing.dismissed ? 'Undismiss' : 'Dismiss'}</button>
      </div>`,
      )
      .join('');

    warningsEl.innerHTML = state.warnings.map((w) => `<li>${w}</li>`).join('');

    const selected = state.listings.find((l) => l.id === state.selectedListingId) ?? null;
    const metrics = selected ? state.metricsByListingId[selected.id] ?? null : null;
    renderListingDetails(detailsEl, selected, metrics, state.cores, state.anchors);

    persist();
  };

  const importListings = (rows: Listing[], warnings: string[]): void => {
    const byId = new Map(state.listings.map((l) => [l.id, l]));
    rows.forEach((next) => {
      const prev = byId.get(next.id);
      if (prev) {
        next.favorite = prev.favorite;
        next.dismissed = prev.dismissed;
      }
      byId.set(next.id, next);
    });
    state.listings = [...byId.values()];
    state.warnings = warnings;
    draw();
  };

  (root.querySelector('#csvFile') as HTMLInputElement).addEventListener('change', async (event) => {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    const parsed = parseListingCsv(await file.text());
    importListings(parsed.listings, parsed.warnings);
  });

  (root.querySelector('#loadExample') as HTMLButtonElement).addEventListener('click', async () => {
    const response = await fetch('./home-shopper-example-listings.csv');
    const text = await response.text();
    const parsed = parseListingCsv(text);
    importListings(parsed.listings, parsed.warnings);
  });

  (root.querySelector('#importPaste') as HTMLButtonElement).addEventListener('click', () => {
    const input = (root.querySelector('#pasteArea') as HTMLTextAreaElement).value;
    const parsed = parsePastedInput(input);
    importListings(parsed.listings, parsed.warnings);
  });

  (root.querySelector('#clearProject') as HTMLButtonElement).addEventListener('click', () => {
    state.listings = [];
    state.selectedListingId = null;
    state.warnings = [];
    localProjectStore.clearProject();
    draw();
  });

  (root.querySelector('#geocodeMissing') as HTMLButtonElement).addEventListener('click', async () => {
    for (const listing of state.listings) {
      if (listing.lat !== null && listing.lng !== null) continue;
      const result = await geocoder.geocode(listing.address);
      if (result) {
        listing.lat = result.lat;
        listing.lng = result.lng;
      } else {
        state.warnings.push(`Could not geocode: ${listing.address}`);
      }
    }
    draw();
  });

  root.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === 'walkPreset') {
      state.settings.walkPreset = Number(target.value) as WalkPreset;
      draw();
    }
    if (target.id === 'favoritesOnly') {
      state.settings.favoritesOnly = target.checked;
      draw();
    }
    if (target.id === 'hideDismissed') {
      state.settings.hideDismissed = target.checked;
      draw();
    }
    if (target.dataset.core) {
      const core = state.cores.find((c) => c.id === target.dataset.core);
      if (core) {
        core.enabled = target.checked;
        draw();
      }
    }
  });

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    if (target.dataset.select) {
      state.selectedListingId = target.dataset.select;
      draw();
    }
    if (target.dataset.fav) {
      const listing = state.listings.find((l) => l.id === target.dataset.fav);
      if (listing) {
        listing.favorite = !listing.favorite;
        draw();
      }
    }
    if (target.dataset.dismiss) {
      const listing = state.listings.find((l) => l.id === target.dataset.dismiss);
      if (listing) {
        listing.dismissed = !listing.dismissed;
        draw();
      }
    }
  });

  (root.querySelector('#favoritesOnly') as HTMLInputElement).checked = state.settings.favoritesOnly;
  (root.querySelector('#hideDismissed') as HTMLInputElement).checked = state.settings.hideDismissed;
  const selectedPreset = root.querySelector(`input[name="walkPreset"][value="${state.settings.walkPreset}"]`) as HTMLInputElement;
  if (selectedPreset) selectedPreset.checked = true;

  draw();
}
