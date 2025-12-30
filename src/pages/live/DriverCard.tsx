import React, { useEffect, useState } from "react";
import type { Fleet } from "../table/fleet/fleetTableApi";
import { Checkbox } from "antd";
import ProgressBar from "./ProgressBar";
import { MessageFilled, PhoneFilled } from "@ant-design/icons";

const DriverCard = (props: { data: Fleet; checked: boolean }) => {
  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => {
    setIsChecked(props.checked);
  }, [props.checked]);

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
        ###
      </div>
      <ProgressBar id={props.data.id} />
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
