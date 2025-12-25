import { useMemo, useState } from "react";
import {
  Card,
  Badge,
  Tag,
  Button,
  Divider,
  Typography,
  Statistic,
  Row,
  Col,
  Space,
  Collapse,
} from "antd";
import {
  TruckOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BoxPlotOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Vehicle color palette
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

// Helper functions
const formatDistance = (meters: number): string => {
  if (!meters || meters === 0) return "0 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

const formatDuration = (seconds: number): string => {
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

interface Vehicle {
  id: string;
  name: string;
  orders: any[];
  distance: number;
  duration: number;
  service: number;
  waiting: number;
  load: {
    weight?: number;
    volume?: number;
  };
  cost: number;
  steps: any[];
  orderedLocationIds: string[];
}

interface OptimizationResultPanelProps {
  resultData: any;
  defaultScenario?: string;
  vehicleNames?: Record<string, string>;
}

const OptimizationResultPanel: React.FC<OptimizationResultPanelProps> = ({
  resultData,
  defaultScenario = "economy",
  vehicleNames = {},
}) => {
  const scenarios = [
    { id: "economy", label: "Economy", color: "success" },
    { id: "agile", label: "Agile", color: "processing" },
    { id: "trade_off", label: "Trade off", color: "warning" },
  ];

  const [selectedScenario, setSelectedScenario] = useState(
    defaultScenario || "economy"
  );

  const vehicles: Vehicle[] = useMemo(() => {
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

  const getScenarioColor = (scenarioId: string) => {
    const colors = {
      economy: {
        bg: "bg-green-50",
        border: "border-green-500",
        text: "text-green-600",
      },
      agile: {
        bg: "bg-blue-50",
        border: "border-blue-500",
        text: "text-blue-600",
      },
      trade_off: {
        bg: "bg-amber-50",
        border: "border-amber-500",
        text: "text-amber-600",
      },
    };
    return colors[scenarioId as keyof typeof colors] || colors.economy;
  };

  const renderScenarioCard = (scenario: { id: string; label: string }) => {
    const isActive = selectedScenario === scenario.id;
    const colors = getScenarioColor(scenario.id);

    return (
      <Card
        key={scenario.id}
        className={`cursor-pointer transition-all duration-200 ${
          isActive
            ? `${colors.bg} ${colors.border} border-2 shadow-lg`
            : "border border-gray-200 hover:shadow-md"
        }`}
        onClick={() => setSelectedScenario(scenario.id)}
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isActive
                ? `bg-${
                    scenario.id === "economy"
                      ? "green"
                      : scenario.id === "agile"
                      ? "blue"
                      : "amber"
                  }-500`
                : "bg-gray-400"
            } ${isActive ? "shadow-md" : ""}`}
          />
          <Text
            className={`font-bold text-base ${
              isActive ? colors.text : "text-gray-900"
            }`}
          >
            {scenario.label}
          </Text>
        </div>
        <div className="flex gap-2">
          <Button
            type={isActive ? "primary" : "default"}
            size="small"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScenario(scenario.id);
            }}
          >
            Details
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EnvironmentOutlined />}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (
                onShowRoute &&
                scenario.id === selectedScenario &&
                vehicles.length > 0
              ) {
                vehicles.forEach((vehicle) => onShowRoute(vehicle.id));
              }
            }}
          >
            Show Route
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Scenario Selection */}
      <div className="flex flex-col gap-3">
        {scenarios.map(renderScenarioCard)}
      </div>

      {/* Summary Statistics */}
      {summary && (
        <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-none shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleOutlined className="text-white text-xl" />
            <Title level={4} className="!text-white !mb-0">
              Summary
            </Title>
          </div>

          <Row gutter={[12, 12]}>
            <Col span={12}>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <Text className="text-white/90 text-xs block mb-1">
                  Total Orders
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {summary.total_orders || 0}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <Text className="text-white/90 text-xs block mb-1">
                  Vehicles Used
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {summary.vehicles_used || 0}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <Text className="text-white/90 text-xs block mb-1">
                  Optimized
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {summary.optimized_orders || 0}
                </Text>
              </div>
            </Col>
            {summary.unassigned_orders !== undefined && (
              <Col span={12}>
                <div
                  className={`backdrop-blur-sm rounded-xl p-3 ${
                    summary.unassigned_orders > 0
                      ? "bg-red-500/30"
                      : "bg-white/15"
                  }`}
                >
                  <Text className="text-white/90 text-xs block mb-1">
                    Unassigned
                  </Text>
                  <Text className="text-white text-2xl font-bold">
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
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
                    <Text className="text-white/90 text-[10px] block">
                      Total Cost
                    </Text>
                    <Text className="text-white text-lg font-bold">
                      {summary.total_cost.toLocaleString()}
                    </Text>
                  </div>
                </Col>
              )}
              {summary.total_service_time !== undefined && (
                <Col span={8}>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
                    <Text className="text-white/90 text-[10px] block">
                      Service Time
                    </Text>
                    <Text className="text-white text-lg font-bold">
                      {formatDuration(summary.total_service_time)}
                    </Text>
                  </div>
                </Col>
              )}
              {summary.total_waiting_time !== undefined && (
                <Col span={8}>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
                    <Text className="text-white/90 text-[10px] block">
                      Waiting Time
                    </Text>
                    <Text className="text-white text-lg font-bold">
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
              <Text className="text-white text-xs font-semibold">
                ⚠️ Constraint Violations: {summary.violations.length}
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Unassigned Orders */}
      {summary.unassigned_orders_list &&
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
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
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
                  </Row>

                  {/* Orders Section */}
                  <div className="flex items-center gap-2 mb-3">
                    <BoxPlotOutlined style={{ color: colors.primary }} />
                    <Text className="text-xs font-medium">Orders:</Text>
                    <Badge
                      count={vehicle.orders.length}
                      style={{ backgroundColor: colors.primary }}
                    />
                  </div>

                  {vehicle.orders.length > 0 && (
                    <div className="mb-3">
                      <Text className="text-xs font-semibold text-[#0A214A] block mb-2">
                        Order numbers / IDs:
                      </Text>
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.orders
                          .slice(0, 20)
                          .map((o: any, i: number) => {
                            const ord =
                              o.order_number ||
                              o.order_id ||
                              o.uuid ||
                              (typeof o === "string" ? o : "");
                            return (
                              <Tag
                                key={`${vehicle.id}-ord-${i}`}
                                className="text-[10px] font-mono"
                              >
                                {ord || "—"}
                              </Tag>
                            );
                          })}
                        {vehicle.orders.length > 20 && (
                          <Text className="text-[10px] text-gray-500">
                            ...and {vehicle.orders.length - 20} more
                          </Text>
                        )}
                      </div>
                    </div>
                  )}

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
                  {onShowRoute && (
                    <Button
                      type="primary"
                      block
                      icon={<EnvironmentOutlined />}
                      onClick={() => onShowRoute(vehicle.id)}
                      style={{
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      }}
                      className="font-semibold"
                    >
                      Show Route on Map
                    </Button>
                  )}
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
