import { useMemo, useState } from "react";
import { getVehicleColors } from "../utils/vehicleColors";

// Helper function to format distance
const formatDistance = (meters) => {
  if (!meters || meters === 0) return "0 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

// Helper function to format duration
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Icon components (simple SVG icons)
const TruckIcon = ({ size = 20, color = "#0A214A" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
      fill={color}
    />
  </svg>
);

const RouteIcon = ({ size = 18, color = "#14b8a6" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill={color}
    />
  </svg>
);

const ClockIcon = ({ size = 16, color = "#666" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill={color}
    />
  </svg>
);

const DistanceIcon = ({ size = 16, color = "#666" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill={color}
    />
  </svg>
);

const PackageIcon = ({ size = 16, color = "#666" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
    />
  </svg>
);

// Simple presentation component to display optimization scenarios and results
export default function OptimizationResultPanel({
  resultData,
  defaultScenario = "economy",
  onShowRoute,
  vehicleNames = {},
}) {
  const scenarios = [
    { id: "economy", label: "Economy" },
    { id: "agile", label: "Agile" },
    { id: "trade_off", label: "Trade off" },
  ];

  const [selectedScenario, setSelectedScenario] = useState(
    defaultScenario || "economy"
  );

  const vehicles = useMemo(() => {
    const routes = resultData?.routes || {};
    const solution = resultData?.solution || {};
    return Object.keys(solution).map((vehicleId) => {
      const route = routes[vehicleId] || {};
      return {
        id: vehicleId,
        name: vehicleNames[vehicleId] || vehicleId,
        orders: solution[vehicleId] || [],
        distance: route.distance_m || 0,
        duration: route.duration_s || 0,
        service: route.service_s || 0,
        waiting: route.waiting_time || route.waiting || 0,
        load: route.load || {},
        cost: route.cost || 0,
        steps: route.steps || [],
        orderedLocationIds: route.ordered_location_ids || [],
      };
    });
  }, [resultData, vehicleNames]);

  const summary = resultData?.summary || {};
  const routesCount = summary.vehicles_used || vehicles.length || 0;

  const renderScenarioCard = (scenario) => {
    const isActive = selectedScenario === scenario.id;
    const scenarioColors = {
      economy: { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" },
      agile: { bg: "#eff6ff", border: "#3b82f6", text: "#2563eb" },
      trade_off: { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
    };
    const colors = scenarioColors[scenario.id] || scenarioColors.economy;

    return (
      <div
        key={scenario.id}
        style={{
          background: isActive ? colors.bg : "#fff",
          borderRadius: "16px",
          padding: "16px 18px",
          boxShadow: isActive
            ? `0 4px 20px ${colors.border}40`
            : "0 2px 8px rgba(0,0,0,0.06)",
          border: isActive ? `2px solid ${colors.border}` : "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onClick={() => setSelectedScenario(scenario.id)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: isActive ? colors.border : "#9ca3af",
              display: "inline-block",
              boxShadow: isActive ? `0 0 8px ${colors.border}60` : "none",
            }}
          />
          <div
            style={{
              fontWeight: 700,
              color: isActive ? colors.text : "#0A214A",
              fontSize: "1rem",
              letterSpacing: "0.3px",
            }}
          >
            {scenario.label}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScenario(scenario.id);
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              background: isActive ? colors.border : "#fff",
              color: isActive ? "#fff" : colors.text,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.background = colors.bg;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.background = "#fff";
              }
            }}
          >
            Details
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // Show all vehicle routes for this scenario
              if (
                onShowRoute &&
                scenario.id === selectedScenario &&
                vehicles.length > 0
              ) {
                // Show all vehicle routes
                vehicles.forEach((vehicle) => {
                  onShowRoute(vehicle.id);
                });
              }
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #36d4c0",
              background: "#fff",
              color: "#14b8a6",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f0fdfa";
              e.target.style.borderColor = "#14b8a6";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#fff";
              e.target.style.borderColor = "#36d4c0";
            }}
          >
            <RouteIcon size={16} />
            Show Route
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginTop: "16px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {scenarios.map(renderScenarioCard)}
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#fff",
              fontSize: "1.1rem",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 11l3 3L22 4l-1.5-1.5L12 10.5 8.5 7 7 8.5 9 11zm-7 9h18v-2H2v2z"
                fill="#fff"
              />
            </svg>
            Summary
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                }}
              >
                Total Orders
              </div>
              <div
                style={{ fontSize: "1.5rem", color: "#fff", fontWeight: 700 }}
              >
                {summary.total_orders || 0}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                }}
              >
                Vehicles Used
              </div>
              <div
                style={{ fontSize: "1.5rem", color: "#fff", fontWeight: 700 }}
              >
                {summary.vehicles_used || 0}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                }}
              >
                Optimized
              </div>
              <div
                style={{ fontSize: "1.5rem", color: "#fff", fontWeight: 700 }}
              >
                {summary.optimized_orders || 0}
              </div>
            </div>
            {summary.unassigned_orders !== undefined && (
              <div
                style={{
                  background:
                    summary.unassigned_orders > 0
                      ? "rgba(220, 38, 38, 0.3)"
                      : "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: 500,
                  }}
                >
                  Unassigned
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {summary.unassigned_orders || 0}
                </div>
              </div>
            )}
          </div>

          {/* Additional Summary Statistics */}
          {(summary.total_cost ||
            summary.total_service_time ||
            summary.total_waiting_time) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {summary.total_cost !== undefined && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                    }}
                  >
                    Total Cost
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {summary.total_cost.toLocaleString()}
                  </div>
                </div>
              )}
              {summary.total_service_time !== undefined && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                    }}
                  >
                    Service Time
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {formatDuration(summary.total_service_time)}
                  </div>
                </div>
              )}
              {summary.total_waiting_time !== undefined && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                    }}
                  >
                    Waiting Time
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {formatDuration(summary.total_waiting_time)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Violations */}
          {summary.violations && summary.violations.length > 0 && (
            <div
              style={{
                background: "rgba(220, 38, 38, 0.2)",
                borderRadius: "12px",
                padding: "12px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#fff",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                ⚠️ Constraint Violations: {summary.violations.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unassigned Orders List */}
      {summary.unassigned_orders_list &&
        summary.unassigned_orders_list.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #fee2e2",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.1)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#dc2626",
                fontSize: "1rem",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#dc2626"
                />
              </svg>
              Unassigned Orders ({summary.unassigned_orders_list.length})
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {summary.unassigned_orders_list.map((unassigned, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    background: "#fef2f2",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#991b1b",
                      marginBottom: "4px",
                      wordBreak: "break-all",
                    }}
                  >
                    Order ID:{" "}
                    {unassigned.order_uuid || unassigned.id || "UNKNOWN"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#7f1d1d",
                      wordBreak: "break-word",
                    }}
                  >
                    Reason:{" "}
                    <span style={{ fontWeight: 600 }}>
                      {unassigned.reason || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Route Details */}
      {vehicles.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "14px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#0A214A",
              fontSize: "1rem",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <TruckIcon size={20} />
            Route Details
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {vehicles.map((vehicle, index) => {
              const colors = getVehicleColors(index);

              return (
                <div
                  key={vehicle.id}
                  style={{
                    padding: "12px",
                    background: `linear-gradient(135deg, ${colors.secondary} 0%, #fff 100%)`,
                    borderRadius: "10px",
                    border: `1px solid ${colors.primary}30`,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "9px",
                        background: colors.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: colors.primary,
                          fontSize: "0.9rem",
                          marginBottom: "2px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <span>Vehicle {index + 1}</span>
                        <span style={{ color: "#0A214A", fontWeight: 800 }}>
                          {vehicle.name}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#6b7280",
                          fontFamily: "monospace",
                        }}
                      >
                        {vehicle.id}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#0A214A" }}>
                        Assigned customers:
                      </span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {vehicle.orders.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#0A214A" }}>
                        Assigned weight:
                      </span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {vehicle.load?.weight !== undefined
                          ? Number(vehicle.load.weight).toFixed(3)
                          : "n/a"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#0A214A" }}>
                        Assigned volume:
                      </span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {vehicle.load?.volume !== undefined
                          ? Number(vehicle.load.volume).toFixed(3)
                          : "n/a"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#0A214A" }}>
                        Vehicle capacity:
                      </span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        n/a
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <DistanceIcon size={14} color={colors.primary} />
                      <span style={{ fontWeight: 500 }}>Route distance:</span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {formatDistance(vehicle.distance)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <ClockIcon size={14} color={colors.primary} />
                      <span style={{ fontWeight: 500 }}>Travel time:</span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {formatDuration(vehicle.duration)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <ClockIcon size={14} color={colors.primary} />
                      <span style={{ fontWeight: 500 }}>Service time:</span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {formatDuration(vehicle.service)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <ClockIcon size={14} color={colors.primary} />
                      <span style={{ fontWeight: 500 }}>Waiting time:</span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {vehicle.waiting
                          ? formatDuration(vehicle.waiting)
                          : "n/a"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: "#4b5563",
                      }}
                    >
                      <ClockIcon size={14} color={colors.primary} />
                      <span style={{ fontWeight: 500 }}>Total time:</span>
                      <span style={{ fontWeight: 700, color: colors.primary }}>
                        {formatDuration(
                          (vehicle.duration || 0) +
                            (vehicle.service || 0) +
                            (vehicle.waiting || 0)
                        )}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8rem",
                      color: "#4b5563",
                      marginBottom: "12px",
                    }}
                  >
                    <PackageIcon size={14} color={colors.primary} />
                    <span style={{ fontWeight: 500 }}>Orders:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: colors.primary,
                        background: colors.secondary,
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {vehicle.orders.length}
                    </span>
                  </div>
                  {vehicle.orders.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "0.78rem",
                        color: "#374151",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#0A214A" }}>
                        Order numbers / IDs:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {vehicle.orders.slice(0, 20).map((o, i) => {
                          const ord =
                            o.order_number ||
                            o.order_id ||
                            o.uuid ||
                            (typeof o === "string" ? o : "");
                          return (
                            <span
                              key={`${vehicle.id}-ord-${i}`}
                              style={{
                                background: "#f3f4f6",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                padding: "4px 6px",
                                fontFamily: "monospace",
                                fontSize: "0.72rem",
                                color: "#111827",
                              }}
                            >
                              {ord || "—"}
                            </span>
                          );
                        })}
                        {vehicle.orders.length > 20 && (
                          <span
                            style={{ fontSize: "0.72rem", color: "#6b7280" }}
                          >
                            ...and {vehicle.orders.length - 20} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step Details */}
                  {vehicle.steps && vehicle.steps.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#6b7280",
                          marginBottom: "8px",
                        }}
                      >
                        Route Steps ({vehicle.steps.length})
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          maxHeight: "150px",
                          overflowY: "auto",
                        }}
                      >
                        {vehicle.steps.map((step, stepIndex) => (
                          <div
                            key={stepIndex}
                            style={{
                              padding: "8px",
                              background: "#fff",
                              borderRadius: "6px",
                              fontSize: "0.7rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background:
                                    step.type === "job"
                                      ? colors.secondary
                                      : "#e5e7eb",
                                  color:
                                    step.type === "job"
                                      ? colors.primary
                                      : "#6b7280",
                                  fontWeight: 600,
                                  fontSize: "0.65rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                {step.type}
                              </span>
                              {step.order_uuid && (
                                <span
                                  style={{
                                    color: "#6b7280",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {step.order_uuid.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                color: "#9ca3af",
                              }}
                            >
                              {step.service > 0 && (
                                <span title="Service time">
                                  S: {formatDuration(step.service)}
                                </span>
                              )}
                              {step.waiting_time > 0 && (
                                <span title="Waiting time">
                                  W: {formatDuration(step.waiting_time)}
                                </span>
                              )}
                              {step.distance > 0 && (
                                <span title="Distance">
                                  D: {formatDistance(step.distance)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {onShowRoute && (
                    <button
                      type="button"
                      onClick={() => onShowRoute(vehicle.id)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `2px solid ${colors.primary}`,
                        background: colors.primary,
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.color = colors.primary;
                        e.target.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.primary;
                        e.target.style.color = "#fff";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      <RouteIcon size={16} color="currentColor" />
                      Show Route on Map
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
