import React, { useMemo } from "react";
import { Button, Flex, Space, Switch, Table, Tag } from "antd";
import { useGetOrdersQuery } from "./orderTableApi";
import { setForm } from "../../formDialog/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDate,
  selectedRowKeys,
  setSelectedRowKeys,
} from "./orderTableSlice";
import { useChangeActiveMutation } from "./orderTableApi";

const OrderTable = () => {
  const { data, isLoading } = useGetOrdersQuery();
  const [changeActive] = useChangeActiveMutation();
  const dispatch = useDispatch();
  const rows = useSelector(selectedRowKeys);
  const date = useSelector(selectDate);
  const rowSelection = {
    rows,
    onChange: (rows) => {
      dispatch(setSelectedRowKeys(rows));
    },
  };

  const columns = [
    {
      title: "Actives",
      dataIndex: "activated",
      key: "activated",
      render: (_, record) => (
        <label className="toggle-switch">
          <Switch
            checked={record.activated}
            onChange={() => {
              changeActive({ id: record.id, activated: !record.activated });
            }}
          />
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
      render: (record) => {
        return record?.title || "";
      },
    },
    {
      title: "Destination Address",
      dataIndex: "destination",
      key: "destinationAddress",
      render: (record) => {
        return record?.title || "";
      },
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

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }
    if (!date) {
      return data;
    }
    return data.filter((item) => item.created_at === date);
  }, [data, date]);

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
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        pagination={{ placement: ["none", "none"] }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default OrderTable;
