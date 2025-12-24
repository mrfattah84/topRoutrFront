import React, { useMemo } from "react";
import { Button, Flex, Space, Switch, Table, Tag } from "antd";
import { useGetOrdersQuery } from "./orderTableApi";
import { setForm } from "../../formDialog/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDate,
  selectedOrderKeys,
  setSelectedRowKeys,
} from "./orderTableSlice";
import { useChangeActiveMutation } from "./orderTableApi";
import AddressVerify from "./AddressVerify";

const OrderTable = () => {
  const { data, isLoading } = useGetOrdersQuery();
  const [changeActive] = useChangeActiveMutation();
  const dispatch = useDispatch();
  const rows = useSelector(selectedOrderKeys);
  const date = useSelector(selectDate);
  const rowSelection = {
    rows,
    onChange: (rows) => {
      dispatch(setSelectedRowKeys(rows));
    },
  };

  const columns = [
    {
      title: "Active",
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
      title: "Order Number",
      dataIndex: "order_number",
      key: "orderNumber",
    },
    {
      title: "Source Address",
      dataIndex: "source",
      key: "sourceAddress",
      render: (record) => <AddressVerify record={record} />,
    },
    {
      title: "Destination Address",
      dataIndex: "destination",
      key: "destinationAddress",
      render: (record) => <AddressVerify record={record} />,
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "orderDate",
      render: (record) => record?.split("T")[0],
    },
    {
      title: "Delivery Date",
      dataIndex: "delivery_date",
      key: "deliveryDate",
      render: (record) => record?.split("T")[0],
    },
    {
      title: "Stop duration",
      dataIndex: "stop_time",
      key: "stop_time",
    },
    {
      title: "Tracking code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Order type",
      dataIndex: "order_type",
      key: "orderType",
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
      dataIndex: "order_item_id",
      key: "quantity",
      render: (records) => {
        if (!records) {
          return "N/A";
        }
        let q = 0;
        records.forEach((record) => {
          q += record.quantity;
        });
        return q;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "Assigned Driver",
      dataIndex: ["driver", "cell_phone"],
      key: "scheduledDriver",
    },
  ];

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }
    if (!date.payload) {
      return data;
    }
    return data.filter((item) => {
      console.log(date.payload, item.delivery_date);
      const orderDate = item?.delivery_date.split("-");

      if (
        orderDate[0] == date?.payload?.jy &&
        orderDate[1] == date?.payload?.jm &&
        orderDate[2] == date?.payload?.jd
      ) {
        return true;
      }

      return false;
    });
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
