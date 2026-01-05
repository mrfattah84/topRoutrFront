import type { Job } from "./liveApi";
import { useDispatch } from "react-redux";
import { setFocus } from "../map/mapSlice";

const ProgressBarPoint = (props: { show: boolean; item: Job }) => {
  const dispatch = useDispatch();
  return (
    <div
      className="z-10 p-0.5 flex gap-2 items-center"
      onClick={() => {
        dispatch(
          setFocus({
            id: props.item.order_uuid || undefined,
            center: props.item.location,
            zoom: 15,
          })
        );
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
