import type { Core, WalkPreset } from '../domain/types';

export const WALK_PRESET_MILES: Record<WalkPreset, number> = {
  10: 0.5,
  15: 0.75,
  20: 1.0,
};

export const DEFAULT_CORES: Core[] = [
  { id: 'downtown-mountain-view', name: 'Downtown Mountain View', lat: 37.3947, lng: -122.0782, enabled: true },
  { id: 'downtown-sunnyvale', name: 'Downtown Sunnyvale', lat: 37.3784, lng: -122.03, enabled: true },
  { id: 'downtown-campbell', name: 'Downtown Campbell', lat: 37.2872, lng: -121.9499, enabled: true },
];
