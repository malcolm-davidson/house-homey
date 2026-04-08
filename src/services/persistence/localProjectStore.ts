import type { AppSettings, Core, GeocodeResult, Listing } from '../../domain/types';

export const STORAGE_KEYS = {
  project: 'home-shopper:v1:project',
  geocodeCache: 'home-shopper:v1:geocode-cache',
  settings: 'home-shopper:v1:settings',
};

export interface StoredProject {
  listings: Listing[];
  cores: Core[];
}

const safeRead = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op for quota/privacy modes
  }
};

export const localProjectStore = {
  loadProject(): StoredProject | null {
    return safeRead<StoredProject | null>(STORAGE_KEYS.project, null);
  },
  saveProject(project: StoredProject): void {
    safeWrite(STORAGE_KEYS.project, project);
  },
  clearProject(): void {
    localStorage.removeItem(STORAGE_KEYS.project);
  },
  loadSettings(defaults: AppSettings): AppSettings {
    return { ...defaults, ...safeRead<AppSettings>(STORAGE_KEYS.settings, defaults) };
  },
  saveSettings(settings: AppSettings): void {
    safeWrite(STORAGE_KEYS.settings, settings);
  },
  loadGeocodeCache(): Record<string, GeocodeResult> {
    return safeRead<Record<string, GeocodeResult>>(STORAGE_KEYS.geocodeCache, {});
  },
  saveGeocodeCache(cache: Record<string, GeocodeResult>): void {
    safeWrite(STORAGE_KEYS.geocodeCache, cache);
  },
  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
