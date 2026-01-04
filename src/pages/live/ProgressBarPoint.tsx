import React from "react";
import { useGetOrderQuery } from "../formDialog/forms/order/orderApi";
import { Divider } from "antd";
import type { Job } from "./liveApi";
import { useDispatch } from "react-redux";
import { setFocus } from "../map/mapSlice";
import Item from "antd/es/list/Item";

const ProgressBarPoint = (props: { show: boolean; item: Job }) => {
  const dispatch = useDispatch();
  return (
    <div
      className="z-10 p-0.5 flex gap-2 items-center"
      onClick={() => {
        dispatch(setFocus(props.item.order_uuid || ""));
      }}
    >
      {/* This inner div is the colored point */}
      <div className="h-2 w-2 rounded-full bg-red-800"></div>

      {props.show && (
        <div>{props.item.type + " " + (props.item.job_id || "")}</div>
      )}
    </div>
  );
};

export default ProgressBarPoint;
