import React from "react";
import { selectFocus, setFocus } from "./mapSlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetOrderQuery } from "../formDialog/forms/order/orderApi"; // Assuming this hook fetches the data structure you provided
import { Button, Card, Descriptions, Spin, Tag, Typography } from "antd";
import {
  CloseOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const Description = () => {
  const focus = useSelector(selectFocus);
  const { data: order, isLoading } = useGetOrderQuery(focus.id, {
    skip: !focus.id,
  });
  const dispatch = useDispatch();

  if (!focus.id) {
    return null; // Don't render anything if no item is focused
  }

  if (isLoading) {
    // A small loading indicator is better than a full-page one here
    return (
      <div className="absolute top-5 right-5" style={{ zIndex: 20 }}>
        <Card style={{ width: 350 }}>
          <Spin />
        </Card>
      </div>
    );
  }
  console.log(order);

  const onClose = () => {
    dispatch(setFocus({}));
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "1") return "red";
    if (priority === "2") return "orange";
    return "green";
  };

  return (
    <div className="absolute top-5 right-5" style={{ zIndex: 20 }}>
      <Card
        title={
          <div className="flex justify-between items-center gap-2">
            <Typography.Text className=" font-bold" ellipsis>
              Order: {order.order_number || order.order_id}
            </Typography.Text>
            <Tag color={getPriorityColor(order.priority)}>
              Priority: {order.priority}
            </Tag>
          </div>
        }
        extra={
          <Button shape="circle" icon={<CloseOutlined />} onClick={onClose} />
        }
        style={{
          width: 350,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined className="mr-2" />
                Source
              </>
            }
          >
            {order.source?.description || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined className="mr-2" />
                Destination
              </>
            }
          >
            {order.destination?.description || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <CalendarOutlined className="mr-2" />
                Order Date
              </>
            }
          >
            {order.order_date || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <CalendarOutlined className="mr-2" />
                Delivery Date
              </>
            }
          >
            {order.delivery_date || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Time">
            {order.delivery_time_from} - {order.delivery_time_to}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <ClockCircleOutlined className="mr-2" />
                Stop Duration
              </>
            }
          >
            {order.stop_time || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <ShoppingOutlined className="mr-2" />
                Order Type
              </>
            }
          >
            {order.order_type || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <BarcodeOutlined className="mr-2" />
                Tracking Code
              </>
            }
          >
            {order.code || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Description;
