import { CalendarOutlined } from "@ant-design/icons";
import { Col, Form, Input, InputNumber, Row, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import Calendar from "../../../../components/Calendar";
import AddAddress from "../AddAddress";
import AddressSelector from "../order/AddressSelector";
import { useSelector, useDispatch } from "react-redux";
import {
  resetSubmit,
  selectShouldSubmit,
  setSubmitSuccess,
  setSubmitting,
} from "../../dialogSlice";

const AddFleet = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState(0);
  const [showAddDepot, setShowAddDepot] = useState(false);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const shouldSubmit = useSelector(selectShouldSubmit);

  const handleSubmit = async () => {
    if (step === 0) {
      // Moving to step 1, validate current fields
      try {
        await form.validateFields([
          "vehicleId",
          "vehicleName",
          "vehicleType",
          "licensePlate",
          "driverName",
          "driverPhone",
        ]);
        setStep(1);
      } catch (error) {
        console.error("Step 0 validation failed:", error);
      }
    } else {
      // Final submission
      try {
        await form.validateFields();
        dispatch(setSubmitting(true));

        const allFormData = form.getFieldsValue(true);

        const formattedData = {
          // Step 0 data
          vehicleId: allFormData.vehicleId,
          vehicleName: allFormData.vehicleName,
          vehicleType: allFormData.vehicleType,
          licensePlate: allFormData.licensePlate,
          driverName: allFormData.driverName,
          driverPhone: allFormData.driverPhone,

          // Step 1 data
          capacity: allFormData.capacity,
          maxWeight: allFormData.maxWeight,
          maxVolume: allFormData.maxVolume,
          fuelType: allFormData.fuelType,
          depotLocation: allFormData.depotLocation,
          workingHoursStart: allFormData.workingHoursStart,
          workingHoursEnd: allFormData.workingHoursEnd,
          availableDate: allFormData.availableDate,
          status: allFormData.status,
          isActive: allFormData.isActive,
        };

        console.log("=== FLEET FORM SUBMISSION ===");
        console.log("All Form Data:", formattedData);
        console.log("Raw Form Data:", allFormData);
        console.log("============================");

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // On success
        setStep(0);
        form.resetFields();
        dispatch(setSubmitting(false));
        dispatch(setSubmitSuccess(true));
      } catch (error) {
        console.error("Form validation failed:", error);
        dispatch(setSubmitting(false));
      }
    }
  };

  useEffect(() => {
    if (shouldSubmit) {
      handleSubmit();
      dispatch(resetSubmit());
    }
  }, [shouldSubmit, dispatch]);

  return (
    <Form layout="vertical" form={form}>
      {step === 0 ? (
        <>
          <Form.Item
            label="Vehicle ID"
            name="vehicleId"
            rules={[{ required: true, message: "Please enter vehicle ID" }]}
          >
            <Input placeholder="Enter vehicle ID (e.g., VEH-001)" />
          </Form.Item>

          <Form.Item
            label="Vehicle Name"
            name="vehicleName"
            rules={[{ required: true, message: "Please enter vehicle name" }]}
          >
            <Input placeholder="Enter vehicle name" />
          </Form.Item>

          <Form.Item
            label="Vehicle Type"
            name="vehicleType"
            rules={[{ required: true, message: "Please select vehicle type" }]}
          >
            <Select
              placeholder="Select vehicle type"
              options={[
                { value: "truck", label: "Truck" },
                { value: "van", label: "Van" },
                { value: "pickup", label: "Pickup" },
                { value: "motorcycle", label: "Motorcycle" },
                { value: "bicycle", label: "Bicycle" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="License Plate"
            name="licensePlate"
            rules={[{ required: true, message: "Please enter license plate" }]}
          >
            <Input placeholder="Enter license plate number" />
          </Form.Item>

          <Form.Item
            label="Driver Name"
            name="driverName"
            rules={[{ required: true, message: "Please enter driver name" }]}
          >
            <Input placeholder="Enter driver name" />
          </Form.Item>

          <Form.Item
            label="Driver Phone"
            name="driverPhone"
            rules={[
              { required: true, message: "Please enter driver phone" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input placeholder="Enter driver phone (e.g., 09123456789)" />
          </Form.Item>
        </>
      ) : (
        <>
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <Form.Item
                label="Capacity (units)"
                name="capacity"
                rules={[{ required: true, message: "Please enter capacity" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter capacity"
                  min="0"
                  step="1"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Max Weight (kg)"
                name="maxWeight"
                rules={[{ required: true, message: "Please enter max weight" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter max weight"
                  min="0"
                  step="0.01"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Max Volume (m³)"
            name="maxVolume"
            rules={[{ required: true, message: "Please enter max volume" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter max volume"
              min="0"
              step="0.01"
            />
          </Form.Item>

          <Form.Item
            label="Fuel Type"
            name="fuelType"
            rules={[{ required: true, message: "Please select fuel type" }]}
          >
            <Select
              placeholder="Select fuel type"
              options={[
                { value: "gasoline", label: "Gasoline" },
                { value: "diesel", label: "Diesel" },
                { value: "electric", label: "Electric" },
                { value: "hybrid", label: "Hybrid" },
                { value: "cng", label: "CNG" },
              ]}
            />
          </Form.Item>

          {showAddDepot ? (
            <Form.Item label="Add Depot Location">
              <AddAddress setShowAddAddress={setShowAddDepot} />
            </Form.Item>
          ) : (
            <Form.Item
              label="Depot Location"
              name="depotLocation"
              rules={[
                { required: true, message: "Please select depot location" },
              ]}
            >
              <AddressSelector
                name="depotLocation"
                onAddAddress={() => setShowAddDepot(true)}
              />
            </Form.Item>
          )}

          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <Form.Item
                label="Working Hours Start"
                name="workingHoursStart"
                rules={[{ required: true, message: "Please enter start time" }]}
              >
                <Input placeholder="e.g., 08:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Working Hours End"
                name="workingHoursEnd"
                rules={[{ required: true, message: "Please enter end time" }]}
              >
                <Input placeholder="e.g., 18:00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Available From Date">
            <Input
              placeholder="Select date"
              suffix={<CalendarOutlined />}
              value={
                form.getFieldValue("availableDate")
                  ? `${form.getFieldValue("availableDate").jd}/${
                      form.getFieldValue("availableDate").jm
                    }/${form.getFieldValue("availableDate").jy}`
                  : ""
              }
              onClick={() => {
                setShowCalendar(!showCalendar);
              }}
              readOnly
            />
          </Form.Item>
          {showCalendar && (
            <Calendar
              className="mt-2"
              selectedDate={form.getFieldValue("availableDate")}
              onDateSelect={(date, jalaali) => {
                form.setFieldValue("availableDate", jalaali);
                setShowCalendar(false);
              }}
            />
          )}

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
            initialValue="available"
          >
            <Select
              placeholder="Select status"
              options={[
                { value: "available", label: "Available" },
                { value: "in_use", label: "In Use" },
                { value: "maintenance", label: "Maintenance" },
                { value: "unavailable", label: "Unavailable" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Active"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default AddFleet;
