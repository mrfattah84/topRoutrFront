import { useDispatch } from "react-redux";
import CustomMarker from "./CustomMarker";

const AddressVerify = ({ record }) => {
  if (!record) return null;
  return (
    <div key={record.uid} className="flex gap-2 items-center justify-between">
      <div>{record?.description || ""}</div>

      <CustomMarker pinColor={record.verified} />
    </div>
  );
};

export default AddressVerify;
