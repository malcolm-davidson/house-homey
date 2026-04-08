import { DEFAULT_ANCHORS } from '../data/anchors';
import { DEFAULT_CORES } from '../data/cores';
import type { Anchor, AppSettings, Core, Listing, ListingMetrics, WalkPreset } from '../domain/types';

export interface AppState {
  listings: Listing[];
  metricsByListingId: Record<string, ListingMetrics>;
  cores: Core[];
  anchors: Anchor[];
  settings: AppSettings;
  selectedListingId: string | null;
  warnings: string[];
}

export const defaultSettings: AppSettings = {
  walkPreset: 15,
  hideDismissed: true,
  favoritesOnly: false,
};

export const initialState = (): AppState => ({
  listings: [],
  metricsByListingId: {},
  cores: DEFAULT_CORES.map((core) => ({ ...core })),
  anchors: DEFAULT_ANCHORS,
  settings: { ...defaultSettings },
  selectedListingId: null,
  warnings: [],
});

export const setWalkPreset = (state: AppState, walkPreset: WalkPreset): void => {
  state.settings.walkPreset = walkPreset;
};
