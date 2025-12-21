import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  TimePicker,
} from "antd";
import { useEffect, useState } from "react";
import AddAddress from "../AddAddress";
import AddressSelector from "../AddressSelector";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
  useCreateFleetMutation,
  useUpdateFleetMutation,
  useGetFleetQuery,
  useGetVehiclesQuery,
  useGetDriverUsersQuery,
  useCreateCostsMutation,
  useCreateWorkScheduleMutation,
} from "./fleetApi";
import { setForm } from "../../dialogSlice";
import AddVehicle from "./AddVehicle";

const AddFleet = ({ id = null }) => {
  const [step, setStep] = useState(0);
  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [createFleet, { isLoading: isCreating }] = useCreateFleetMutation();
  const [updateFleet, { isLoading: isUpdating }] = useUpdateFleetMutation();
  const [createCosts] = useCreateCostsMutation();
  const [createWorkScedule] = useCreateWorkScheduleMutation();

  const { data: vehicles, isLoading: isVehiclesLoading } =
    useGetVehiclesQuery();
  const { data: driverUsers, isLoading: isDriverUsersLoading } =
    useGetDriverUsersQuery();

  // Only fetch if id exists
  const { data: fleetData, isLoading: isFetching } = useGetFleetQuery(id, {
    skip: !id,
  });

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const format = "HH:mm";
  const isEditMode = !!id;
  const isLoading = isCreating || isUpdating;

  const regions = [];
  for (let i = 1; i <= 22; i++) {
    regions.push({
      label: "Teh" + i,
      value: "Teh" + i,
    });
  }

  // Reset form when switching between add/edit modes or when id changes
  useEffect(() => {
    // Reset form and state
    form.resetFields();
    setStep(0);
    setShowAddOrigin(false);
    setShowAddDestination(false);
    setShowAddVehicle(false);

    console.log(
      `Form reset - Mode: ${id ? "Edit" : "Add"}, ID: ${id || "N/A"}`
    );
  }, [id, form]);

  // Populate form when editing
  useEffect(() => {
    if (fleetData && isEditMode) {
      // Parse time string to dayjs object
      const parseTime = (timeString) => {
        if (!timeString) return null;
        // Handle both "HH:mm:ss" and ISO format
        return dayjs(timeString, "HH:mm:ss");
      };

      // Deformat the API data back to form structure
      const deformattedData = {
        // Basic fields - direct mapping
        title: fleetData.title,
        source_id: fleetData.source.uid,
        destination_id: fleetData.destination.uid,
        priority: fleetData.priority,
        fleet_type: fleetData.fleet_type,
        description: fleetData.description,

        // Date field - keep as string (already in YYYY-MM-DD format)
        fleet_date: fleetData.fleet_date,
        delivery_date: fleetData.delivery_date,

        // Time fields - convert string to dayjs
        stop_time: parseTime(fleetData.stop_time),

        // Time windows - convert delivery_time_from/to to times array structure
        times:
          fleetData.delivery_time_from && fleetData.delivery_time_to
            ? [
                {
                  time: [
                    parseTime(fleetData.delivery_time_from),
                    parseTime(fleetData.delivery_time_to),
                  ],
                },
              ]
            : [],

        // Items - map fleet_item_id array back to Items structure
        // Note: This assumes you have a way to fetch full item details from IDs
        // If the API returns full fleet_items, map those instead
        Items: fleetData.fleet_items
          ? fleetData.fleet_items.map((item) => ({
              itemId: item.id,
              item_title: item.title,
              description: item.description,
              weight: item.weight,
              length: item.length,
              width: item.width,
              height: item.height,
              quantity: item.quantity,
            }))
          : fleetData.fleet_item_id
          ? fleetData.fleet_item_id.map((itemId) => ({
              itemId: itemId,
              // You'll need to fetch other item details or leave them empty
            }))
          : [],

        // Optional fields that might be in the API response
        activated: fleetData.activated,
        driver_id: fleetData.driver_id,
        assigned_to_id: fleetData.assigned_to_id,
        cluster_id: fleetData.cluster_id,
        file_id: fleetData.file_id,
        delivery_fleet_sequence: fleetData.delivery_fleet_sequence,
        delivery_fleet: fleetData.delivery_fleet,
        delay_reason: fleetData.delay_reason,
        assignment: fleetData.assignment,
        shipment_type: fleetData.shipment_type,
      };

      // Set form values with deformatted data
      form.setFieldsValue(deformattedData);

      console.log("=== FORM POPULATED FOR EDITING ===");
      console.log("Original API Data:", fleetData);
      console.log("Deformatted Form Data:", deformattedData);
      console.log("============================");
    }
  }, [fleetData, isEditMode, form]);

  // Cleanup: Reset form and state when component unmounts
  useEffect(() => {
    return () => {
      form.resetFields();
      setStep(0);
      setShowAddOrigin(false);
      setShowAddDestination(false);
      setShowAddVehicle(false);
      console.log("Form cleaned up on unmount");
    };
  }, [form]);

  const handleSubmit = async () => {
    if (step === 0) {
      // Moving to step 1, validate current fields
      try {
        await form.validateFields([
          "vehicle",
          "driver",
          "service_area",
          "start_location",
          "end_location",
          "workingHours",
        ]);

        setStep(1);
      } catch (error) {
        console.error("Step 0 validation failed:", error);
      }
    } else {
      // Final submission
      try {
        // Validate all fields
        await form.validateFields();

        // Get all form values
        const allFormData = form.getFieldsValue(true);
        console.log("=== ORDER FORM SUBMISSION ===");
        console.log("Raw Form Data:", allFormData);

        const cost = await createCosts(allFormData.cost).unwrap();

        /*
        const scedule = await createWorkScedule({
          name: "idk",
          start_time_1: allFormData.scedule[0].format("HH:mm:ss"),
          end_time_1: allFormData.scedule[1].format("HH:mm:ss"),
        }).unwrap();
        */

        // Format the data to match API schema
        const formattedData = {
          // Required fields
          driver_user: allFormData.driver,
          vehicle: allFormData.vehicle,
          service_area: "c2903dc7-f4a6-492e-b832-043b36758946",
          owner: "304134c1-de91-4224-98f5-bc594946a8af",
          start_location: allFormData.start_location,
          end_location: allFormData.end_location,
          cost: cost.id,
          work_schedule: "e9bc4f84-d4b0-422c-894a-7ccc0377417f", ///scedule.id,
        };

        // Console log all collected data
        console.log("Formatted Fleet Data:", formattedData);
        console.log("============================");

        // Call the appropriate mutation API
        const result = isEditMode
          ? await updateFleet({ id, data: formattedData }).unwrap()
          : await createFleet(formattedData).unwrap();

        console.log("API Response:", result);

        // On success
        dispatch(setForm(""));
        setStep(0);
        form.resetFields();
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    }
  };

  // Show loading spinner while fetching fleet data
  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Loading fleet data...</p>
      </div>
    );
  }

  return (
    <Form layout="vertical" form={form}>
      {step === 0 ? (
        <>
          {showAddVehicle ? (
            <AddVehicle show={setShowAddVehicle} form={form} />
          ) : (
            <Form.Item
              name="vehicle"
              label="vehicle"
              rules={[
                {
                  required: true,
                  message: "Please select a vehicle",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Search and select vehicle"
                options={vehicles}
                loading={isVehiclesLoading}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div
                      style={{
                        padding: "8px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => setShowAddVehicle(true)}
                        style={{ width: "100%" }}
                      >
                        Add New Vehicle
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>
          )}

          <Form.Item
            name="driver"
            label="driver user"
            rules={[
              {
                required: true,
                message: "Please select a user",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Search and select user"
              options={driverUsers}
              loading={isDriverUsersLoading}
            />
          </Form.Item>

          <Form.Item name="service_area" label="service area">
            <Select
              mode="multiple"
              allowClear
              placeholder="Please select"
              options={regions}
            />
          </Form.Item>

          {showAddOrigin ? (
            <Form.Item label="Add Start Location">
              <AddAddress setShowAddAddress={setShowAddOrigin} />
            </Form.Item>
          ) : (
            <Form.Item
              label="Start Location"
              name="start_location"
              rules={[
                { required: true, message: "Please select start location" },
              ]}
            >
              <AddressSelector
                name="start_location"
                onAddAddress={() => setShowAddOrigin(true)}
              />
            </Form.Item>
          )}

          {showAddDestination ? (
            <Form.Item label="Add End Location">
              <AddAddress setShowAddAddress={setShowAddDestination} />
            </Form.Item>
          ) : (
            <Form.Item
              label="End Location"
              name="end_location"
              rules={[
                { required: true, message: "Please select end location" },
              ]}
            >
              <AddressSelector
                name="end_location"
                onAddAddress={() => setShowAddDestination(true)}
              />
            </Form.Item>
          )}
          <Form.Item label="Working hours" name="scedule">
            <TimePicker.RangePicker format={format} minuteStep={15} />
          </Form.Item>
        </>
      ) : (
        <>
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <Form.Item
                label="Fixed cost"
                name={["cost", "fixed_cost"]}
                rules={[{ required: true, message: "Please enter fixed cost" }]}
              >
                <Input placeholder="e.g., 1000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cost per KM"
                name={["cost", "per_km_cost"]}
                rules={[
                  { required: true, message: "Please enter cost per KM" },
                ]}
              >
                <Input placeholder="e.g., 10" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <Form.Item
                label="Cost per hour"
                name={["cost", "per_hour_cost"]}
                rules={[
                  { required: true, message: "Please enter Cost per hour" },
                ]}
              >
                <Input placeholder="e.g., 100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cost per hour overtime"
                name={["cost", "per_hour_overtime_cost"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter Cost per hour overtime",
                  },
                ]}
              >
                <Input placeholder="e.g., 10" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <Form.Item
                label="distance Limit(KM)"
                name={["cost", "distance_limit"]}
                rules={[
                  { required: true, message: "Please enter distance limit" },
                ]}
              >
                <Input placeholder="e.g., 1000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Order limit"
                name={["cost", "per_km_cost"]}
                rules={[
                  { required: true, message: "Please enter order limit" },
                ]}
              >
                <Input placeholder="e.g., 10" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
      <Form.Item style={{ textAlign: "end" }}>
        <Space>
          {step === 0 || (
            <Button
              htmlType="button"
              onClick={() => {
                setStep(0);
              }}
            >
              Back
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            onClick={handleSubmit}
          >
            {step === 0 ? "Next (1/2)" : isEditMode ? "Update" : "Submit"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddFleet;
