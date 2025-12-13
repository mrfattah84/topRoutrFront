import React, { useEffect } from "react";
import { Button, Flex, Space, Table, Tag } from "antd";
import { useGetOrdersQuery } from "../../api/orderApiSlice";
import { setForm } from "../formDialog/dialogSlice";
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
    dataIndex: "activated",
    key: "activated",
    render: (_, record) => (
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={record.activated}
          ///onChange={() => toggleActive(record.id)}
        />
        <span className="toggle-slider"></span>
      </label>
    ),
  },
  {
    title: "Order ID",
    dataIndex: "orderId",
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
    dataIndex: "resultStatus",
    key: "resultStatus",
  },
  {
    title: "Live Status",
    dataIndex: "liveStatus",
    key: "liveStatus",
  },
  {
    title: "Daily Status",
    dataIndex: "dailyStatus",
    key: "dailyStatus",
  },
  {
    title: "Order Type",
    dataIndex: "orderType",
    key: "orderType",
  },
  {
    title: "Shipment Type",
    dataIndex: "shipmentType",
    key: "shipmentType",
  },
  {
    title: "Assignment",
    dataIndex: "assignment",
    key: "assignment",
  },
  {
    title: "Source Address",
    dataIndex: "sourceAddress",
    key: "sourceAddress",
  },
  {
    title: "Destination Address",
    dataIndex: "destinationAddress",
    key: "destinationAddress",
  },
  {
    title: "Source Verified",
    dataIndex: "sourceVerified",
    key: "sourceVerified",
    ///render: (status) => <VerificationBadge status={status} />,
  },
  {
    title: "Destination Verified",
    dataIndex: "destinationVerified",
    key: "destinationVerified",
    ///render: (status) => <VerificationBadge status={status} />,
  },
  {
    title: "Order Date",
    dataIndex: "orderDate",
    key: "orderDate",
  },
  {
    title: "Delivery Date",
    dataIndex: "deliveryDate",
    key: "deliveryDate",
  },
  {
    title: "Delivery Time From",
    dataIndex: "deliveryTimeFrom",
    key: "deliveryTimeFrom",
  },
  {
    title: "Delivery Time To",
    dataIndex: "deliveryTimeTo",
    key: "deliveryTimeTo",
  },
  {
    title: "Delivery Time Actual",
    dataIndex: "deliveryTimeActual",
    key: "deliveryTimeActual",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
  },
  {
    title: "Weight",
    dataIndex: "weight",
    key: "weight",
  },
  {
    title: "Length",
    dataIndex: "length",
    key: "length",
  },
  {
    title: "Width",
    dataIndex: "width",
    key: "width",
  },
  {
    title: "Height",
    dataIndex: "height",
    key: "height",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Box Value",
    dataIndex: "boxValue",
    key: "boxValue",
  },
  {
    title: "Limit # Orders",
    dataIndex: "limitNumberOfOrders",
    key: "limitNumberOfOrders",
  },
  {
    title: "Vehicles",
    dataIndex: "vehicles",
    key: "vehicles",
  },
  {
    title: "Scheduled Drivers",
    dataIndex: "scheduledDrivers",
    key: "scheduledDrivers",
  },
  {
    title: "Cluster ID",
    dataIndex: "clusterId",
    key: "clusterId",
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
