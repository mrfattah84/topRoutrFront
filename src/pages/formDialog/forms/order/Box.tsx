import { Button, Col, Form, InputNumber, Row, Select, Space } from "antd";
import { useGetItemsQuery } from "./orderApi";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const Box = ({ name, setShowAddItem, remove }) => {
  const { data, isLoading } = useGetItemsQuery();

  return (
    <Space
      style={{
        display: "flex",
        marginBottom: 8,
        width: "100%",
      }}
      align="baseline"
    >
      <Row gutter={8} style={{ flex: 1 }}>
        <Col span={16}>
          <Form.Item
            name={[name, "itemId"]}
            rules={[
              {
                required: true,
                message: "Please select an item",
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Select
              showSearch
              placeholder="Search and select item"
              options={data}
              loading={isLoading}
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
                      onClick={() => setShowAddItem(name)}
                      style={{ width: "100%" }}
                    >
                      Add New Item
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={[name, "quantity"]}
            rules={[
              {
                required: true,
                message: "Qty required",
              },
              {
                type: "number",
                min: 1,
                message: "Quantity must be at least 1",
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Quantity"
              min={1}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <MinusCircleOutlined
        onClick={() => remove(name)}
        style={{ color: "#ff4d4f" }}
      />
    </Space>
  );
};

export default Box;
