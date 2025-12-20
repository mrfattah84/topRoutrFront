import React, { useEffect, useMemo } from "react";
import { Button, Flex, Space, Switch, Table, Tag } from "antd";
import {
  useGetFleetsQuery,
  useChangeFleetActiveMutation,
} from "./fleetTableApi";
import { setForm } from "../../formDialog/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import AddressVerify from "../order/AddressVerify";
import {
  selectedRowKeys,
  selectDate,
  setSelectedRowKeys,
} from "./fleetTableSlice";

const FleetTable = () => {
  const { data, isLoading } = useGetFleetsQuery();
  const [changeActive] = useChangeFleetActiveMutation();
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
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (_, record) => (
        <label className="toggle-switch">
          <Switch
            checked={record.is_active}
            onChange={() => {
              changeActive({ id: record.id, activated: !record.is_active });
            }}
          />
          <span className="toggle-slider"></span>
        </label>
      ),
    },
    {
      title: "license",
      dataIndex: "license_plate",
      key: "license_plate",
    },
    {
      title: "label",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Vehicles Features",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "weight",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "volume",
      dataIndex: "volume",
      key: "volume",
    },
    {
      title: "serial number",
      dataIndex: "serial_number",
      key: "serial_number",
      render: (record) => record?.split("T")[0],
    },
    {
      title: "name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "work hours",
      dataIndex: "work_hours",
      key: "work_hours",
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "break",
      dataIndex: "break_duration",
      key: "break_duration",
    },
    {
      title: "time window",
      dataIndex: "time_window",
      key: "time_window",
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

export default FleetTable;
