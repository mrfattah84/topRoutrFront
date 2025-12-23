import { Button, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { useAddVehicleMutation, useGetVehicleTypesQuery } from "./fleetApi";

const AddVehicle = ({ show, form }) => {
  const [addVehicle, { isLoading }] = useAddVehicleMutation();
  const { data: vehicleTypes, isLoading: isTypesLoading } =
    useGetVehicleTypesQuery();

  const handleItemSubmit = async () => {
    try {
      // Validate only the current item fields
      await form.validateFields([
        "name",
        "vehicle_type",
        "license_plate",
        "maxCapacity",
        "length",
        "height",
        "width",
        "limit_number_of_orders"
      ]);

      const vehicleData = form.getFieldsValue([
        "name",
        "vehicle_type",
        "license_plate",
        "maxCapacity",
        "length",
        "height",
        "width",
        "limit_number_of_orders"
      ]);
      console.log("vehicle data:", vehicleData);

      // Optionally call your API here if needed
      const res = await addVehicle(vehicleData);
      form.setFieldValue("vehicle", res.data.id);

      show(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Form.Item>
      <Form.Item
        label="Vehicle Name"
        name="name"
        rules={[{ required: true, message: "Please enter vehicle name" }]}
      >
        <Input placeholder="Enter vehicle name" />
      </Form.Item>
      <Form.Item
        label="Vehicle Type"
        name="vehicle_type"
        rules={[{ required: true, message: "Please select vehicle type" }]}
      >
        <Select
          placeholder="Select vehicle type"
          loading={isTypesLoading}
          options={vehicleTypes}
        />
      </Form.Item>
      <Form.Item
        label="License Plate"
        name="license_plate"
        rules={[{ required: true, message: "Please enter license plate" }]}
      >
        <Input placeholder="Enter license plate number" />
      </Form.Item>
      <Row gutter={8} style={{ width: "100%" }}>
        <Col span={12}>
          <Form.Item
            label="Max Capacity (kg)"
            name="maxCapacity"
            rules={[{ required: true, message: "Please enter max Capacity" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter max Capacity"
              min="0"
              step="0.01"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Length (m)"
            name="length"
            rules={[{ required: true, message: "Please enter length" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter length"
              min="0"
              step="0.01"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={8} style={{ width: "100%" }}>
        <Col span={12}>
          <Form.Item
            label="Height (m)"
            name="height"
            rules={[{ required: true, message: "Please enter height" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter height"
              min="0"
              step="0.01"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Width (m)"
            name="width"
            rules={[{ required: true, message: "Please enter width" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter width"
              min="0"
              step="0.01"
            />
          </Form.Item>
        </Col>
      </Row>
      <Col span={12}>
        <Form.Item
          label="Order limit"
          name="limit_number_of_orders"
          rules={[{ required: true, message: "Please enter order limit" }]}
        >
          <Input placeholder="e.g., 10" />
        </Form.Item>
      </Col>
      <Form.Item>
        <Row gutter={8} style={{ width: "100%" }}>
          <Col span={12}>
            <Button
              style={{ width: "100%" }}
              variant="solid"
              color="primary"
              onClick={handleItemSubmit}
              loading={isLoading}
            >
              Save
            </Button>
          </Col>
          <Col span={12}>
            <Button
              style={{ width: "100%" }}
              variant="outlined"
              color="danger"
              onClick={() => {
                form.resetFields([
                  "vehicleName",
                  "vehicleType",
                  "licensePlate",
                  "maxWeight",
                  "length",
                  "height",
                  "width",
                ]);
                show(false);
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form.Item>
  );
};

export default AddVehicle;
