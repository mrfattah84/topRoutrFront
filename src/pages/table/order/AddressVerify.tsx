import { Tag } from "antd";

const AddressVerify = ({ record }) => {
  if (!record) return null;
  return (
    <Tag color={record.verified} key={record.uid}>
      {record?.description || ""}
    </Tag>
  );
};

export default AddressVerify;
