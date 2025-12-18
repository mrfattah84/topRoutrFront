import { Button, Col, Form, Row, Select } from "antd";
import React from "react";
import { useGetAddressesQuery } from "./orderApi";

interface AddressSelectorProps {
  name: string;
  onAddAddress: () => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  name,
  onAddAddress,
}) => {
  const { data, error, isLoading } = useGetAddressesQuery();

  return (
    <Row gutter={8} style={{ width: "100%" }}>
      <Col span={18}>
        <Form.Item name={name} noStyle>
          <Select
            showSearch={{ optionFilterProp: "label" }}
            placeholder="Search in address"
            options={data}
            loading={isLoading}
          />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Button style={{ width: "100%" }} onClick={onAddAddress}>
          Add address
        </Button>
      </Col>
    </Row>
  );
};

export default AddressSelector;
