import { useState, useEffect } from "react";
import "../App.css";
import {
  getDefaultConfig,
  saveConfig,
  runOptimization,
  getOptimizationStatus,
} from "../api/optimization";
import { fetchOrders } from "../api/orders";
import { fetchDrivers } from "../api/drivers";
import { updateAddress } from "../api/addresses";
import OptimizationResultPanel from "./OptimizationResultPanel";
import axios from "axios";

// Helper function to format elapsed time
const formatElapsedTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Helper function to provide time estimate based on elapsed time
const getTimeEstimate = (elapsedTime) => {
  const seconds = Math.floor(elapsedTime / 1000);

  if (seconds < 30) {
    return "Optimization typically takes 30 seconds to 2 minutes...";
  } else if (seconds < 120) {
    return "Still processing... Complex optimizations can take 2-5 minutes.";
  } else if (seconds < 300) {
    return "Taking longer than usual. Large datasets may require 5-10 minutes.";
  } else {
    return "⚠️ This is taking longer than expected. Check backend logs if it exceeds 10 minutes.";
  }
};

const AddForm = () => {
  const [formData, setFormData] = useState({
    // Balance options
    no_balance: false,
    balance_order_count: false,
    balance_working_time: false,
    allow_multiple_depot_visits: false,
    depot_visit_time_default: 30,

    // Policy
    policy: "economy", // 'economy', 'agile', 'trade_off'
    show_all_scenarios: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [runStatus, setRunStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [pollingStartTime, setPollingStartTime] = useState(null);
  const [maxPollingTime] = useState(300000); // 5 minutes timeout (300000ms)
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState("economy");
  const [orderIds, setOrderIds] = useState([]);
  const [driverIds, setDriverIds] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [excludedOrders, setExcludedOrders] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState({
    current: 0,
    total: 0,
  });

  // Neshan API key for geocoding (you may want to make this configurable)
  const neshanApiKey = "service.74443e788cef4d48b5fc86111132d3f5";

  const hasValidCoords = (loc) => {
    if (!loc) return false;
    const lat = loc.latitude ?? loc.lat;
    const lng = loc.longitude ?? loc.lng;
    const hasLat = typeof lat === "number" && !Number.isNaN(lat) && lat !== 0;
    const hasLng = typeof lng === "number" && !Number.isNaN(lng) && lng !== 0;
    return hasLat && hasLng;
  };

  const isAddressVerified = (address) => {
    // Address is verified if it has valid coordinates OR verified status is 'green' or 'orange'
    if (!address) return false;
    if (hasValidCoords(address)) return true;
    // Check verified status: 'green' = verified, 'orange' = partially verified, 'red' = not verified
    return address.verified === "green" || address.verified === "orange";
  };

  const geocodeAddress = async (address) => {
    try {
      // Build full address string from description or title
      const fullAddress = address.description || address.title || "";
      if (!fullAddress) {
        console.warn(
          "[Geocoding] No address text available for geocoding:",
          address.uid
        );
        return null;
      }

      console.log("[Geocoding] Geocoding address:", fullAddress);
      const response = await axios.get("https://api.neshan.org/v6/geocoding", {
        params: { address: fullAddress },
        headers: { "Api-Key": neshanApiKey },
      });

      const { location } = response.data;
      if (location && location.x && location.y) {
        // Neshan returns x=longitude, y=latitude
        return {
          latitude: location.y,
          longitude: location.x,
        };
      }
      return null;
    } catch (error) {
      console.error(
        "[Geocoding] Failed to geocode address:",
        address.uid,
        error.message
      );
      return null;
    }
  };

  const geocodeAndUpdateAddress = async (address) => {
    try {
      const coords = await geocodeAddress(address);
      if (coords && coords.latitude && coords.longitude) {
        // Update address with ONLY coordinates (location_data) to avoid triggering
        // backend deduplication logic that may cause recursion errors
        // Don't send title/description to avoid triggering address deduplication
        const updateResult = await updateAddress(address.uid, {
          latitude: coords.latitude,
          longitude: coords.longitude,
          // Explicitly don't send title/description to avoid backend recursion issues
        });
        if (updateResult.success) {
          console.log(
            "[Geocoding] Successfully updated address:",
            address.uid,
            "with coordinates:",
            coords
          );
          return {
            ...address,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        } else {
          console.error(
            "[Geocoding] Failed to update address:",
            address.uid,
            updateResult.error
          );
          // Even if update fails, return address with coordinates for in-memory use
          return {
            ...address,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      }
      return address;
    } catch (error) {
      console.error(
        "[Geocoding] Error geocoding/updating address:",
        address.uid,
        error
      );
      // Try to get coordinates from geocoding result even if update failed
      try {
        const coords = await geocodeAddress(address);
        if (coords && coords.latitude && coords.longitude) {
          // Return address with coordinates for in-memory use, even though update failed
          return {
            ...address,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      } catch (e) {
        // Ignore
      }
      return address;
    }
  };

  // Load default configuration on mount
  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        const result = await getDefaultConfig();
        if (result.success && result.data) {
          const config = result.data;
          setFormData({
            no_balance: config.no_balance || false,
            balance_order_count: config.balance_order_count || false,
            balance_working_time: config.balance_working_time || false,
            allow_multiple_depot_visits:
              config.allow_multiple_depot_visits || false,
            depot_visit_time_default: config.depot_visit_time_default || 30,
            policy: config.policy || "economy",
            show_all_scenarios: config.show_all_scenarios || false,
          });
          if (config.id) {
            setConfigId(config.id);
          }
          setSelectedScenario(config.policy || "economy");
        } else {
          // API call failed, but continue with default values
          console.warn(
            "Failed to load default config, using defaults:",
            result.error
          );
        }
      } catch (err) {
        // Error caught, but form should still render with default values
        console.warn("Exception loading default config, using defaults:", err);
      }
    };

    loadDefaultConfig();
  }, []);

  // Poll for optimization status
  useEffect(() => {
    if (runId && isRunning) {
      console.log("Starting status polling for run ID:", runId);
      const startTime = Date.now();
      setPollingStartTime(startTime);

      const interval = setInterval(async () => {
        try {
          const elapsedTime = Date.now() - startTime;

          // Calculate time remaining until timeout
          const remaining = maxPollingTime - elapsedTime;
          setTimeRemaining(remaining > 0 ? remaining : 0);

          // Check for timeout
          if (elapsedTime > maxPollingTime) {
            console.warn(
              `Optimization polling timeout reached after ${Math.round(
                elapsedTime / 1000
              )}s (max: ${maxPollingTime / 1000}s)`
            );
            setIsRunning(false);
            clearInterval(interval);
            setPollingInterval(null);
            setPollingStartTime(null);
            setTimeRemaining(null);
            setError(
              "Optimization timeout: The process exceeded the maximum polling time (5 minutes). The optimization may still be running on the backend. Please check the backend logs or try again later."
            );
            if (onError) {
              onError({
                message: "Optimization timeout",
                timeout: true,
                elapsedTime,
              });
            }
            return;
          }

          console.log(
            `Polling optimization status for run ID: ${runId} (elapsed: ${Math.round(
              elapsedTime / 1000
            )}s)`
          );
          const result = await getOptimizationStatus(runId);
          console.log("Status poll result:", result);

          if (result.success && result.data) {
            const status = result.data.status;
            const data = result.data;
            console.log(
              `Current optimization status: ${status} (elapsed: ${Math.round(
                elapsedTime / 1000
              )}s)`
            );
            console.log("Full status data:", {
              id: data.id,
              status: data.status,
              started_at: data.started_at,
              completed_at: data.completed_at,
              error_message: data.error_message,
              task_id: data.task_id,
              result_data: data.result_data ? "Has results" : "No results yet",
              // Log the full response to see what backend is actually returning
              full_response: data,
            });

            // Check if result_data exists even when status is 'running' (might indicate completion)
            if (data.result_data && status === "running") {
              console.warn(
                '⚠️ Status is "running" but result_data exists! This might indicate the backend hasn\'t updated the status yet.'
              );
              console.log("Result data preview:", {
                has_solution: !!data.result_data.solution,
                has_summary: !!data.result_data.summary,
                solution_keys: data.result_data.solution
                  ? Object.keys(data.result_data.solution).length
                  : 0,
              });
            }
            setRunStatus(status);

            if (status === "completed" || status === "failed") {
              console.log("Optimization finished with status:", status);
              setIsRunning(false);
              clearInterval(interval);
              setPollingInterval(null);
              setPollingStartTime(null);
              setTimeRemaining(null);

              if (status === "completed") {
                setSuccess(true);
                setError(null);
                console.log(
                  "Optimization completed successfully!",
                  result.data
                );

                // Extract and log result data according to API format
                const resultData = result.data.result_data;
                if (resultData) {
                  setResultData(resultData);
                  const appliedPolicy =
                    resultData.config_applied?.policy ||
                    formData.policy ||
                    "economy";
                  setSelectedScenario(appliedPolicy);
                  console.log("Optimization result data:", {
                    status: resultData.status,
                    solution: resultData.solution
                      ? Object.keys(resultData.solution).length + " vehicles"
                      : "No solution",
                    summary: resultData.summary || "No summary",
                    config_applied:
                      resultData.config_applied || "No config info",
                  });

                  // Log detailed solution if available
                  if (resultData.solution) {
                    console.log("Solution details:", resultData.solution);
                    Object.keys(resultData.solution).forEach((vehicleId) => {
                      console.log(
                        `Vehicle ${vehicleId}: ${resultData.solution[vehicleId].length} orders`
                      );
                    });
                  }

                  // Log summary if available
                  if (resultData.summary) {
                    console.log("Optimization summary:", {
                      total_orders: resultData.summary.total_orders,
                      total_vehicles: resultData.summary.total_vehicles,
                      optimized_orders: resultData.summary.optimized_orders,
                      vehicles_used: resultData.summary.vehicles_used,
                      unassigned_orders: resultData.summary.unassigned_orders,
                    });
                  }
                } else {
                  console.warn(
                    "No result_data in completed optimization response"
                  );
                  setResultData(null);
                }

                if (onSuccess) {
                  onSuccess(result.data);
                }
              } else if (status === "failed") {
                const errorMsg =
                  result.data.error_message || "Optimization failed";
                console.error("Optimization failed:", errorMsg);
                console.error("Error details:", result.data);
                setError(errorMsg);
                setResultData(null);
                if (onError) {
                  onError(result.data);
                }
              } else {
                // Status is 'pending' or 'running' - continue polling
                console.log(`Status is '${status}', continuing to poll...`);
              }
            }
          } else {
            console.warn("Status poll returned unsuccessful result:", result);
          }
        } catch (err) {
          console.error("Failed to check optimization status:", err);
          setIsRunning(false);
          clearInterval(interval);
          setPollingInterval(null);
          setPollingStartTime(null);
          setTimeRemaining(null);
        }
      }, 2000); // Poll every 2 seconds

      setPollingInterval(interval);

      return () => {
        console.log("Cleaning up status polling interval");
        clearInterval(interval);
        setPollingStartTime(null);
        setTimeRemaining(null);
      };
    }
  }, [runId, isRunning, onSuccess, onError, maxPollingTime]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handlePolicyChange = (policy) => {
    setFormData((prev) => ({
      ...prev,
      policy,
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await saveConfig({
        ...formData,
        name: "My Balance Config",
        is_default: true,
      });

      if (result.success) {
        setSuccess(true);
        if (result.data.id) {
          setConfigId(result.data.id);
        }
        console.log("Configuration saved successfully:", result.data);
      } else {
        const errorMessage =
          result.error?.formattedMessage ||
          result.error?.messages?.join("\n") ||
          (typeof result.error === "string"
            ? result.error
            : result.error?.message || "Failed to save configuration");
        setError(errorMessage);
        console.error("Config save failed:", result.error);
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      console.error("Config save exception:", err);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunOptimization = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setRunStatus(null);
    setResultData(null);
    setSelectedScenario(formData.policy || "economy");

    try {
      // Fetch all orders for this user (backend should filter by user; otherwise we take all)
      const ordersResponse = await fetchOrders();
      let allOrderIds = [];
      let startDate = null;
      let endDate = null;
      let invalidOrders = [];
      if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
        // First pass: identify orders that need geocoding
        const ordersWithAddresses = ordersResponse.data.map((o) => ({
          order: o,
          id: o.id || o.uuid,
          source: o.source || {},
          destination: o.destination || {},
        }));

        // Find addresses that need geocoding (missing coordinates or not verified - verified status is 'red' or null)
        const addressesToGeocode = [];
        ordersWithAddresses.forEach(({ order, source, destination }) => {
          // Check source address - geocode if coordinates are missing OR if verified status is 'red' or null
          if (source.uid) {
            const needsGeocoding =
              !hasValidCoords(source) ||
              !source.verified ||
              source.verified === "red";
            if (
              needsGeocoding &&
              !addressesToGeocode.find((a) => a.uid === source.uid)
            ) {
              addressesToGeocode.push(source);
            }
          }
          // Check destination address - geocode if coordinates are missing OR if verified status is 'red' or null
          if (destination.uid) {
            const needsGeocoding =
              !hasValidCoords(destination) ||
              !destination.verified ||
              destination.verified === "red";
            if (
              needsGeocoding &&
              !addressesToGeocode.find((a) => a.uid === destination.uid)
            ) {
              addressesToGeocode.push(destination);
            }
          }
        });

        // Geocode addresses that need it
        if (addressesToGeocode.length > 0) {
          setIsGeocoding(true);
          setGeocodingProgress({
            current: 0,
            total: addressesToGeocode.length,
          });
          console.log(
            `[Geocoding] Found ${addressesToGeocode.length} addresses to geocode`
          );

          // Geocode addresses sequentially to avoid rate limits
          // Store geocoded addresses in memory for optimization (backend updates may fail due to recursion error)
          const geocodedAddressesMap = new Map();
          let successfulGeocodes = 0;
          let failedGeocodes = 0;
          for (let i = 0; i < addressesToGeocode.length; i++) {
            const address = addressesToGeocode[i];
            setGeocodingProgress({
              current: i + 1,
              total: addressesToGeocode.length,
            });
            try {
              const updated = await geocodeAndUpdateAddress(address);
              if (updated && hasValidCoords(updated)) {
                successfulGeocodes++;
              } else {
                failedGeocodes++;
              }
            } catch (err) {
              console.error(
                "[Geocoding] Error processing address:",
                address.uid,
                err
              );
              failedGeocodes++;
            }
            // Small delay to avoid rate limiting (increased to 200ms for better stability)
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          console.log(
            `[Geocoding] Completed: ${successfulGeocodes} successful, ${failedGeocodes} failed out of ${addressesToGeocode.length} total`
          );

          setIsGeocoding(false);
          console.log(
            `[Geocoding] Completed geocoding ${addressesToGeocode.length} addresses`
          );

          // Re-fetch orders to get updated coordinates
          const updatedOrdersResponse = await fetchOrders();
          if (
            updatedOrdersResponse.success &&
            Array.isArray(updatedOrdersResponse.data)
          ) {
            ordersResponse.data = updatedOrdersResponse.data;
          }
        }

        // Now process orders with updated/geocoded addresses
        const parsed = ordersResponse.data
          .map((o) => {
            const id = o.id || o.uuid;
            const orderDate =
              o.order_date || o.orderDate || o.delivery_date || o.deliveryDate;
            let normalizedDate = null;
            if (orderDate) {
              const d = new Date(orderDate);
              if (!isNaN(d.getTime())) {
                normalizedDate = d.toISOString().slice(0, 10);
              }
            }
            const source = o.source || {};
            const destination = o.destination || {};
            const validSource = hasValidCoords(source);
            const validDest = hasValidCoords(destination);
            let reason = "";
            if (!validSource || !validDest) {
              reason = `Missing coords: ${!validSource ? "source" : ""}${
                !validSource && !validDest ? " & " : ""
              }${!validDest ? "destination" : ""}`;
            }
            return {
              id,
              title: o.title || o.order_id || id,
              date: normalizedDate,
              valid: validSource && validDest,
              reason,
            };
          })
          .filter((o) => !!o.id);

        const validOrders = parsed.filter((o) => o.valid);
        invalidOrders = parsed.filter((o) => !o.valid);
        allOrderIds = validOrders.map((o) => o.id);

        const validDates = validOrders
          .map((o) => o.date)
          .filter(Boolean)
          .sort();
        if (validDates.length > 0) {
          startDate = validDates[0];
          endDate = validDates[validDates.length - 1];
        }

        // Log detailed information about order filtering
        console.log(`[Optimization] Order filtering results:`, {
          total: parsed.length,
          valid: validOrders.length,
          invalid: invalidOrders.length,
          validOrderIds: allOrderIds,
          invalidReasons: invalidOrders.reduce((acc, o) => {
            acc[o.reason] = (acc[o.reason] || 0) + 1;
            return acc;
          }, {}),
        });

        if (allOrderIds.length === 0) {
          console.warn(
            "No orders with valid coordinates found; optimization may fail"
          );
        } else if (invalidOrders.length > 0) {
          console.warn(
            `[Optimization] ${invalidOrders.length} orders excluded due to missing coordinates. Only ${validOrders.length} orders will be optimized.`
          );
        }
      } else {
        console.warn(
          "Could not fetch orders; proceeding without order IDs",
          ordersResponse.error
        );
      }
      setOrderIds(allOrderIds);
      setDateRange({ start: startDate, end: endDate });
      setExcludedOrders(invalidOrders);

      if (allOrderIds.length === 0) {
        setError(
          "No orders with valid locations to optimize. Please create orders with both source and destination coordinates, then try again."
        );
        return;
      }

      // Fetch all drivers for this user (backend should filter by user; otherwise we take all)
      const driversResponse = await fetchDrivers();
      let allDriverIds = [];
      let driversWithVehicles = [];
      if (driversResponse.success && Array.isArray(driversResponse.data)) {
        const allDrivers = driversResponse.data;
        allDriverIds = allDrivers.map((d) => d.id || d.uuid).filter(Boolean);
        driversWithVehicles = allDrivers.filter(
          (d) => d.vehicle || d.vehicle_id || d.vehicleId
        );
      } else {
        console.warn(
          "Could not fetch drivers; proceeding without driver IDs",
          driversResponse.error
        );
      }
      setDriverIds(allDriverIds);

      if (allDriverIds.length === 0) {
        setError(
          "No drivers available to optimize. Please create or select drivers, then try again."
        );
        return;
      }

      const driverIdsWithVehicles = driversWithVehicles
        .map((d) => d.id || d.uuid)
        .filter(Boolean);
      if (driverIdsWithVehicles.length === 0) {
        setError(
          "No drivers with vehicles found. Please assign a vehicle to at least one driver, then try again."
        );
        return;
      }

      setIsRunning(true);

      // First save the configuration
      const saveResult = await saveConfig({
        ...formData,
        name: "My Balance Config",
        is_default: true,
      });

      let configIdToUse = configId;
      if (saveResult.success && saveResult.data.id) {
        configIdToUse = saveResult.data.id;
        setConfigId(configIdToUse);
      }

      // Then run optimization with the config
      const runResult = await runOptimization({
        config_id: configIdToUse,
        driver_ids: driverIdsWithVehicles, // only drivers that have vehicles assigned
        order_ids: allOrderIds, // all orders returned for this user
        run_async: true,
        date_range_start: dateRange.start,
        date_range_end: dateRange.end,
        // Also include inline settings as fallback
        balance_order_count: formData.balance_order_count,
        balance_working_time: formData.balance_working_time,
        allow_multiple_depot_visits: formData.allow_multiple_depot_visits,
        depot_visit_time_default: formData.depot_visit_time_default,
        policy: formData.policy,
      });

      console.log("Optimization run result:", runResult);

      if (runResult.success) {
        console.log(
          "Optimization run successful, response data:",
          runResult.data
        );
        if (runResult.data?.id) {
          console.log("Setting run ID:", runResult.data.id);
          setRunId(runResult.data.id);
          setRunStatus(runResult.data.status || "pending");
        } else if (runResult.data?.run_id) {
          // Some APIs might return run_id instead of id
          console.log("Setting run ID (from run_id):", runResult.data.run_id);
          setRunId(runResult.data.run_id);
          setRunStatus(runResult.data.status || "pending");
        } else {
          // If not async, result is immediate
          console.log("Optimization completed immediately (not async)");
          setSuccess(true);
          setIsRunning(false);
          if (onSuccess) {
            onSuccess(runResult.data);
          }
        }
      } else {
        const errorMessage =
          runResult.error?.formattedMessage ||
          runResult.error?.messages?.join("\n") ||
          (typeof runResult.error === "string"
            ? runResult.error
            : runResult.error?.message || "Failed to run optimization");
        setError(errorMessage);
        setIsRunning(false);
        console.error("Optimization run failed:", runResult.error);
        if (onError) {
          onError(runResult.error);
        }
      }
    } catch (err) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      setIsRunning(false);
      console.error("Optimization run exception:", err);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        borderRadius: "34px",
        padding: "2rem",
        boxShadow: "0 32px 80px rgba(13, 28, 59, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#0A214A",
            letterSpacing: "-0.01em",
          }}
        >
          Balance & Policy Configuration
        </h2>
      </div>

      <form
        onSubmit={handleRunOptimization}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "1.5rem",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {success && !isRunning && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#efe",
              color: "#3c3",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          >
            {runStatus === "completed"
              ? "Optimization completed successfully!"
              : "Configuration saved successfully!"}
          </div>
        )}

        {isGeocoding && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderRadius: "8px",
              fontSize: "0.9rem",
              border: "1px solid #ffeeba",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "2px solid #856404",
                  borderTopColor: "transparent",
                  animation: "spin 1s linear infinite",
                }}
              />
              <strong>Geocoding addresses...</strong>
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              Geocoding {geocodingProgress.current} of {geocodingProgress.total}{" "}
              addresses that need coordinates. This may take a moment...
            </div>
          </div>
        )}

        {isRunning && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "#e8f4f8",
              color: "#0A214A",
              borderRadius: "8px",
              fontSize: "0.9rem",
              border: "1px solid #36d4c0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#36d4c0",
                  animation: "pulse 2s infinite",
                }}
              ></div>
              <div>
                <strong>
                  Optimization Status: {runStatus || "Starting..."}
                </strong>
              </div>
            </div>
            {pollingStartTime && (
              <div
                style={{
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                  color: "#666",
                }}
              >
                <div>
                  ⏱️ Running for:{" "}
                  <strong>
                    {formatElapsedTime(Date.now() - pollingStartTime)}
                  </strong>
                </div>
                {timeRemaining !== null &&
                  timeRemaining < 60000 &&
                  timeRemaining > 0 && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        color: "#856404",
                      }}
                    >
                      ⚠️ Timeout in:{" "}
                      <strong>{formatElapsedTime(timeRemaining)}</strong> (max
                      polling: 5 minutes)
                    </div>
                  )}
                <div
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                  }}
                >
                  {getTimeEstimate(Date.now() - pollingStartTime)}
                </div>
              </div>
            )}
          </div>
        )}

        {!isRunning && excludedOrders.length > 0 && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderRadius: "8px",
              border: "1px solid #ffeeba",
              fontSize: "0.9rem",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>
              {excludedOrders.length} order(s) excluded (missing
              source/destination coordinates):
            </div>
            <div
              style={{
                maxHeight: "120px",
                overflowY: "auto",
                fontSize: "0.85rem",
              }}
            >
              {excludedOrders.slice(0, 5).map((o) => (
                <div key={o.id} style={{ marginBottom: "0.25rem" }}>
                  • {o.title || o.id} – {o.reason || "Missing coordinates"}
                </div>
              ))}
              {excludedOrders.length > 5 && (
                <div style={{ fontStyle: "italic", opacity: 0.8 }}>
                  ...and {excludedOrders.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Balance Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              marginBottom: "1.25rem",
              fontSize: "1rem",
              fontWeight: "700",
              color: "#0A214A",
              letterSpacing: "-0.01em",
            }}
          >
            Balance:
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                name="no_balance"
                checked={formData.no_balance}
                onChange={handleChange}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>No Balance</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                name="balance_order_count"
                checked={formData.balance_order_count}
                onChange={handleChange}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Balancing number of the order per fleets</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                name="balance_working_time"
                checked={formData.balance_working_time}
                onChange={handleChange}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Balancing working time of the fleets</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                name="allow_multiple_depot_visits"
                checked={formData.allow_multiple_depot_visits}
                onChange={handleChange}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Fleet can visit the depot more than one time</span>
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              <label
                htmlFor="depot_visit_time_default"
                style={{
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  color: "#0A214A",
                }}
              >
                Depot visit time default:
              </label>
              <input
                type="number"
                id="depot_visit_time_default"
                name="depot_visit_time_default"
                value={formData.depot_visit_time_default}
                onChange={handleChange}
                min="0"
                style={{
                  width: "70px",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid rgba(15, 23, 42, 0.15)",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  color: "#0A214A",
                  fontFamily: "inherit",
                }}
              />
              <span style={{ fontSize: "0.9rem", color: "#0A214A" }}>min</span>
            </div>
          </div>
        </div>

        {/* Policy Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              marginBottom: "1.25rem",
              fontSize: "1rem",
              fontWeight: "700",
              color: "#0A214A",
              letterSpacing: "-0.01em",
            }}
          >
            Policy:
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="radio"
                name="policy"
                value="economy"
                checked={formData.policy === "economy"}
                onChange={() => handlePolicyChange("economy")}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Economy</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="radio"
                name="policy"
                value="agile"
                checked={formData.policy === "agile"}
                onChange={() => handlePolicyChange("agile")}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Agile</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
              }}
            >
              <input
                type="radio"
                name="policy"
                value="trade_off"
                checked={formData.policy === "trade_off"}
                onChange={() => handlePolicyChange("trade_off")}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Trade off</span>
            </label>

            {formData.show_all_scenarios && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#0A214A",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#4caf50",
                    borderRadius: "2px",
                    marginRight: "0.75rem",
                    flexShrink: 0,
                  }}
                ></span>
                <span>see all 3 scenarios and then select one plan to run</span>
              </div>
            )}

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#0A214A",
                fontWeight: "500",
                marginTop: "1rem",
              }}
            >
              <input
                type="checkbox"
                name="show_all_scenarios"
                checked={formData.show_all_scenarios}
                onChange={handleChange}
                style={{
                  marginRight: "0.75rem",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#36d4c0",
                }}
              />
              <span>Show all scenarios</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "auto",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isLoading || isRunning}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading || isRunning ? "not-allowed" : "pointer",
              opacity: isLoading || isRunning ? 0.6 : 1,
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !isRunning) {
                e.target.style.backgroundColor = "#5a6268";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && !isRunning) {
                e.target.style.backgroundColor = "#6c757d";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {isLoading ? "Saving..." : "Save Config"}
          </button>

          <button
            type="submit"
            disabled={isLoading || isRunning || isGeocoding}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#20b2aa",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading || isRunning ? "not-allowed" : "pointer",
              opacity: isLoading || isRunning ? 0.6 : 1,
              fontWeight: "600",
              fontSize: "0.9rem",
              flex: 1,
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !isRunning) {
                e.target.style.backgroundColor = "#1a9a94";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(32, 178, 170, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && !isRunning) {
                e.target.style.backgroundColor = "#20b2aa";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {isRunning ? "Running..." : "Run & Optimization"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddForm;
