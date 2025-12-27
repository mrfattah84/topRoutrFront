export function decodePolyline6(
  encoded: string
): Array<{ lng: number; lat: number }> {
  const coordinates: Array<{ lng: number; lat: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    // --- AUTO-PRECISION LOGIC ---
    // If dividing by 1e6 results in 3.5, but Tehran is at 35.x,
    // it means the source was actually precision 1e5.

    // We try 1e6 first
    let finalLat = lat / 1e6;
    let finalLng = lng / 1e6;

    // Validation: Most populated areas in Iran (where your map is centered)
    // are within latitudes 25-40. If we get 3.5, we multiply by 10.
    if (Math.abs(finalLat) < 10 && Math.abs(finalLat) > 0) {
      finalLat = lat / 1e5;
      finalLng = lng / 1e5;
    }

    coordinates.push({
      lng: finalLng,
      lat: finalLat,
    });
  }

  return coordinates;
}
