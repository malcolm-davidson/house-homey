import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WALK_PRESET_MILES } from '../data/cores';
import type { Anchor, Core, Listing, WalkPreset } from '../domain/types';

export interface MapSelectionHandlers {
  onSelectListing: (listingId: string) => void;
}

export class MapView {
  private readonly map: L.Map;
  private listingLayer = L.layerGroup();
  private coreLayer = L.layerGroup();
  private circleLayer = L.layerGroup();
  private anchorLayer = L.layerGroup();

  constructor(container: HTMLElement, private readonly handlers: MapSelectionHandlers) {
    this.map = L.map(container).setView([37.37, -122.03], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.listingLayer.addTo(this.map);
    this.coreLayer.addTo(this.map);
    this.circleLayer.addTo(this.map);
    this.anchorLayer.addTo(this.map);
  }

  render(listings: Listing[], cores: Core[], anchors: Anchor[], walkPreset: WalkPreset): void {
    this.listingLayer.clearLayers();
    this.coreLayer.clearLayers();
    this.circleLayer.clearLayers();
    this.anchorLayer.clearLayers();

    const radiusMeters = WALK_PRESET_MILES[walkPreset] * 1609.34;
    const bounds = L.latLngBounds([]);

    listings.forEach((listing) => {
      if (listing.lat === null || listing.lng === null) return;
      const marker = L.circleMarker([listing.lat, listing.lng], {
        color: listing.dismissed ? '#777' : listing.favorite ? '#c026d3' : '#2563eb',
        radius: 7,
      }).addTo(this.listingLayer);
      marker.bindPopup(`<strong>${listing.address}</strong>`);
      marker.on('click', () => this.handlers.onSelectListing(listing.id));
      bounds.extend([listing.lat, listing.lng]);
    });

    cores.forEach((core) => {
      const marker = L.circleMarker([core.lat, core.lng], { color: '#f97316', radius: 6, fillOpacity: 0.8 }).addTo(
        this.coreLayer,
      );
      marker.bindPopup(core.name);
      bounds.extend([core.lat, core.lng]);
      if (core.enabled) {
        L.circle([core.lat, core.lng], {
          radius: radiusMeters,
          color: '#f97316',
          fillColor: '#fdba74',
          fillOpacity: 0.2,
          weight: 1,
        }).addTo(this.circleLayer);
      }
    });

    anchors.forEach((anchor) => {
      const marker = L.circleMarker([anchor.lat, anchor.lng], { color: '#14b8a6', radius: 6 }).addTo(this.anchorLayer);
      marker.bindPopup(anchor.name);
      bounds.extend([anchor.lat, anchor.lng]);
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds.pad(0.15));
    }
  }
}
