import { useMemo, useState } from "react";
import { Card, Badge, Tag, Button, Typography, Row, Col, Collapse } from "antd";
import {
  TruckOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BoxPlotOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useGetVehicleNamesQuery } from "./optimizationApi";
// Import Redux hooks and actions
import { useDispatch } from "react-redux";
import { addPoint, clearMap, setRoutes } from "../map/mapSlice"; // Ensure path is correct
import { decodePolyline6 } from "./polyLine"; // Ensure this utility exists
import { setSidebarMenue } from "../formDialog/dialogSlice";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// ... (Keep your existing formatDistance, formatDuration, getVehicleColors helpers here) ...
const getVehicleColors = (index: number) => {
  const colorPalette = [
    { primary: "#3b82f6", secondary: "#dbeafe" },
    { primary: "#10b981", secondary: "#d1fae5" },
    { primary: "#f59e0b", secondary: "#fef3c7" },
    { primary: "#ef4444", secondary: "#fee2e2" },
    { primary: "#8b5cf6", secondary: "#ede9fe" },
    { primary: "#ec4899", secondary: "#fce7f3" },
    { primary: "#14b8a6", secondary: "#ccfbf1" },
    { primary: "#f97316", secondary: "#ffedd5" },
  ];
  return colorPalette[index % colorPalette.length];
};

const formatDistance = (meters: number) =>
  meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(2)} km`;
const formatDuration = (seconds: number) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${seconds % 60}s`;
};

interface OptimizationResultPanelProps {
  resultData: any;
}

