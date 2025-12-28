import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
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
import AddDriver from "./AddDriver";
import ZoneSelector from "./zoneSelector";

const AddFleet = ({ id = null }) => {
  const [step, setStep] = useState(0);
  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);

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
        // Step 0 fields
        vehicle: fleetData.vehicle?.id || fleetData.vehicle?.uuid,
        driver: fleetData.driver?.id, // Assuming driver selector uses email as value
        start_location: fleetData.start_location?.id,
        end_location: fleetData.end_location?.id,

        // Working hours - convert work_schedule times to dayjs range
        scedule:
          fleetData.work_schedule?.start_time_1 &&
          fleetData.work_schedule?.end_time_1
            ? [
                parseTime(fleetData.work_schedule.start_time_1),
                parseTime(fleetData.work_schedule.end_time_1),
              ]
            : undefined,

        // Step 1 fields - Cost data
        cost: {
          fixed_cost: fleetData.cost?.fixed_cost,
          per_km_cost: fleetData.cost?.per_km_cost,
          per_hour_cost: fleetData.cost?.per_hour_cost,
          per_hour_overtime_cost: fleetData.cost?.per_hour_overtime_cost,
          distance_limit: fleetData.cost?.distance_limit,
        },
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
        console.log("=== FLEET FORM SUBMISSION ===");
        console.log("Raw Form Data:", allFormData);
        console.log("Vehicle value type:", typeof allFormData.vehicle, "Value:", allFormData.vehicle);
        console.log("Is vehicle an array?", Array.isArray(allFormData.vehicle));

        const cost = await createCosts(allFormData.cost).unwrap();

        const scedule = await createWorkScedule({
          name: "idk",
          start_time_1: allFormData.scedule[0].format("HH:mm:ss"),
          end_time_1: allFormData.scedule[1].format("HH:mm:ss"),
        }).unwrap();

        // Format the data to match API schema
        const formattedData: any = {
          // Required fields
          driver_user: allFormData.driver,
          vehicle: allFormData.vehicle, // Ensure it's a string UUID, not an array
          owner: "304134c1-de91-4224-98f5-bc594946a8af",
          // Convert undefined to null for optional fields
          start_location: allFormData.start_location || null,
          end_location: allFormData.end_location || null,
          cost: cost.id,
          work_schedule: scedule.id,
        };

        // Ensure vehicle is a string, not an array
        if (Array.isArray(formattedData.vehicle)) {
          formattedData.vehicle = formattedData.vehicle[0];
        }
        if (typeof formattedData.vehicle !== 'string' && formattedData.vehicle) {
          formattedData.vehicle = String(formattedData.vehicle);
        }

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
      } catch (error: any) {
        console.error("Form submission failed:", error);
        // Extract and display error message
        let errorMessage = "Failed to create fleet. Please try again.";
        if (error?.data) {
          const errorData = error.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.vehicle) {
            errorMessage = `Vehicle error: ${Array.isArray(errorData.vehicle) ? errorData.vehicle.join(', ') : errorData.vehicle}`;
          } else if (errorData.driver_user) {
            errorMessage = `Driver error: ${Array.isArray(errorData.driver_user) ? errorData.driver_user.join(', ') : errorData.driver_user}`;
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors.join(', ') 
              : errorData.non_field_errors;
          } else {
            // Try to get first error message
            const firstKey = Object.keys(errorData)[0];
            if (firstKey) {
              const firstError = errorData[firstKey];
              errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError.join(', ') : firstError}`;
            }
          }
        }
        alert(errorMessage);
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
          {showAddDriver ? (
            <AddDriver form={form} show={setShowAddDriver} />
          ) : (
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
                        onClick={() => setShowAddDriver(true)}
                        style={{ width: "100%" }}
                      >
                        Add New DriverUser
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>
          )}

          {showAddOrigin ? (
            <Form.Item label="Add Start Location">
              <AddAddress setShowAddAddress={setShowAddOrigin} />
            </Form.Item>
          ) : (
            <Form.Item label="Start Location" name="start_location">
              <AddressSelector
                name="start_location"
                onAddAddress={() => setShowAddOrigin(true)}
              />
            </Form.Item>
          )}
          <Form.Item name="depotStart">
            <Checkbox>use depot as start</Checkbox>
          </Form.Item>

          {showAddDestination ? (
            <Form.Item label="Add End Location">
              <AddAddress setShowAddAddress={setShowAddDestination} />
            </Form.Item>
          ) : (
            <Form.Item label="End Location" name="end_location">
              <AddressSelector
                name="end_location"
                onAddAddress={() => setShowAddDestination(true)}
              />
            </Form.Item>
          )}
          <Form.Item name="depotEnd">
            <Checkbox>use depot as end</Checkbox>
          </Form.Item>
          <Form.Item
            label="Working hours"
            name="scedule"
            rules={[{ required: true, message: "Please enter working hour" }]}
          >
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

          <Form.Item
            label="distance Limit(KM)"
            name={["cost", "distance_limit"]}
          >
            <Input placeholder="e.g., 1000" />
          </Form.Item>
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
