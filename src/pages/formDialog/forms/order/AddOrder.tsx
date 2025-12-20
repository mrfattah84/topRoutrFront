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
import dayjs from "dayjs";
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
  const [showAddItem, setShowAddItem] = useState(null);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const format = "HH:mm";

  const handleSubmit = async () => {
    if (step === 0) {
      // Moving to step 1, validate current fields
      try {
        await form.validateFields([
          "title",
          "order_date",
          "source_id",
          "destination_id",
          "priority",
          "order_type",
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

        // Get all form values
        const allFormData = form.getFieldsValue(true);
        console.log("=== ORDER FORM SUBMISSION ===");
        console.log("Raw Form Data:", allFormData);

        // Format the data to match API schema
        const formattedData = {
          // Required fields
          source_id: allFormData.source_id,
          destination_id: allFormData.destination_id,
          title: allFormData.title,
          order_type: allFormData.order_type,
          priority: allFormData.priority,

          // Date fields
          order_date: allFormData.order_date,
          delivery_date: allFormData.delivery_date || null,

          // Time fields - format to ISO string
          delivery_time_from:
            allFormData.times && allFormData.times[0]?.time?.[0]
              ? allFormData.times[0].time[0].format("HH:mm:ss")
              : null,
          delivery_time_to:
            allFormData.times && allFormData.times[0]?.time?.[1]
              ? allFormData.times[0].time[1].format("HH:mm:ss")
              : null,

          // Optional fields
          description: allFormData.description || null,
          stop_time: allFormData.stop_time?.format("HH:mm:ss"),
          activated:
            allFormData.activated !== undefined ? allFormData.activated : true,

          // IDs (optional, can be null)
          driver_id: allFormData.driver_id || null,
          assigned_to_id: allFormData.assigned_to_id || null,
          cluster_id: allFormData.cluster_id || null,
          file_id: allFormData.file_id || null,

          // Order details
          delivery_order_sequence: allFormData.delivery_order_sequence || null,
          delivery_order: allFormData.delivery_order || null,
          delay_reason: allFormData.delay_reason || null,

          // Status fields
          assignment: allFormData.assignment || null,
          shipment_type: allFormData.shipment_type || null,

          // Item IDs array - extract from Items list
          // make it [item.itemId, item.quantity]
          order_item_id: allFormData.Items?.map((item) => item.itemId) || [],
        };

        // Console log all collected data
        console.log("Formatted Order Data:", formattedData);
        console.log("============================");

        // Call the mutation API
        const result = await createOrder(formattedData).unwrap();
        console.log("API Response:", result);

        // On success
        dispatch(setForm(""));
        setStep(0);
        form.resetFields();
      } catch (error) {
        console.error("Form submission failed:", error);
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
            label="Order Date"
            name="order_date"
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
                form.setFieldValue(
                  "order_date",
                  `${jalaali.jy}-${jalaali.jm}-${jalaali.jd}`
                );
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
              label="Origin Location"
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
              label="Destination Location"
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

          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={8}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: "Please select priority" }]}
                initialValue="1"
              >
                <Select
                  placeholder="Select priority"
                  options={[
                    { value: "1", label: "Low" },
                    { value: "2", label: "Medium" },
                    { value: "3", label: "High" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Order Type"
                name="order_type"
                rules={[
                  { required: true, message: "Please select order type" },
                ]}
                initialValue="standard"
              >
                <Select
                  placeholder="Select order type"
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "express", label: "Express" },
                    { value: "scheduled", label: "Scheduled" },
                    { value: "pickup", label: "Pickup" },
                    { value: "delivery", label: "Delivery" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Stop duration" name="stop_time">
                <TimePicker format={format} minuteStep={15} />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item label="Delivery Time Window">
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
                      Add Time Window
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
          {step === 0 || (
            <Button
              htmlType="button"
              onClick={() => {
                setStep(0);
              }}
            >
              Back
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {step === 0 ? "Next (1/2)" : "Submit"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddOrder;
