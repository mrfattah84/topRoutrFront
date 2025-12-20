import { Modal } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentForm,
  selectCurrentSidebarMenue,
  setForm,
  setSidebarMenue,
} from "./dialogSlice";
import Calendar from "../../components/Calendar";
import AddOrder from "./forms/order/AddOrder";
import AddFleet from "./forms/fleet/AddFleet";
import DeleteFleet from "./forms/fleet/DeleteFleet";
import EditFleet from "./forms/fleet/EditFleet";
import ImportFleet from "./forms/fleet/ImportFleet";
import ImportOrder from "./forms/order/ImportOrder";
import { selectedRowKeys, setDate } from "../table/order/orderTableSlice";
import { useDeleteOrderMutation } from "./forms/order/orderApi";

const CustomDialog = () => {
  const [open, setOpen] = useState(false);

  const [deleteOrder] = useDeleteOrderMutation();

  const menue = useSelector(selectCurrentSidebarMenue);
  const form = useSelector(selectCurrentForm);
  const selected = useSelector(selectedRowKeys);

  const dispatch = useDispatch();

  // Handle opening the modal when menue or form changes
  useEffect(() => {
    if (menue === "data-calendar") {
      dispatch(setDate(""));
      setOpen(true);
      // Clear the menue selection after opening
      dispatch(setSidebarMenue(""));
    } else if (menue && form) {
      setOpen(true);
    } else if (menue && !form) {
      setOpen(false);
    }
  }, [menue, form, dispatch]);

  const handleDateSelect = (date, jalaali) => {
    dispatch(setDate(`${jalaali.jd}-${jalaali.jm}-${jalaali.jy}`));
    console.log(`Selected: ${jalaali.jd}/${jalaali.jm}/${jalaali.jy}`);
  };

  const handleCancel = () => {
    setOpen(false);
    dispatch(setForm(""));
  };

  // Function to render the appropriate content based on menue and form
  const renderModalContent = () => {
    // Calendar view (no form needed)
    if (menue === "data-calendar" || (!menue && !form)) {
      return <Calendar onDateSelect={handleDateSelect} />;
    }

    // Form-based views
    if (menue === "data-fleet") {
      switch (form) {
        case "Add":
          return <AddFleet />;
        case "Edit":
          if (selected.length() === 1) {
            return <EditFleet />;
          } else {
            return null;
            dispatch(setForm(""));
          }
        case "Delete":
          return <DeleteFleet />;
        case "Import":
          return <ImportFleet />;
        case "Export":
          return <div>Export Fleet Form</div>;
        default:
          return <div>Fleet Form Content</div>;
      }
    }

    if (menue === "data-order") {
      switch (form) {
        case "Add":
          return <AddOrder />;
        case "Edit":
          console.log(selected);
          if (selected?.payload?.length === 1 || false) {
            return <AddOrder id={selected.payload[0]} />;
          } else {
            dispatch(setForm(""));
            return null;
          }
        case "Delete":
          if (selected?.payload?.length > 0 || false) {
            deleteOrder(selected.payload[0]);
            dispatch(setForm(""));
            return null;
          } else {
            dispatch(setForm(""));
            return null;
          }
        case "Import":
          return <ImportOrder />;
        case "Export":
          return <div>Export Order Form</div>;
        default:
          return <div>Order Form Content</div>;
      }
    }

    return <div>Default Content</div>;
  };

  // Function to get the modal title
  const getModalTitle = () => {
    if (menue == "data-calendar" || (!menue && !form)) {
      return "Calendar";
    }

    if (form) {
      return `${form} - ${menue?.replace("data-", "") || ""}`;
    }

    return "Dialog";
  };

  return (
    <Modal
      title={getModalTitle()}
      open={open}
      footer={null}
      onCancel={handleCancel}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default CustomDialog;
