import { Input, Row, Col, Button, Form, InputNumber } from "antd";
import { useState } from "react";
import LocationPicker from "../../../components/LocationPicker";
import { useAddAddressMutation } from "./order/orderApi";

const AddAddress = ({ show, form, type }) => {
  const [addAddress, { isLoading }] = useAddAddressMutation();
  form.setFieldsValue({
    addressForm: {
      location_data: {
        latitude: 35.7448,
        longitude: 51.3753,
      },
    },
  });

  const handleAddressSubmit = async () => {
    console.log(form.getFieldValue("addressForm"));
    const res = await addAddress(form.getFieldValue("addressForm"));
    show(false);
    form.resetFields(["addressForm"]);
    form.setFieldValue(type, res.data.uid);
  };

  return (
    <Form.Item>
      <Form.Item label="Name" name={["addressForm", "title"]}>
        <Input placeholder="Enter name" />
      </Form.Item>
      <Form.Item label="Adderess" name={["addressForm", "description"]}>
        <Input placeholder="Enter adderess" />
      </Form.Item>
      <Form.Item label="Location" name={["addressForm", "location_data"]}>
        <Row gutter={8} style={{ width: "100%" }}>
          <Col span={12}>
            <Form.Item
              label="latitude"
              name={["addressForm", "location_data", "latitude"]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter latitude"
                min="-90"
                max="90"
                step="0.0001"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="longitude"
              name={["addressForm", "location_data", "longitude"]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter longitude"
                min="-180"
                max="180"
                step="0.0001"
              />
            </Form.Item>
          </Col>
        </Row>
        <LocationPicker
          value={form.getFieldValue(["addressForm", "location_data"])}
          onChange={(p) => {
            form.setFieldsValue({
              addressForm: {
                location_data: {
                  latitude: p.latitude,
                  longitude: p.longitude,
                },
              },
            });
          }}
        />
      </Form.Item>
      <Form.Item>
        <Row gutter={8} style={{ width: "100%" }}>
          <Col span={12}>
            <Button
              style={{ width: "100%" }}
              variant="solid"
              color="primary"
              onClick={handleAddressSubmit}
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
                show(false);
                form.resetFields(["addressForm"]);
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

export default AddAddress;
