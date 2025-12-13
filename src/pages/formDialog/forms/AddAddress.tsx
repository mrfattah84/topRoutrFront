import { Input, Row, Col, Button, Form, InputNumber } from "antd";
import { useState } from "react";
import LocationPicker from "../../../components/LocationPicker";

const AddAddress = ({ setShowAddAddress }) => {
  const [lat, setLat] = useState(35.7448);
  const [lng, setLng] = useState(51.3753);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleAddressSubmit = () => {
    console.log("addi submit", name, address, lat, lng);
    setShowAddAddress(false);
  };

  return (
    <Form.Item>
      <Form.Item label="Name">
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="Adderess">
        <Input
          placeholder="Enter adderess"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="Location">
        <Row gutter={8} style={{ width: "100%" }}>
          <Col span={12}>
            <Form.Item label="latitude">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter latitude"
                min="-90"
                max="90"
                step="0.0001"
                value={lat}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="longitude">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter longitude"
                min="-180"
                max="180"
                step="0.0001"
                value={lng}
              />
            </Form.Item>
          </Col>
        </Row>
        <LocationPicker
          value={{
            latitude: lat,
            longitude: lng,
          }}
          onChange={(p) => {
            setLat(p.latitude);
            setLng(p.longitude);
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
            >
              Save
            </Button>
          </Col>
          <Col span={12}>
            <Button
              style={{ width: "100%" }}
              variant="outlined"
              color="danger"
              onClick={() => setShowAddAddress(false)}
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
