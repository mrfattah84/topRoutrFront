import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { selectFocus, selectPoints, selectRoutes, setFocus } from "./mapSlice";

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const prevViewState = useRef<{
    center: maplibregl.LngLat;
    zoom: number;
  } | null>(null);
  const dispatch = useDispatch();
  // Selectors
  const points = useSelector(selectPoints);
  const routes = useSelector(selectRoutes);
  const focus = useSelector(selectFocus);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // wait for map and container

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current!,
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

    mapInstance.addControl(new maplibregl.NavigationControl(), "top-left");
    map.current = mapInstance;
  }, []);

  // --- SYNC POINTS (Markers) ---
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

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
        .addTo(mapInstance);
      marker.getElement().addEventListener("click", () => {
        dispatch(
          setFocus({
            id: p.id,
            center: p.coords,
            zoom: 15,
          })
        );
      });
      markersRef.current.push(marker);
      bounds.extend(p.coords);
    });

    // Only fit bounds if we have points and NO routes (routes usually take priority)
    if (points.length > 0 && (!routes || routes.length === 0)) {
      mapInstance.fitBounds(bounds, { padding: 70, maxZoom: 12 });
    }
  }, [points, routes]);

  // --- SYNC ROUTES (Lines) ---
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // 1. Clean up OLD routes that are no longer in the Redux store
    // Get all current style layers
    const style = mapInstance.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith("route-layer-")) {
          const routeId = layer.id.replace("route-layer-", "");
          // If this ID is not in the new props, remove it
          if (!routes.find((r) => r.id === routeId)) {
            mapInstance.removeLayer(layer.id);
            if (mapInstance.getSource(`route-${routeId}`)) {
              mapInstance.removeSource(`route-${routeId}`);
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

      if (route.coordinates.length === 0) return;

      // Extend bounds to include this route
      route.coordinates.forEach((coord) => bounds.extend(coord));
      hasValidCoords = true;

      // If Source exists, update data; else add Source
      const geoJsonData = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route.coordinates,
        },
      };

      if (mapInstance.getSource(sourceId)) {
        (mapInstance.getSource(sourceId) as maplibregl.GeoJSONSource).setData(
          geoJsonData as GeoJSON.Feature
        );
      } else {
        mapInstance.addSource(sourceId, {
          type: "geojson",
          data: geoJsonData as GeoJSON.Feature,
        });
      }

      // If Layer doesn't exist, add it
      if (!mapInstance.getLayer(layerId)) {
        mapInstance.addLayer({
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
      mapInstance.fitBounds(bounds, { padding: 50 });
    }
  }, [routes]);

  // --- HANDLE FOCUS ---
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // If a new focus is set
    if (focus?.id) {
      // Save the current view state only if we don't already have a "return" state saved.
      // This ensures we save the state from *before* the first focus action.
      if (!prevViewState.current) {
        prevViewState.current = {
          center: mapInstance.getCenter(),
          zoom: mapInstance.getZoom(),
        };
      }

      // Animate to the focused item's location
      mapInstance.flyTo({
        center: focus.center,
        zoom: focus.zoom || 15, // Use a default zoom if not provided
        speed: 1.2,
      });
    } else {
      // If focus is cleared, return to the previously saved view state
      if (prevViewState.current) {
        mapInstance.flyTo({
          ...prevViewState.current,
          speed: 1.2,
        });
        // Clear the saved state so it can be set again on the next focus
        prevViewState.current = null;
      }
    }
  }, [focus]);

  return <div ref={mapContainer} className="w-full h-full"></div>;
};

export default MapComponent;
