import React, { useEffect, useState } from "react";
import type { Fleet } from "../table/fleet/fleetTableApi";
import { Button, Checkbox } from "antd";
import {
  CaretDownOutlined,
  CaretLeftOutlined,
  MessageFilled,
  PhoneFilled,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { decodePolyline6 } from "../../utils/polyLine";
import {
  addActualRoute,
  addPoint,
  deletePoint,
  deleteRoute,
  setRoutes,
  setShowActualPoint,
  setShowActualRoute,
  updateDriverLocation,
} from "../map/mapSlice";
import { useGetDriverjobsQuery } from "./liveApi";
import ProgressBarPoint from "./ProgressBarPoint";
import { generateUserColor } from "../../utils/generateUserColor";

const DriverCard = (props: { data: Fleet; checked: boolean }) => {
  const { data: driverjobs, isLoading } = useGetDriverjobsQuery(props.data.id);
  const [isChecked, setIsChecked] = useState<boolean>();
  const [mode, setMode] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) {
      dispatch(
        addActualRoute({
          id: props.data.id,
          coordinates: [[51.308942, 35.690536]],
          color: generateUserColor(props.data.vehicle.id).secondary,
          show: false,
        })
      );
    }
  }, [isLoading]);

  useEffect(() => {
    if (isChecked && !isLoading) {
      const coords = decodePolyline6(driverjobs.route.geometry);
      dispatch(
        setRoutes([
          {
            id: props.data.id,
            color: generateUserColor(props.data.vehicle.id).primary,
            coordinates: coords,
          },
        ])
      );
      driverjobs?.route.steps.forEach((order) => {
        dispatch(
          addPoint({
            id: order.order_uuid || "noid",
            name: order.type,
            description: order.job_id || "",
            color: generateUserColor(props.data.vehicle.id).primary,
            coords: order.location,
          })
        );
      });
      dispatch(setShowActualPoint({ id: props.data.id, show: true }));
      dispatch(setShowActualRoute({ id: props.data.id, show: true }));
    } else if (!isChecked && !isLoading) {
      dispatch(setShowActualPoint({ id: props.data.id, show: true }));
      dispatch(setShowActualRoute({ id: props.data.id, show: true }));
      dispatch(deleteRoute(props.data.id));
      driverjobs?.route.steps.forEach((order) => {
        dispatch(deletePoint(order.order_uuid || "noid"));
      });
    }
  }, [isChecked, isLoading]);

  useEffect(() => {
    setIsChecked(props.checked);
  }, [props.checked]);

  useEffect(() => {
    console.log(props.data.geojson);
    dispatch(
      updateDriverLocation({
        id: props.data.id,
        coords: props.data.geojson?.location.coordinates || [
          51.308942, 35.690536,
        ],
        name:
          props.data.driver_user.first_name +
          " " +
          props.data.driver_user.last_name,
        color: generateUserColor(props.data.vehicle.id).primary,
        description: props.data.vehicle.name,
        show: isChecked || false,
      })
    );
  }, [props.data]);

  return (
    <div className="bg-white mx-5 mb-5 rounded-xl border border-[#747474] text-black p-2.5">
      <div className="flex justify-between">
        <div className="flex gap-2 items-start">
          <Checkbox
            checked={isChecked}
            onChange={() => {
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
        <div className="flex flex-col items-end">
          <div className="font-bold">###</div>
          <div
            className="font-bold text-xs"
            onClick={() => {
              setMode(!mode);
            }}
          >
            {mode ? <CaretDownOutlined /> : <CaretLeftOutlined />}
          </div>
        </div>
      </div>
      <div
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
      <div className="flex justify-between items-center">
        <div className="font-bold">
          DriverName: {props.data.driver_user.first_name}{" "}
          {props.data.driver_user.last_name}
        </div>
        <div className="flex gap-2">
          <Button
            href={`tel:${props.data.driver_user.phone}`}
            icon={<PhoneFilled />}
            type="text"
          />
          <Button
            href={`mailto:${props.data.driver_user.email}`}
            icon={<MessageFilled />}
            type="text"
          />
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
