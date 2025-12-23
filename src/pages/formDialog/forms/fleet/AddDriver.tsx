import { Button, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { useSignupMutation } from "../../../auth/authApi";

const AddDriver = ({ form, show }) => {
  const [addDriver, { isLoading }] = useSignupMutation();

  const handleItemSubmit = async () => {
    try {
      // Validate only the current item fields
      await form.validateFields(["first_name", "last_name", "email", "phone"]);

      const userData = {
        ...form.getFieldsValue(["first_name", "last_name", "email", "phone"]),
        role: "driver",
      };
      console.log("user data:", userData);

      // Optionally call your API here if needed
      const res = await addDriver(userData);
      form.setFieldValue("driver", res.data.user.id);

      show(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Form.Item>
      <Row gutter={8} style={{ width: "100%" }}>
        <Col span={12}>
          <Form.Item
            label="First name"
            name="first_name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Last name"
            name="last_name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={8} style={{ width: "100%" }}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter email" }]}
          >
            <Input placeholder="Enter users email" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Please enter phone" }]}
          >
            <Input placeholder="Enter users phone" />
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
                form.resetFields(["first_name", "last_name", "email", "phone"]);
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

export default AddDriver;
