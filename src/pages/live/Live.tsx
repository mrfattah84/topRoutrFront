import { useState } from "react";
import { useGetFleetsQuery } from "../table/fleet/fleetTableApi";
import DriverCard from "./DriverCard";
import { Checkbox } from "antd";

const Live = () => {
  const { data, isLoading } = useGetFleetsQuery();
  const [checkAll, setCheckAll] = useState<boolean>(false);

  if (isLoading) {
    return "loading...";
  }

  return (
    <>
      <Checkbox
        checked={checkAll}
        onChange={() => {
          setCheckAll(!checkAll);
        }}
      />
      {data?.map((element) => {
        return (
          <DriverCard data={element} checked={checkAll} key={element.id} />
        );
      })}
    </>
  );
};

export default Live;
