import {
  CalendarOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  TimePicker,
} from "antd";
import { useEffect, useState } from "react";
import Calendar from "../../../data/Calendar";
import AddAddress from "../AddAddress";
import AddressSelector from "./AddressSelector";
import { useSelector, useDispatch } from "react-redux";
import {
  resetSubmit,
  selectShouldSubmit,
  setSubmitSuccess,
  setSubmitting,
} from "../../dialogSlice";

const AddOrder = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState(0);
  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const shouldSubmit = useSelector(selectShouldSubmit);

  const format = "HH:mm:ss";

  const handleSubmit = async () => {
    if (step === 0) {
      // Moving to step 1, validate current fields
      try {
        await form.validateFields([
          "date",
          "originLocation",
          "destinationLocation",
          "volume",
          "quantity",
          "limitNumberOfOrders",
          "description",
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

        // Set loading state
        dispatch(setSubmitting(true));

        // Get all form values
        const allFormData = form.getFieldsValue(true);

        // Format the data for better readability
        const formattedData = {
          // Step 0 data
          date: allFormData.date,
          originLocation: allFormData.originLocation,
          destinationLocation: allFormData.destinationLocation,
          volume: allFormData.volume,
          quantity: allFormData.quantity,
          limitNumberOfOrders: allFormData.limitNumberOfOrders,
          description: allFormData.description,

          // Step 1 data
          weight: allFormData.weight,
          length: allFormData.length,
          width: allFormData.width,
          height: allFormData.height,
          priority: allFormData.priority,
          timeWindows: allFormData.times,
          orderType: allFormData.orderType,
        };

        // Console log all collected data
        console.log("=== ORDER FORM SUBMISSION ===");
        console.log("All Form Data:", formattedData);
        console.log("Raw Form Data:", allFormData);
        console.log("============================");

        // Simulate API call (replace with your actual API call)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // On success
        setStep(0);
        form.resetFields();
        dispatch(setSubmitting(false));
        dispatch(setSubmitSuccess(true));
      } catch (error) {
        // On error
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
            label="Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <Input
              placeholder="Enter date"
              suffix={<CalendarOutlined />}
              value={
                form.getFieldValue("date")
                  ? `${form.getFieldValue("date").jd}/${
                      form.getFieldValue("date").jm
                    }/${form.getFieldValue("date").jy}`
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
              selectedDate={form.getFieldValue("date")}
              onDateSelect={(date, jalaali) => {
                form.setFieldValue("date", jalaali);
                setShowCalendar(false);
              }}
            />
          )}

          {showAddOrigin ? (
            <Form.Item label="Add Origin Address">
              <AddAddress setShowAddAddress={setShowAddOrigin} />
            </Form.Item>
          ) : (
            <Form.Item
              label="Origin location"
              name="originLocation"
              rules={[
                { required: true, message: "Please select origin location" },
              ]}
            >
              <AddressSelector
                name="originLocation"
                onAddAddress={() => setShowAddOrigin(true)}
              />
            </Form.Item>
          )}

          {showAddDestination ? (
            <Form.Item label="Add Destination Address">
              <AddAddress setShowAddAddress={setShowAddDestination} />
            </Form.Item>
          ) : (
            <Form.Item
              label="Destination location"
              name="destinationLocation"
              rules={[
                {
                  required: true,
                  message: "Please select destination location",
                },
              ]}
            >
              <AddressSelector
                name="destinationLocation"
                onAddAddress={() => setShowAddDestination(true)}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Volume"
            name="volume"
            rules={[{ required: true, message: "Please enter volume" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter volume"
              min="0"
              step="0.01"
            />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter quantity"
              min="0"
              step="1"
            />
          </Form.Item>

          <Form.Item label="Limit number of orders" name="limitNumberOfOrders">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter limit number of orders"
              min="0"
              step="1"
            />
          </Form.Item>

          <Form.Item label="Order Description" name="description">
            <Input.TextArea placeholder="Enter order description" rows={4} />
          </Form.Item>
        </>
      ) : (
        <>
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <Form.Item
                label="weight"
                name="weight"
                rules={[{ required: true, message: "Please enter weight" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter weight"
                  min="0"
                  step="0.01"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="length"
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
                label="width"
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
            <Col span={12}>
              <Form.Item
                label="height"
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
          </Row>
          <Form.Item
            label="priority"
            name="priority"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select
              placeholder="select priority"
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Time window">
            <Form.List name="times">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "time"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing time window",
                          },
                        ]}
                      >
                        <TimePicker.RangePicker format={format} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add field
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item
            label="Order type"
            name="orderType"
            rules={[{ required: true, message: "Please select order type" }]}
          >
            <Select
              placeholder="select order type"
              options={[
                { value: "delivery", label: "Delivery" },
                { value: "pickUp", label: "Pick up" },
                { value: "service", label: "Service" },
              ]}
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default AddOrder;
