import React from "react";
import { useGetOrderQuery } from "../formDialog/forms/order/orderApi";

const ProgressBarPoint = (props: { show: boolean; id: string }) => {
  return (
    <div className="relative z-10 bg-white p-0.5">
      {/* This inner div is the colored point */}
      <div className="h-2 w-2 rounded-full bg-red-800"></div>
    </div>
  );
};

export default ProgressBarPoint;