const OptimizationResultPanel: React.FC<OptimizationResultPanelProps> = ({
  resultData,
}) => {
  const dispatch = useDispatch(); // Hook to dispatch actions
  const { data: vehicleNames } = useGetVehicleNamesQuery();

  const vehicles = useMemo(() => {
    const routes = resultData?.routes || {};
    const solution = resultData?.solution || {};
    return Object.keys(solution).map((vehicleId) => {
      const route = routes[vehicleId] || {};
      return {
        id: vehicleId,
        name: vehicleNames?.[vehicleId] || vehicleId, // Fixed vehicleName access
        orders: solution[vehicleId] || [],
        distance: route.distance_m || 0,
        duration: route.duration_s || 0,
        service: route.service_s || 0,
        waiting: route.waiting_time || route.waiting || 0,
        load: route.load || {},
        cost: route.cost || 0,
        steps: route.steps || [],
        geometry: route.geometry, // Important: capture geometry
      };
    });
  }, [resultData, vehicleNames]);

  const summary = resultData?.summary || {};

  const handleShowRoute = (vehicleId: string, index: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    // Use the utility we just fixed
    let coords = decodePolyline6(vehicle.geometry);

    dispatch(clearMap());
    for (let i = 0; i < vehicle.steps.length; i++) {
      const step = vehicle.steps[i];
      if (step.type == "start") {
        dispatch(
          addPoint({
            id: vehicleId,
            color: "#008000",
            coords: step.location,
            name: step.type,
            description: "",
          })
        );
      } else if (step.type == "end") {
        dispatch(
          addPoint({
            id: vehicleId,
            color: "#FF0000",
            coords: step.location,
            name: step.type,
            description: "",
          })
        );
      } else {
        console.log(step);
        dispatch(
          addPoint({
            id: vehicleId,
            color: getVehicleColors(index).primary,
            coords: step.location,
            name: step.type,
            description: i,
          })
        );
      }
    }
    dispatch(
      setRoutes([
        {
          id: vehicleId,
          color: getVehicleColors(index).primary,
          coordinates: coords,
        },
      ])
    );
  };

  return (
    <div className="flex flex-col gap-4 pt-5">
      {/* Summary Statistics */}
      {summary && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleOutlined className=" text-xl" />
            <Title
              level={4}
              className="flex justify-between items-center w-full mb-0!"
            >
              Summary
            </Title>
          </div>

          <Row gutter={[12, 12]}>
            <Col span={12}>
              <div className=" backdrop-blur-sm rounded-xl p-3">
                <Text className=" text-xs block mb-1">Total Orders</Text>
                <Text className=" text-2xl font-bold">
                  {summary.total_orders || 0}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div className=" backdrop-blur-sm rounded-xl p-3">
                <Text className=" text-xs block mb-1">Vehicles Used</Text>
                <Text className=" text-2xl font-bold">
                  {summary.vehicles_used || 0}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div className=" backdrop-blur-sm rounded-xl p-3">
                <Text className=" text-xs block mb-1">Optimized</Text>
                <Text className=" text-2xl font-bold">
                  {summary.optimized_orders || 0}
                </Text>
              </div>
            </Col>
            {summary.unassigned_orders !== undefined && (
              <Col span={12}>
                <div
                  className={`backdrop-blur-sm rounded-xl p-3 ${
                    summary.unassigned_orders > 0 ? "bg-red-500/30" : ""
                  }`}
                >
                  <Text className=" text-xs block mb-1">Unassigned</Text>
                  <Text className=" text-2xl font-bold">
                    {summary.unassigned_orders || 0}
                  </Text>
                </div>
              </Col>
            )}
          </Row>

          {/* Additional Stats */}
          {(summary.total_cost ||
            summary.total_service_time ||
            summary.total_waiting_time) && (
            <Row gutter={[12, 12]} className="mt-3">
              {summary.total_cost !== undefined && (
                <Col span={8}>
                  <div className=" backdrop-blur-sm rounded-xl p-2">
                    <Text className=" text-[10px] block">Total Cost</Text>
                    <Text className=" text-lg font-bold">
                      {summary.total_cost.toLocaleString()}
                    </Text>
                  </div>
                </Col>
              )}
              {summary.total_service_time !== undefined && (
                <Col span={8}>
                  <div className=" backdrop-blur-sm rounded-xl p-2">
                    <Text className=" text-[10px] block">Service Time</Text>
                    <Text className=" text-lg font-bold">
                      {formatDuration(summary.total_service_time)}
                    </Text>
                  </div>
                </Col>
              )}
              {summary.total_waiting_time !== undefined && (
                <Col span={8}>
                  <div className=" backdrop-blur-sm rounded-xl p-2">
                    <Text className=" text-[10px] block">Waiting Time</Text>
                    <Text className=" text-lg font-bold">
                      {formatDuration(summary.total_waiting_time)}
                    </Text>
                  </div>
                </Col>
              )}
            </Row>
          )}

          {/* Violations */}
          {summary.violations && summary.violations.length > 0 && (
            <div className="bg-red-500/20 rounded-xl p-3 mt-3">
              <Text className=" text-xs font-semibold">
                ⚠️ Constraint Violations: {summary.violations.length}
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Unassigned Orders */}
      {summary?.unassigned_orders_list &&
        summary.unassigned_orders_list.length > 0 && (
          <Card className="border-red-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <WarningOutlined className="text-red-600 text-xl" />
              <Title level={5} className="!text-red-600 !mb-0">
                Unassigned Orders ({summary.unassigned_orders_list.length})
              </Title>
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {summary.unassigned_orders_list.map(
                (unassigned: any, index: number) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <Text className="text-sm font-semibold text-red-900 block break-all">
                      Order ID:{" "}
                      {unassigned.order_uuid || unassigned.id || "UNKNOWN"}
                    </Text>
                    <Text className="text-xs text-red-800 break-words">
                      Reason:{" "}
                      <span className="font-semibold">
                        {unassigned.reason || "UNKNOWN"}
                      </span>
                    </Text>
                  </div>
                )
              )}
            </div>
          </Card>
        )}

      {/* Route Details */}
      {vehicles.length > 0 && (
        <Card className="shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TruckOutlined className="text-[#0A214A] text-xl" />
            <Title level={5} className="!mb-0">
              Route Details
            </Title>
          </div>

          <div className="flex flex-col gap-3">
            {vehicles.map((vehicle, index) => {
              const colors = getVehicleColors(index);

              return (
                <Card
                  key={vehicle.id}
                  className="transition-all duration-200 hover:shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${colors.secondary} 0%, #fff 100%)`,
                    borderColor: `${colors.primary}30`,
                  }}
                  bodyStyle={{ padding: "12px" }}
                >
                  {/* Vehicle Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center  font-bold text-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-0.5">
                        <Text
                          className="text-sm font-bold"
                          style={{ color: colors.primary }}
                        >
                          Vehicle {index + 1}
                        </Text>
                        <Text className="text-sm font-extrabold text-[#0A214A]">
                          {vehicle.name}
                        </Text>
                      </div>
                      <Text className="text-[10px] text-gray-500 font-mono">
                        {vehicle.id}
                      </Text>
                    </div>
                  </div>

                  {/* Vehicle Stats Grid */}
                  <Row gutter={[8, 8]} className="mb-3">
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <span className="font-semibold text-[#0A214A]">
                          Assigned customers:{" "}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {vehicle.orders.length}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <span className="font-semibold text-[#0A214A]">
                          Assigned weight:{" "}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {vehicle.load?.weight !== undefined
                            ? Number(vehicle.load.weight).toFixed(3)
                            : "n/a"}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <span className="font-semibold text-[#0A214A]">
                          Assigned volume:{" "}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {vehicle.load?.volume !== undefined
                            ? Number(vehicle.load.volume).toFixed(3)
                            : "n/a"}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <ClockCircleOutlined
                          className="mr-1"
                          style={{ color: colors.primary }}
                        />
                        <span className="font-medium">Route distance: </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {formatDistance(vehicle.distance)}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <ClockCircleOutlined
                          className="mr-1"
                          style={{ color: colors.primary }}
                        />
                        <span className="font-medium">Travel time: </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {formatDuration(vehicle.duration)}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <ClockCircleOutlined
                          className="mr-1"
                          style={{ color: colors.primary }}
                        />
                        <span className="font-medium">Service time: </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {formatDuration(vehicle.service)}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text className="text-xs text-gray-600">
                        <ClockCircleOutlined
                          className="mr-1"
                          style={{ color: colors.primary }}
                        />
                        <span className="font-medium">Total time: </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.primary }}
                        >
                          {formatDuration(
                            (vehicle.duration || 0) +
                              (vehicle.service || 0) +
                              (vehicle.waiting || 0)
                          )}
                        </span>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <div className="flex items-center gap-2 mb-3">
                        <BoxPlotOutlined style={{ color: colors.primary }} />
                        <Text className="text-xs font-medium">Orders:</Text>
                        <Badge
                          count={vehicle.orders.length}
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                    </Col>
                  </Row>

                  {/* Route Steps */}
                  {vehicle.steps && vehicle.steps.length > 0 && (
                    <Collapse size="small" ghost className="mb-3">
                      <Panel
                        header={`Route Steps (${vehicle.steps.length})`}
                        key="1"
                      >
                        <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
                          {vehicle.steps.map((step: any, stepIndex: number) => (
                            <div
                              key={stepIndex}
                              className="bg-white rounded-md p-2 flex justify-between items-center text-[10px]"
                            >
                              <div className="flex items-center gap-1.5">
                                <Tag
                                  color={
                                    step.type === "job"
                                      ? colors.primary
                                      : "default"
                                  }
                                  className="text-[9px] uppercase m-0"
                                >
                                  {step.type}
                                </Tag>
                                {step.order_uuid && (
                                  <Text className="text-gray-600 font-mono text-[10px]">
                                    {step.order_uuid.substring(0, 8)}...
                                  </Text>
                                )}
                              </div>
                              <div className="flex gap-2 text-gray-400">
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
                      </Panel>
                    </Collapse>
                  )}

                  {/* Show Route Button */}
                  <Button
                    type="primary"
                    block
                    icon={<EnvironmentOutlined />}
                    // UPDATED CLICK HANDLER
                    onClick={() => handleShowRoute(vehicle.id, index)}
                    style={{
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    }}
                    className="font-semibold mt-3"
                  >
                    Show Route on Map
                  </Button>
                </Card>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OptimizationResultPanel;
