import {
  CalendarOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  TimePicker,
} from "antd";
import { useEffect, useState } from "react";
import Calendar from "../../../../components/Calendar";
import AddAddress from "../AddAddress";
import AddressSelector from "./AddressSelector";
import { useSelector, useDispatch } from "react-redux";
import { setForm } from "../../dialogSlice";
import { useCreateOrderMutation, useGetItemsQuery } from "./orderApi";
import CustomOrder from "./CustomOrder";
import Box from "./Box";

const AddOrder = ({ id = 0 }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState(0);
  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [showAddItem, setShowAddItem] = useState(-1);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const format = "HH:mm";

  const handleSubmit = async () => {
    if (step === 0) {
      // Moving to step 1, validate current fields
      try {
        await form.validateFields(["date"]);
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

        // Get all form values
        const allFormData = form.getFieldsValue(true);
        console.log("=== ORDER FORM SUBMISSION ===");
        console.log("Raw Form Data:", allFormData);

        // Format the data for better readability
        const formattedData = {
          // Step 0 data
          title: allFormData.title,
          order_date: `${allFormData.date.jy}-${allFormData.date.jm}-${allFormData.date.jd}`,
          source_id: allFormData.originLocation,
          destination_id: allFormData.destinationLocation,
          volume: allFormData.volume,
          quantity: allFormData.quantity,
          description: allFormData.description,

          // Step 1 data
          weight: allFormData.weight,
          length: allFormData.length,
          width: allFormData.width,
          height: allFormData.height,
          priority: allFormData.priority,
          delivery_time_from: `${allFormData.times[0].time[0].hour()}:${allFormData.times[0].time[0].minute()}`,
          delivery_time_to: `${allFormData.times[0].time[1].hour()}:${allFormData.times[0].time[1].minute()}`,
          order_type: allFormData.orderType,
        };

        // Console log all collected data
        console.log("All Form Data:", formattedData);
        console.log("============================");

        // Call the mutation API
        const result = await createOrder(formattedData).unwrap();
        console.log("API Response:", result);

        // On success
        dispatch(setForm(""));
        setStep(0);
        form.resetFields();
      } catch (error) {
        console.error("Form validation failed:", error);
      }
    }
  };

  return (
    <Form layout="vertical" form={form} onSubmitCapture={handleSubmit}>
      {step === 0 ? (
        <>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input style={{ width: "100%" }} placeholder="Enter title" />
          </Form.Item>
          <Form.Item
            label="Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <Input
              placeholder="Enter date"
              suffix={<CalendarOutlined />}
              value={
                form.getFieldValue("order_date")
                  ? `${form.getFieldValue("order_date").jd}/${
                      form.getFieldValue("order_date").jm
                    }/${form.getFieldValue("order_date").jy}`
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
              selectedDate={form.getFieldValue("order_date")}
              onDateSelect={(date, jalaali) => {
                form.setFieldValue("order_date", jalaali);
                setShowCalendar(false);
              }}
            />
          )}

          {showAddOrigin ? (
            <Form.Item label="Add Origin Address">
              <AddAddress
                show={setShowAddOrigin}
                form={form}
                type="source_id"
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Origin location"
              name="source_id"
              rules={[
                { required: true, message: "Please select origin location" },
              ]}
            >
              <AddressSelector
                name="source_id"
                onAddAddress={() => setShowAddOrigin(true)}
              />
            </Form.Item>
          )}

          {showAddDestination ? (
            <Form.Item label="Add Destination Address">
              <AddAddress
                show={setShowAddDestination}
                form={form}
                type="destination_id"
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Destination location"
              name="destination_id"
              rules={[
                {
                  required: true,
                  message: "Please select destination location",
                },
              ]}
            >
              <AddressSelector
                name="destination_id"
                onAddAddress={() => setShowAddDestination(true)}
              />
            </Form.Item>
          )}

          <Form.Item
            label="priority"
            name="priority"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select
              placeholder="select priority"
              defaultValue={"medium"}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Order type"
            name="order_type"
            rules={[{ required: true, message: "Please select order type" }]}
          >
            <Select
              placeholder="select order type"
              options={[
                { value: "standard", label: "Standard" },
                { value: "express", label: "Express" },
                { value: "scheduled", label: "Scheduled" },
                { value: "pickup", label: "Pickup" },
                { value: "delivery", label: "Delivery" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Order Description" name="description">
            <Input.TextArea placeholder="Enter order description" rows={4} />
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item label="Order Items">
            <Form.List name="Items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key}>
                      {showAddItem === name ? (
                        <CustomOrder
                          show={setShowAddItem}
                          form={form}
                          name={name}
                        />
                      ) : (
                        <Box
                          name={name}
                          remove={remove}
                          setShowAddItem={setShowAddItem}
                        />
                      )}
                    </div>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      onClick={() => {
                        add();
                        setShowAddItem(fields.length);
                      }}
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Item
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
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
                        <TimePicker.RangePicker
                          format={format}
                          minuteStep={15}
                        />
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
        </>
      )}
      <Form.Item style={{ textAlign: "end" }}>
        <Space>
          {step == 0 || (
            <Button
              htmlType="button"
              onClick={() => {
                setStep(0);
              }}
            >
              back
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {step == 0 ? "Next(1/2)" : "Submit"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddOrder;
