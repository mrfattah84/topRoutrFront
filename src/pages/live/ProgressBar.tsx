import React, { useState } from "react";
import { useGetDriverjobsQuery } from "./liveApi";
import { useDispatch } from "react-redux";
import { addPoint } from "../map/mapSlice";
import ProgressBarPoints from "./ProgressBarPoint";
import ProgressBarPoint from "./ProgressBarPoint";

const ProgressBar = (props: { id: string }) => {
  const [mode, setMode] = useState<boolean>(false);
  const { data: driverjobs, isLoading } = useGetDriverjobsQuery(props.id);
  const disPatch = useDispatch();

  if (isLoading) {
    return;
  }

  const getJobDetails = () => {
    driverjobs?.route.steps.map((item) => {});

    return driverjobs?.driver_name;
  };

  return (
    <div
      onClick={() => {
        setMode(!mode);
      }}
      // We use a pseudo-element for the dashed line.
      // The container is relative, and the ::before is absolute.
      className={`relative flex cursor-pointer my-3 ${
        mode
          ? "flex-col w-min items-center justify-between before:absolute before:left-1/2 before:top-0 before:h-full before:-translate-x-1/2 before:border-l-2 before:border-dashed before:border-gray-300"
          : "w-full items-center justify-between before:absolute before:left-0 before:top-1/2 before:w-full before:-translate-y-1/2 before:border-t-2 before:border-dashed before:border-gray-300"
      }`}
    >
      {driverjobs?.route.steps.map((item) => {
        return (
          <ProgressBarPoint
            id={item.order_uuid || ""}
            show={mode}
            key={item.type + item.order_uuid}
          />
        );
      })}
    </div>
  );
};

export default ProgressBar;
