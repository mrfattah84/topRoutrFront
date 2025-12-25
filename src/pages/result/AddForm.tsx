import { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Radio,
  Space,
  InputNumber,
  Spin,
  Typography,
  Progress,
  message,
} from "antd";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  useGetDefaultConfigQuery,
  useSaveConfigMutation,
  useRunOptimizationMutation,
  useLazyGetOptimizationStatusQuery,
  useGetOrdersForOptimizationQuery,
  useGetDriversForOptimizationQuery,
  useUpdateAddressMutation,
} from "./optimizationApi";
import OptimizationResultPanel from "./OptimizationResultPanel";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSidebarMenue } from "../formDialog/dialogSlice";

const { Title, Text } = Typography;

const formatElapsedTime = (milliseconds: number): string => {
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

const getTimeEstimate = (elapsedTime: number): string => {
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

const AddForm = ({ setResultData }) => {
  const [formData, setFormData] = useState({
    no_balance: false,
    balance_order_count: false,
    balance_working_time: false,
    allow_multiple_depot_visits: false,
    depot_visit_time_default: 30,
    policy: "economy",
    show_all_scenarios: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [maxPollingTime] = useState(300000);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [excludedOrders, setExcludedOrders] = useState<any[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [vehicleNames, setVehicleNames] = useState<Record<string, string>>({});

  const neshanApiKey = "service.74443e788cef4d48b5fc86111132d3f5";

  const { data: defaultConfig } = useGetDefaultConfigQuery({});
  const [saveConfig, { isLoading: isSaving }] = useSaveConfigMutation();
  const [runOptimization, { isLoading: isOptimizing }] =
    useRunOptimizationMutation();
  const [triggerStatusCheck] = useLazyGetOptimizationStatusQuery();
  const { data: orders } = useGetOrdersForOptimizationQuery({});
  const { data: drivers } = useGetDriversForOptimizationQuery({});
  const [updateAddress] = useUpdateAddressMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (defaultConfig) {
      setFormData({
        no_balance: defaultConfig.no_balance || false,
        balance_order_count: defaultConfig.balance_order_count || false,
        balance_working_time: defaultConfig.balance_working_time || false,
        allow_multiple_depot_visits:
          defaultConfig.allow_multiple_depot_visits || false,
        depot_visit_time_default: defaultConfig.depot_visit_time_default || 30,
        policy: defaultConfig.policy || "economy",
        show_all_scenarios: defaultConfig.show_all_scenarios || false,
      });
    }
  }, [defaultConfig]);

  useEffect(() => {
    if (runId && isRunning) {
      const startTime = Date.now();
      setPollingStartTime(startTime);

      const interval = setInterval(async () => {
        const elapsedTime = Date.now() - startTime;
        const remaining = maxPollingTime - elapsedTime;
        setTimeRemaining(remaining > 0 ? remaining : 0);

        if (elapsedTime > maxPollingTime) {
          setIsRunning(false);
          clearInterval(interval);
          message.error("Optimization timeout reached");
          return;
        }

        try {
          const result = await triggerStatusCheck(runId).unwrap();
          const status = result.status;
          setRunStatus(status);

          if (status === "completed" || status === "failed") {
            setIsRunning(false);
            clearInterval(interval);
            setPollingStartTime(null);
            setTimeRemaining(null);

            if (status === "completed" && result.result_data) {
              setResultData(result.result_data);
              dispatch(setSidebarMenue("result-show"));
              message.success("Optimization completed successfully!");
            } else if (status === "failed") {
              message.error(result.error_message || "Optimization failed");
            }
          }
        } catch (err) {
          console.error("Failed to check optimization status:", err);
          setIsRunning(false);
          clearInterval(interval);
          message.error("Failed to check optimization status");
        }
      }, 2000);

      return () => {
        clearInterval(interval);
        setPollingStartTime(null);
        setTimeRemaining(null);
      };
    }
  }, [runId, isRunning, triggerStatusCheck, maxPollingTime]);

  const hasValidCoords = (loc: any) => {
    if (!loc) return false;
    const lat = loc.latitude ?? loc.lat;
    const lng = loc.longitude ?? loc.lng;
    const hasLat = typeof lat === "number" && !Number.isNaN(lat) && lat !== 0;
    const hasLng = typeof lng === "number" && !Number.isNaN(lng) && lng !== 0;
    return hasLat && hasLng;
  };

  const geocodeAddress = async (address: any) => {
    try {
      const fullAddress = address.description || address.title || "";
      if (!fullAddress) return null;

      const response = await axios.get("https://api.neshan.org/v6/geocoding", {
        params: { address: fullAddress },
        headers: { "Api-Key": neshanApiKey },
      });

      const { location } = response.data;
      if (location && location.x && location.y) {
        return {
          latitude: location.y,
          longitude: location.x,
        };
      }
      return null;
    } catch (error) {
      console.error("[Geocoding] Failed:", address.uid);
      return null;
    }
  };

  const geocodeAndUpdateAddress = async (address: any) => {
    try {
      const coords = await geocodeAddress(address);
      if (coords && coords.latitude && coords.longitude) {
        await updateAddress({
          uid: address.uid,
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }).unwrap();

        return {
          ...address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
      return address;
    } catch (error) {
      return address;
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfig = async () => {
    try {
      await saveConfig({
        ...formData,
        name: "My Balance Config",
        is_default: true,
      }).unwrap();
      message.success("Configuration saved successfully");
    } catch (err) {
      message.error("Failed to save configuration");
    }
  };

  const handleRunOptimization = async () => {
    try {
      setIsRunning(true);
      setRunStatus(null);
      setResultData(null);
      setExcludedOrders([]);

      let validOrderIds: string[] = [];
      let invalidOrders: any[] = [];

      if (orders && Array.isArray(orders)) {
        const addressesToGeocode: any[] = [];
        orders.forEach((order: any) => {
          const source = order.source || {};
          const destination = order.destination || {};

          if (
            source.uid &&
            (!hasValidCoords(source) ||
              !source.verified ||
              source.verified === "red")
          ) {
            if (!addressesToGeocode.find((a) => a.uid === source.uid)) {
              addressesToGeocode.push(source);
            }
          }
          if (
            destination.uid &&
            (!hasValidCoords(destination) ||
              !destination.verified ||
              destination.verified === "red")
          ) {
            if (!addressesToGeocode.find((a) => a.uid === destination.uid)) {
              addressesToGeocode.push(destination);
            }
          }
        });

        if (addressesToGeocode.length > 0) {
          setIsGeocoding(true);
          setGeocodingProgress({
            current: 0,
            total: addressesToGeocode.length,
          });

          for (let i = 0; i < addressesToGeocode.length; i++) {
            setGeocodingProgress({
              current: i + 1,
              total: addressesToGeocode.length,
            });
            await geocodeAndUpdateAddress(addressesToGeocode[i]);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          setIsGeocoding(false);
        }

        const parsed = orders.map((o: any) => {
          const id = o.id || o.uuid;
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
            valid: validSource && validDest,
            reason,
          };
        });

        const validOrders = parsed.filter((o: any) => o.valid);
        invalidOrders = parsed.filter((o: any) => !o.valid);
        validOrderIds = validOrders.map((o: any) => o.id);
        setExcludedOrders(invalidOrders);
      }

      if (validOrderIds.length === 0) {
        message.error("No orders with valid locations to optimize");
        setIsRunning(false);
        return;
      }

      let driverIdsWithVehicles: string[] = [];
      const names: Record<string, string> = {};

      if (drivers && Array.isArray(drivers)) {
        const driversWithVehicles = drivers.filter(
          (d: any) => d.vehicle || d.vehicle_id || d.vehicleId
        );
        driverIdsWithVehicles = driversWithVehicles
          .map((d: any) => d.id || d.uuid)
          .filter(Boolean);

        driversWithVehicles.forEach((d: any) => {
          const id = d.id || d.uuid;
          names[id] = d.name || d.vehicle?.name || `Vehicle ${id}`;
        });
      }

      if (driverIdsWithVehicles.length === 0) {
        message.error("No drivers with vehicles found");
        setIsRunning(false);
        return;
      }

      const saveResult = await saveConfig({
        ...formData,
        name: "My Balance Config",
        is_default: true,
      }).unwrap();

      const runResult = await runOptimization({
        config_id: saveResult.id,
        driver_ids: driverIdsWithVehicles,
        order_ids: validOrderIds,
        run_async: true,
        balance_order_count: formData.balance_order_count,
        balance_working_time: formData.balance_working_time,
        allow_multiple_depot_visits: formData.allow_multiple_depot_visits,
        depot_visit_time_default: formData.depot_visit_time_default,
        policy: formData.policy,
      }).unwrap();

      if (runResult?.id) {
        setRunId(runResult.id);
        setRunStatus(runResult.status || "pending");
      }
    } catch (err: any) {
      console.error("Optimization run failed:", err);
      message.error(err.message || "Optimization failed");
      setIsRunning(false);
    }
  };

  return (
    <div className="p-5 pt-0">
      <Title level={4} className="m-0! mb-2! !font-bold !text-[#0A214A]">
        Policy Configuration
      </Title>

      <div className="flex flex-col gap-2">
        {isGeocoding && (
          <Alert
            title="Geocoding addresses..."
            description={
              <div className="flex flex-col gap-2">
                <Text className="text-sm">
                  Geocoding {geocodingProgress.current} of{" "}
                  {geocodingProgress.total} addresses
                </Text>
                <Progress
                  percent={Math.round(
                    (geocodingProgress.current / geocodingProgress.total) * 100
                  )}
                  status="active"
                />
              </div>
            }
            type="warning"
            icon={<LoadingOutlined spin />}
            showIcon
          />
        )}

        {isRunning && (
          <Alert
            title={
              <div className="flex items-center gap-2">
                <Spin size="small" />
                <Text strong>
                  Optimization Status: {runStatus || "Starting..."}
                </Text>
              </div>
            }
            description={
              pollingStartTime && (
                <div className="flex flex-col gap-2">
                  <Text className="text-sm">
                    ⏱️ Running for:{" "}
                    <Text strong>
                      {formatElapsedTime(Date.now() - pollingStartTime)}
                    </Text>
                  </Text>
                  {timeRemaining !== null &&
                    timeRemaining < 60000 &&
                    timeRemaining > 0 && (
                      <Alert
                        title={
                          <Text className="text-xs">
                            ⚠️ Timeout in:{" "}
                            <Text strong>
                              {formatElapsedTime(timeRemaining)}
                            </Text>
                          </Text>
                        }
                        type="warning"
                        showIcon={false}
                      />
                    )}
                  <Text className="text-xs italic text-gray-600">
                    {getTimeEstimate(Date.now() - pollingStartTime)}
                  </Text>
                </div>
              )
            }
            type="info"
            showIcon
          />
        )}

        {!isRunning && excludedOrders.length > 0 && (
          <Alert
            title={`${excludedOrders.length} order(s) excluded (missing coordinates)`}
            description={
              <div className="max-h-32 overflow-y-auto text-sm">
                {excludedOrders.slice(0, 5).map((o) => (
                  <div key={o.id} className="mb-1">
                    • {o.title || o.id} – {o.reason}
                  </div>
                ))}
                {excludedOrders.length > 5 && (
                  <div className="italic opacity-80">
                    ...and {excludedOrders.length - 5} more
                  </div>
                )}
              </div>
            }
            type="warning"
            showIcon
          />
        )}

        <div>
          <Radio.Group
            value={formData.policy}
            onChange={(e) => handleChange("policy", e.target.value)}
          >
            <Radio value="economy">Economy</Radio>
            <Radio value="agile">Agile</Radio>
            <Radio value="trade_off">Trade off</Radio>
          </Radio.Group>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSaveConfig}
            loading={isSaving}
            disabled={isRunning || isGeocoding}
          >
            Save Config
          </Button>
          <Button
            type="primary"
            onClick={handleRunOptimization}
            loading={isOptimizing || isRunning}
            disabled={isSaving || isGeocoding}
          >
            {isRunning ? "Running..." : "Run & Optimization"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddForm;
