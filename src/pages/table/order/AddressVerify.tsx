import { Tag } from "antd";
import customMarker from "./customMarker";

const AddressVerify = ({ record }) => {
  if (!record) return null;
  return (
    <div key={record.uid}>
      {record?.description || ""}
      <img src={customMarker({ pinColor: record.verified })} alt="" />
    </div>
  );
  ///color={record.verified}
};

export default AddressVerify;
