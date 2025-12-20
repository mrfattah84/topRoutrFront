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
  Row,
  Select,
  Space,
  TimePicker,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Calendar from "../../../../components/Calendar";
import AddAddress from "../AddAddress";
import AddressSelector from "./AddressSelector";
import { useSelector, useDispatch } from "react-redux";
import { setForm } from "../../dialogSlice";
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useGetOrderQuery,
} from "./orderApi";
import CustomOrder from "./CustomOrder";
import Box from "./Box";

const AddOrder = ({ id = null }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState(0);
  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [showAddItem, setShowAddItem] = useState(null);

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  // Only fetch if id exists
  const { data: orderData, isLoading: isFetching } = useGetOrderQuery(id, {
    skip: !id,
  });

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const format = "HH:mm";
  const isEditMode = !!id;
  const isLoading = isCreating || isUpdating;

  // Reset form when switching between add/edit modes or when id changes
  useEffect(() => {
    // Reset form and state
    form.resetFields();
    setStep(0);
    setShowCalendar(false);
    setShowAddOrigin(false);
    setShowAddDestination(false);
    setShowAddItem(null);

    console.log(
      `Form reset - Mode: ${id ? "Edit" : "Add"}, ID: ${id || "N/A"}`
    );
  }, [id, form]);

  // Populate form when editing
  useEffect(() => {
    if (orderData && isEditMode) {
      // Parse time string to dayjs object
      const parseTime = (timeString) => {
        if (!timeString) return null;
        // Handle both "HH:mm:ss" and ISO format
        return dayjs(timeString, "HH:mm:ss");
      };

      // Deformat the API data back to form structure
      const deformattedData = {
        // Basic fields - direct mapping
        title: orderData.title,
        source_id: orderData.source.uid,
        destination_id: orderData.destination.uid,
        priority: orderData.priority,
        order_type: orderData.order_type,
        description: orderData.description,

        // Date field - keep as string (already in YYYY-MM-DD format)
        order_date: orderData.order_date,
        delivery_date: orderData.delivery_date,

        // Time fields - convert string to dayjs
        stop_time: parseTime(orderData.stop_time),

        // Time windows - convert delivery_time_from/to to times array structure
        times:
          orderData.delivery_time_from && orderData.delivery_time_to
            ? [
                {
                  time: [
                    parseTime(orderData.delivery_time_from),
                    parseTime(orderData.delivery_time_to),
                  ],
                },
              ]
            : [],

        // Items - map order_item_id array back to Items structure
        // Note: This assumes you have a way to fetch full item details from IDs
        // If the API returns full order_items, map those instead
        Items: orderData.order_items
          ? orderData.order_items.map((item) => ({
              itemId: item.id,
              item_title: item.title,
              description: item.description,
              weight: item.weight,
              length: item.length,
              width: item.width,
              height: item.height,
              quantity: item.quantity,
            }))
          : orderData.order_item_id
          ? orderData.order_item_id.map((itemId) => ({
              itemId: itemId,
              // You'll need to fetch other item details or leave them empty
            }))
          : [],

        // Optional fields that might be in the API response
        activated: orderData.activated,
        driver_id: orderData.driver_id,
        assigned_to_id: orderData.assigned_to_id,
        cluster_id: orderData.cluster_id,
        file_id: orderData.file_id,
        delivery_order_sequence: orderData.delivery_order_sequence,
        delivery_order: orderData.delivery_order,
        delay_reason: orderData.delay_reason,
        assignment: orderData.assignment,
        shipment_type: orderData.shipment_type,
      };

      // Set form values with deformatted data
      form.setFieldsValue(deformattedData);

      console.log("=== FORM POPULATED FOR EDITING ===");
      console.log("Original API Data:", orderData);
      console.log("Deformatted Form Data:", deformattedData);
      console.log("============================");
    }
  }, [orderData, isEditMode, form]);

  // Cleanup: Reset form and state when component unmounts
  useEffect(() => {
    return () => {
      form.resetFields();
      setStep(0);
      setShowCalendar(false);
      setShowAddOrigin(false);
      setShowAddDestination(false);
      setShowAddItem(null);
      console.log("Form cleaned up on unmount");
    };
  }, [form]);

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
          order_item_id: allFormData.Items?.map((item) => item.itemId) || [],
        };

        // Console log all collected data
        console.log("Formatted Order Data:", formattedData);
        console.log("============================");

        // Call the appropriate mutation API
        const result = isEditMode
          ? await updateOrder({ id, data: formattedData }).unwrap()
          : await createOrder(formattedData).unwrap();

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

  // Show loading spinner while fetching order data
  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Loading order data...</p>
      </div>
    );
  }

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
                  ? form.getFieldValue("order_date")
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
                  `${jalaali.jy}-${String(jalaali.jm).padStart(
                    2,
                    "0"
                  )}-${String(jalaali.jd).padStart(2, "0")}`
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
                initialValue="medium"
              >
                <Select
                  placeholder="Select priority"
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
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
            {step === 0 ? "Next (1/2)" : isEditMode ? "Update" : "Submit"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddOrder;
