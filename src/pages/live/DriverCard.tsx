import React, { useEffect, useState } from "react";
import type { Fleet } from "../table/fleet/fleetTableApi";
import { Checkbox } from "antd";
import ProgressBar from "./ProgressBar";
import { MessageFilled, PhoneFilled } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { decodePolyline6 } from "../result/polyLine";
import { addPoint, clearMap, setRoutes } from "../map/mapSlice";
import { useGetDriverjobsQuery } from "./liveApi";
import ProgressBarPoint from "./ProgressBarPoint";

const getVehicleColors = (index: number) => {
  const colorPalette = [
    { primary: "#3b82f6", secondary: "#dbeafe" },
    { primary: "#10b981", secondary: "#d1fae5" },
    { primary: "#f59e0b", secondary: "#fef3c7" },
    { primary: "#ef4444", secondary: "#fee2e2" },
    { primary: "#8b5cf6", secondary: "#ede9fe" },
    { primary: "#ec4899", secondary: "#fce7f3" },
    { primary: "#14b8a6", secondary: "#ccfbf1" },
    { primary: "#f97316", secondary: "#ffedd5" },
  ];
  return colorPalette[index % colorPalette.length];
};

const DriverCard = (props: { data: Fleet; checked: boolean }) => {
  const { data: driverjobs, isLoading } = useGetDriverjobsQuery(props.data.id);
  const [isChecked, setIsChecked] = useState<boolean>();
  const [mode, setMode] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isChecked && !isLoading) {
      const coords = decodePolyline6(driverjobs.route.geometry);
      dispatch(
        setRoutes([
          {
            id: props.data.id,
            color: getVehicleColors(1).primary,
            coordinates: coords,
          },
        ])
      );
      driverjobs?.route.steps.forEach((order) => {
        dispatch(
          addPoint({
            id: order.order_uuid,
            name: order.type,
            description: order.job_id || "",
            color: "#000000",
            coords: order.location,
          })
        );
      });
    }
  }, [isChecked, isLoading]);

  useEffect(() => {
    dispatch(clearMap());
    setIsChecked(props.checked);
  }, [props.checked]);

  return (
    <div className="bg-white mx-5 mb-5 rounded-xl border border-[#747474] text-black p-2.5">
      <div className="flex justify-between">
        <div className="flex gap-2 items-start">
          <Checkbox
            checked={isChecked}
            onChange={() => {
              dispatch(clearMap());
              setIsChecked(!isChecked);
            }}
          />
          <div className="flex flex-col">
            <div className="font-bold">{props.data.vehicle.name}</div>
            <div className="font-bold text-xs">
              {props.data.vehicle.vehicle_type_detail.name}
            </div>
          </div>
        </div>
        ###
      </div>
      <div
        onClick={() => {
          setMode(!mode);
        }}
        // We use a pseudo-element for the dashed line.
        // The container is relative, and the ::before is absolute.
        className={`relative flex cursor-pointer my-3 w-full ${
          mode
            ? "flex-col items-start before:absolute before:left-0 before:top-0 before:h-full before:translate-x-1 before:border-l-2 before:border-dashed before:border-gray-300"
            : " justify-between before:absolute before:left-0 before:top-1/2 before:w-full before:-translate-y-1/2 before:border-t-2 before:border-dashed before:border-gray-300"
        }`}
      >
        {driverjobs?.route.steps.map((item) => {
          return (
            <ProgressBarPoint
              item={item}
              show={mode}
              key={item.type + item.order_uuid}
            />
          );
        })}
      </div>
      <div className="flex justify-between">
        <div className="font-bold">
          DriverName: {props.data.driver_user.first_name}{" "}
          {props.data.driver_user.last_name}
        </div>
        <div className="flex gap-2">
          <PhoneFilled />
          <MessageFilled />
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
