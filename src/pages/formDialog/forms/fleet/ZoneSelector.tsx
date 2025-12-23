import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Form } from "antd";
import { useGetZonesQuery } from "./fleetApi"; // Update this path to your RTK Query API file

const ZoneSelector = ({ form }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedZones, setSelectedZones] = useState([]);
  const { data, isLoading, error } = useGetZonesQuery();

  // Update form field when selectedZones changes
  useEffect(() => {
    if (form) {
      form.setFieldsValue({ service_area: selectedZones });
    }
  }, [selectedZones, form]);

  // Initialize selectedZones from form value
  useEffect(() => {
    if (form) {
      const initialValue = form.getFieldValue("service_area");
      if (initialValue && Array.isArray(initialValue)) {
        setSelectedZones(initialValue);
      }
    }
  }, [form]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [51.42, 35.8],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !data || isLoading) return;

    map.current.on("load", () => {
      // Add zones source
      if (!map.current.getSource("zones")) {
        map.current.addSource("zones", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: data.map((zone) => ({
              type: "Feature",
              id: zone.id,
              properties: {
                id: zone.id,
                title: zone.title,
              },
              geometry: {
                type: "Polygon",
                coordinates: [zone.coordinates],
              },
            })),
          },
        });

        // Add fill layer
        map.current.addLayer({
          id: "zones-fill",
          type: "fill",
          source: "zones",
          paint: {
            "fill-color": [
              "case",
              ["in", ["get", "id"], ["literal", selectedZones]],
              "#3b82f6",
              "#94a3b8",
            ],
            "fill-opacity": 0.5,
          },
        });

        // Add outline layer
        map.current.addLayer({
          id: "zones-outline",
          type: "line",
          source: "zones",
          paint: {
            "line-color": [
              "case",
              ["in", ["get", "id"], ["literal", selectedZones]],
              "#1d4ed8",
              "#475569",
            ],
            "line-width": 2,
          },
        });

        // Add click handler
        map.current.on("click", "zones-fill", (e) => {
          if (e.features.length > 0) {
            const zoneId = e.features[0].properties.id;
            setSelectedZones((prev) => {
              if (prev.includes(zoneId)) {
                return prev.filter((id) => id !== zoneId);
              } else {
                return [...prev, zoneId];
              }
            });
          }
        });

        // Change cursor on hover
        map.current.on("mouseenter", "zones-fill", () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "zones-fill", () => {
          map.current.getCanvas().style.cursor = "";
        });

        // Fit bounds to show all zones
        if (data.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          data.forEach((zone) => {
            zone.coordinates.forEach((coord) => {
              bounds.extend(coord);
            });
          });
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    });
  }, [data, isLoading]);

  // Update zone colors when selection changes
  useEffect(() => {
    if (map.current && map.current.getLayer("zones-fill")) {
      map.current.setPaintProperty("zones-fill", "fill-color", [
        "case",
        ["in", ["get", "id"], ["literal", selectedZones]],
        "#3b82f6",
        "#94a3b8",
      ]);
      map.current.setPaintProperty("zones-outline", "line-color", [
        "case",
        ["in", ["get", "id"], ["literal", selectedZones]],
        "#1d4ed8",
        "#475569",
      ]);
    }
  }, [selectedZones]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading zones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Error loading zones: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80">
      <Form.Item name="service_area" hidden>
        <input />
      </Form.Item>

      <div ref={mapContainer} className="w-full h-full" />

      {selectedZones.length > 0 && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold mb-2">
            Selected Zones ({selectedZones.length}):
          </h3>
          <div className="space-y-1">
            {selectedZones.map((zoneId) => {
              const zone = data.find((z) => z.id === zoneId);
              return (
                <div
                  key={zoneId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{zone?.title || zoneId}</span>
                  <button
                    onClick={() =>
                      setSelectedZones((prev) =>
                        prev.filter((id) => id !== zoneId)
                      )
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setSelectedZones([])}
            className="mt-3 w-full px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ZoneSelector;
