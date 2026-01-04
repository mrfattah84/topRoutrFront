import React from "react";
import { selectFocus } from "./mapSlice";
import { useSelector } from "react-redux";
import { useGetOrderQuery } from "../formDialog/forms/order/orderApi";
import { Spin } from "antd";

const Description = () => {
  const id = useSelector(selectFocus);
  const { data, isLoading } = useGetOrderQuery(id);

  if (!id) {
    return;
  }
  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <div className=" absolute top-5 right-5 p-5">
      <div>{data.id}</div>
    </div>
  );
};

export default Description;
