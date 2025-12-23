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
  selectedFleetKeys,
  selectDate,
  setSelectedRowKeys,
} from "./fleetTableSlice";

const FleetTable = () => {
  const { data, isLoading } = useGetFleetsQuery();
  const [changeActive] = useChangeFleetActiveMutation();
  const dispatch = useDispatch();
  const rows = useSelector(selectedFleetKeys);
  const date = useSelector(selectDate);
  const rowSelection = {
    rows,
    onChange: (rows) => {
      dispatch(setSelectedRowKeys(rows));
    },
  };

  const columns = [
    /*{
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
    },*/
    {
      title: "Vehicle name(label)",
      dataIndex: ["vehicle", "name"],
      key: "vehicleName",
    },
    {
      title: "Vehicle type",
      dataIndex: ["vehicle", "vehicle_type_detail", "code"],
      key: "vehicleType",
    },
    {
      title: "Cap(Weight)",
      dataIndex: ["vehicle", "maxCapacity"],
      key: "vehicleMaxCapacity",
    },
    {
      title: "Length",
      dataIndex: ["vehicle", "length"],
      key: "vehicleLength",
    },
    {
      title: "Height",
      dataIndex: ["vehicle", "height"],
      key: "vehicleHeight",
    },
    {
      title: "Width",
      dataIndex: ["vehicle", "width"],
      key: "vehicleWidth",
    },
    {
      title: "Driver name",
      dataIndex: "driver_user",
      key: "driverName",
      render: (record) => record?.first_name + " " + record?.last_name,
    },
    {
      title: "Phone",
      dataIndex: ["driver_user", "phone"],
      key: "Phone",
    },
    {
      title: "Staff number",
      dataIndex: "staff_number",
      key: "staffNumber",
    },
    {
      title: "start location lat",
      dataIndex: ["start_location", "latitude"],
      key: "startLat",
    },
    {
      title: "start location long",
      dataIndex: ["start_location", "longitude"],
      key: "startLong",
    },
    {
      title: "end location lat",
      dataIndex: ["end_location", "latitude"],
      key: "endLat",
    },
    {
      title: "end location long",
      dataIndex: ["end_location", "longitude"],
      key: "endLong",
    },
    {
      title: "Working hours",
      dataIndex: "work_schedule",
      key: "workingHours",
      render: (record) =>
        record
          ? record?.start_time_1.slice(0, 5) +
            " - " +
            record?.end_time_1.slice(0, 5)
          : "",
    },
    {
      title: "Service Area",
      dataIndex: "service_area",
      key: "serviceArea",
      render: (area) => {
        let str = "";
        area.forEach((item) => {
          str += item.title;
        });
        return str;
      },
    },
    {
      title: "fixed cost",
      dataIndex: ["cost", "fixed_cost"],
      key: "fixedCost",
    },
    {
      title: "Cost per KM",
      dataIndex: ["cost", "per_km_cost"],
      key: "perKM",
    },
    {
      title: "Cost per hour",
      dataIndex: ["cost", "per_hour_cost"],
      key: "perHour",
    },
    {
      title: "Cost per hour overtime",
      dataIndex: ["cost", "per_hour_overtime_cost"],
      key: "perHourOver",
    },
    {
      title: "distance Limit(KM)",
      dataIndex: ["cost", "distance_limit"],
      key: "distanceLimit",
    },
    {
      title: "Order limit",
      dataIndex: ["vehicle", "limit_number_of_orders"],
      key: "orderLimit",
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
