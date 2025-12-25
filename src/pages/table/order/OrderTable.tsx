import React, { useMemo, useState } from "react";
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
import Search from "antd/es/input/Search";
import { setPoints, setRoutes } from "../../map/mapSlice";

const OrderTable = () => {
  const { data, isLoading } = useGetOrdersQuery();
  const [searchText, setSearchText] = useState("");
  const [changeActive] = useChangeActiveMutation();
  const dispatch = useDispatch();
  const rows = useSelector(selectedOrderKeys);
  const date = useSelector(selectDate);
  const rowSelection = {
    rows,
    onChange: (rows, selectedRows) => {
      dispatch(setSelectedRowKeys(rows));
      dispatch(setPoints());
      dispatch(setRoutes());
      const p = [];
      const r = [];
      selectedRows.forEach((element) => {
        p.push({
          id: element.source.uid,
          name: element.source.title,
          coords: [element.source.longitude, element.source.latitude],
          description: element.source.description,
        });
        p.push({
          id: element.destination.uid,
          name: element.destination.title,
          coords: [element.destination.longitude, element.destination.latitude],
          description: element.destination.description,
        });
        r.push({
          id: element.order_number,
          color: "#ff0000",
          coordinates: [
            [element.source.longitude, element.source.latitude],
            [element.destination.longitude, element.destination.latitude],
          ],
        });
      });
      dispatch(setPoints(p));
      dispatch(setRoutes(r));
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
          return 1;
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
  ];

  const searchString = (source: string, query: string) => {
    console.log("search", source, query);

    // Convert both to lowercase and check if the source includes the query
    return source.toLowerCase().includes(query.toLowerCase());
  };

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }
    if (!date.payload && !searchText) {
      return data;
    }
    return data.filter((item) => {
      const orderDate = item?.delivery_date.split("-");

      if (
        !date.payload ||
        (orderDate[0] == date?.payload?.jy &&
          orderDate[1] == date?.payload?.jm &&
          orderDate[2] == date?.payload?.jd)
      ) {
        if (
          searchString(item.destination.description || "", searchText) ||
          searchString(item.destination.title || "", searchText) ||
          searchString(item.order_number || "", searchText)
        ) {
          return true;
        }
      }

      return false;
    });
  }, [data, date, searchText]);

  return (
    <div className="relative">
      <div
        className="flex gap-2 bg-[#B5BAB9] p-2 rounded-t-md w-min absolute top-0 left-0 z-10"
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
        <Search
          placeholder="input search text"
          enterButton
          style={{ width: 200 }}
          onSearch={(value) => {
            setSearchText(value);
          }}
        />
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        pagination={{
          placement: ["topEnd"],
          size: "small",
        }}
        scroll={{ x: "max-content", y: 200 }}
      />
    </div>
  );
};

export default OrderTable;
