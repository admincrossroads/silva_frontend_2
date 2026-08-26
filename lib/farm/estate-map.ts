/** Resolve approximate map coordinates for a farm estate from name/location text. */

export type EstateMapPoint = {
  lat: number;
  lng: number;
  zoom: number;
  label: string;
};

const PLACE_COORDS: Array<{ match: RegExp; lat: number; lng: number; zoom: number }> = [
  { match: /shecha/i, lat: 7.247, lng: 36.241, zoom: 12 },
  { match: /kaffa|kafa/i, lat: 7.25, lng: 36.23, zoom: 11 },
  { match: /jimma/i, lat: 7.673, lng: 36.834, zoom: 11 },
  { match: /sidama|yirgacheffe/i, lat: 6.308, lng: 38.338, zoom: 11 },
  { match: /addis/i, lat: 9.03, lng: 38.74, zoom: 10 },
  { match: /ethiopia/i, lat: 9.145, lng: 40.489, zoom: 6 },
];

const LAT_LNG = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/;

export function parseEstateCoordinates(
  location?: string | null,
  name?: string | null,
): EstateMapPoint | null {
  const raw = String(location || "").trim();
  if (raw) {
    const direct = raw.match(LAT_LNG);
    if (direct) {
      const lat = Number(direct[1]);
      const lng = Number(direct[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng, zoom: 13, label: name || raw };
      }
    }
  }

  const haystack = `${name || ""} ${location || ""}`.trim();
  if (!haystack) return null;

  for (const place of PLACE_COORDS) {
    if (place.match.test(haystack)) {
      return {
        lat: place.lat,
        lng: place.lng,
        zoom: place.zoom,
        label: name || location || "Farm estate",
      };
    }
  }

  // Default coffee belt southwest Ethiopia when only a vague estate exists
  if (name || location) {
    return { lat: 7.25, lng: 36.23, zoom: 9, label: name || location || "Farm estate" };
  }
  return null;
}

export function openStreetMapEmbedUrl(point: EstateMapPoint) {
  const delta = 0.08 / Math.max(point.zoom / 10, 1);
  const minLng = point.lng - delta;
  const minLat = point.lat - delta;
  const maxLng = point.lng + delta;
  const maxLat = point.lat + delta;
  const bbox = [minLng, minLat, maxLng, maxLat].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${point.lat}%2C${point.lng}`;
}

export function openStreetMapLink(point: EstateMapPoint) {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=${point.zoom}/${point.lat}/${point.lng}`;
}
