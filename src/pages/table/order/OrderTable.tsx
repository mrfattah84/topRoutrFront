import React, { useEffect } from "react";
import { Button, Flex, Space, Switch, Table, Tag } from "antd";
import { useGetOrdersQuery } from "./orderTableApi";
import { setForm } from "../../formDialog/dialogSlice";
import { useDispatch } from "react-redux";

const columns = [
  {
    title: "All",
    dataIndex: "selection",
    key: "selection",
    render: (_, record) => (
      <input
        type="checkbox"
        ///checked={selectedRows.has(record.id)}
        ///onChange={() => toggleSelectRow(record.id)}
        className="table-checkbox"
      />
    ),
  },
  {
    title: "Actives",
    dataIndex: "is_active",
    key: "activated",
    render: (_, record) => (
      <label className="toggle-switch">
        <Switch checked={record.is_active} onChange={() => {}} />
        <span className="toggle-slider"></span>
      </label>
    ),
  },
  {
    title: "Order ID",
    dataIndex: "id",
    key: "orderId",
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Code",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "Priority",
    dataIndex: "priority",
    key: "priority",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Result Status",
    dataIndex: "result_status",
    key: "resultStatus",
  },
  {
    title: "Live Status",
    dataIndex: "live_status",
    key: "liveStatus",
  },
  {
    title: "Daily Status",
    dataIndex: "daily_status",
    key: "dailyStatus",
  },
  {
    title: "Source Address",
    dataIndex: "source",
    key: "sourceAddress",
    render: (_, record) => <div>{record.title}</div>,
  },
  {
    title: "Destination Address",
    dataIndex: "destination",
    key: "destinationAddress",
    render: (_, record) => <div>{record.title}</div>,
  },
  {
    title: "Source Verified",
    dataIndex: "source_verified",
    key: "sourceVerified",
    ///render: (status) => <VerificationBadge status={status} />,
  },
  {
    title: "Destination Verified",
    dataIndex: "destination_verified",
    key: "destinationVerified",
    ///render: (status) => <VerificationBadge status={status} />,
  },
  {
    title: "Order Date",
    dataIndex: "created_at",
    key: "orderDate",
  },
  {
    title: "Delivery Date",
    dataIndex: "delivery_date",
    key: "deliveryDate",
  },
  {
    title: "Delivery Time From",
    dataIndex: "delivery_time_from",
    key: "deliveryTimeFrom",
  },
  {
    title: "Delivery Time To",
    dataIndex: "delivery_time_to",
    key: "deliveryTimeTo",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Vehicle",
    dataIndex: "assigned_to_name",
    key: "vehicle",
  },
  {
    title: "Scheduled Driver",
    dataIndex: "driver_name",
    key: "scheduledDriver",
  },
  {
    title: "Vehicle Plate",
    dataIndex: "vehicle_plate",
    key: "vehiclePlate",
  },
];

const OrderTable = () => {
  const { data, isLoading } = useGetOrdersQuery();
  const dispatch = useDispatch();


  return (
    <div className="relative">
      <div
        className="flex gap-2 bg-[#B5BAB9] p-2 rounded-t-md w-min absolute -top-12 left-0"
        onClick={(e) => dispatch(setForm(e.target.innerText))}
      >
        <Button color="default" variant="text">
          Add
        </Button>
        <Button color="default" variant="text">
          Edit
        </Button>
        <Button color="default" variant="text">
          Delete
        </Button>
        <Button color="default" variant="text">
          Import
        </Button>
        <Button color="default" variant="text">
          Export
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ placement: ["none", "none"] }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default OrderTable;
