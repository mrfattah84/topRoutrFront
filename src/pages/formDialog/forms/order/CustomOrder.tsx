import { Button, Col, Form, Input, InputNumber, Row } from "antd";
import { useAddItemMutation } from "./orderApi";

const CustomOrder = ({ show, form, name }) => {
  const [addItem, { isLoading }] = useAddItemMutation();

  const handleItemSubmit = async () => {
    try {
      // Validate only the current item fields
      await form.validateFields([
        ["Items", name, "item_title"],
        ["Items", name, "description"],
        ["Items", name, "weight"],
        ["Items", name, "length"],
        ["Items", name, "width"],
        ["Items", name, "height"],
      ]);

      const itemData = form.getFieldValue(["Items", name]);
      console.log("Item data:", itemData);

      // Optionally call your API here if needed
      const res = await addItem(itemData);

      show(null);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <Form.Item
        label="Title"
        name={[name, "item_title"]}
        rules={[{ required: true, message: "Please enter title" }]}
      >
        <Input style={{ width: "100%" }} placeholder="Enter title" />
      </Form.Item>

      <Form.Item
        label="Description"
        name={[name, "description"]}
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea
          style={{ width: "100%" }}
          placeholder="Enter description"
          rows={3}
        />
      </Form.Item>

      <Row gutter={8} style={{ width: "100%" }}>
        <Col span={12}>
          <Form.Item
            label="Weight"
            name={[name, "weight"]}
            rules={[{ required: true, message: "Please enter weight" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter weight"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Length"
            name={[name, "length"]}
            rules={[{ required: true, message: "Please enter length" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter length"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8} style={{ width: "100%" }}>
        <Col span={12}>
          <Form.Item
            label="Width"
            name={[name, "width"]}
            rules={[{ required: true, message: "Please enter width" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter width"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Height"
            name={[name, "height"]}
            rules={[{ required: true, message: "Please enter height" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter height"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
      </Row>

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
                  ["Items", name, "item_title"],
                  ["Items", name, "description"],
                  ["Items", name, "weight"],
                  ["Items", name, "length"],
                  ["Items", name, "width"],
                  ["Items", name, "height"],
                ]);
                show(null);
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </div>
  );
};

export default CustomOrder;
