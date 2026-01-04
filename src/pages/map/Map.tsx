import React, { useDebugValue, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { selectPoints, selectRoutes, setFocus } from "./mapSlice";

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const dispatch = useDispatch();
  // Selectors
  const points = useSelector(selectPoints);
  const routes = useSelector(selectRoutes);

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm-raster-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-raster-layer",
            type: "raster",
            source: "osm-raster-tiles",
          },
        ],
      },
      center: [51.3755, 35.7448], // Default center
      zoom: 10,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-left");
  }, []);

  // --- SYNC POINTS (Markers) ---
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!points || points.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    points.forEach((p) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<strong>${p.name}</strong><p>${p.description || ""}</p>`
      );

      const marker = new maplibregl.Marker({ color: p.color })
        .setLngLat(p.coords) // Expecting [lng, lat] or {lng, lat}
        .setPopup(popup)
        .addTo(map.current);
      marker.getElement().addEventListener("click", () => {
        dispatch(setFocus(p.id || ""));
      });
      markersRef.current.push(marker);
      bounds.extend(p.coords);
    });

    // Only fit bounds if we have points and NO routes (routes usually take priority)
    if (points.length > 0 && (!routes || routes.length === 0)) {
      map.current.fitBounds(bounds, { padding: 70, maxZoom: 12 });
    }
  }, [points, routes]);

  // --- SYNC ROUTES (Lines) ---
  useEffect(() => {
    if (!map.current) return;

    // 1. Clean up OLD routes that are no longer in the Redux store
    // Get all current style layers
    const style = map.current.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith("route-layer-")) {
          const routeId = layer.id.replace("route-layer-", "");
          // If this ID is not in the new props, remove it
          if (!routes.find((r) => r.id === routeId)) {
            map.current.removeLayer(layer.id);
            if (map.current.getSource(`route-${routeId}`)) {
              map.current.removeSource(`route-${routeId}`);
            }
          }
        }
      });
    }

    if (!routes || routes.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    let hasValidCoords = false;

    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      // Ensure coords are [lng, lat] arrays for GeoJSON
      const formattedCoords = route.coordinates.map((c) => {
        const lng = typeof c.lng === "number" ? c.lng : c[0];
        const lat = typeof c.lat === "number" ? c.lat : c[1];
        return [lng, lat];
      });

      if (formattedCoords.length === 0) return;

      // Extend bounds to include this route
      formattedCoords.forEach((coord) => bounds.extend(coord));
      hasValidCoords = true;

      // If Source exists, update data; else add Source
      const geoJsonData = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: formattedCoords,
        },
      };

      if (map.current.getSource(sourceId)) {
        map.current.getSource(sourceId).setData(geoJsonData);
      } else {
        map.current.addSource(sourceId, {
          type: "geojson",
          data: geoJsonData,
        });
      }

      // If Layer doesn't exist, add it
      if (!map.current.getLayer(layerId)) {
        map.current.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": route.color || "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });
      }
    });

    // 2. Zoom map to show the new route(s)
    if (hasValidCoords) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [routes]);

  return <div ref={mapContainer} className="w-full h-full"></div>;
};

export default MapComponent;
