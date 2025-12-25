import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { selectPoints, selectRoutes } from "./mapSlice";

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const activeRouteIds = useRef(new Set()); // Keep track of layers added to the map
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
      center: [51.3755, 35.7448],
      zoom: 10,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  // --- SYNC POINTS ---
  useEffect(() => {
    if (!map.current) return;

    // 1. ALWAYS clear old markers first (even if points.length is 0)
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (points.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    points.forEach((p) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<strong>${p.name}</strong><p>${p.description}</p>`
      );

      const marker = new maplibregl.Marker({ color: "#3FB1CE" })
        .setLngLat(p.coords)
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
      bounds.extend(p.coords);
    });

    map.current.fitBounds(bounds, { padding: 70, maxZoom: 12 });
  }, [points]);

  // --- SYNC ROUTES ---
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const updateRoutes = () => {
      if (!mapInstance.isStyleLoaded()) return;

      // 1. Identify routes to remove (those on map but not in Redux)
      const currentRouteIdsInRedux = new Set(
        routes.map((r) => r.id.toString())
      );

      activeRouteIds.current.forEach((id) => {
        if (!currentRouteIdsInRedux.has(id)) {
          if (mapInstance.getLayer(`layer-${id}`))
            mapInstance.removeLayer(`layer-${id}`);
          if (mapInstance.getSource(`source-${id}`))
            mapInstance.removeSource(`source-${id}`);
          activeRouteIds.current.delete(id);
        }
      });

      // 2. Add or Update routes
      routes.forEach((route) => {
        const id = route.id.toString();
        const sourceId = `source-${id}`;
        const layerId = `layer-${id}`;
        const source = mapInstance.getSource(sourceId);

        const geojsonData = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: route.coordinates },
        };

        if (source) {
          source.setData(geojsonData);
        } else {
          mapInstance.addSource(sourceId, {
            type: "geojson",
            data: geojsonData,
          });
          mapInstance.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": route.color || "#ff0000",
              "line-width": 3,
              "line-opacity": 0.75,
            },
          });
          activeRouteIds.current.add(id);
        }
      });
    };

    if (mapInstance.isStyleLoaded()) {
      updateRoutes();
    } else {
      mapInstance.once("styledata", updateRoutes);
    }
  }, [routes]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default MapComponent;
