import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetDialog,
  selectCurrentForm,
  selectCurrentSidebarMenue,
  selectIsSubmitting,
  selectSubmitSuccess,
  setForm,
  setSidebarMenue,
  triggerSubmit,
} from "./dialogSlice";
import Calendar from "../data/Calendar";
import AddOrder from "./forms/order/AddOrder";
import EditOrder from "./forms/order/EditOrder";
import AddFleet from "./forms/fleet/AddFleet";
import DeleteOrder from "./forms/order/DeleteOrder";
import DeleteFleet from "./forms/fleet/DeleteFleet";
import EditFleet from "./forms/fleet/EditFleet";
import ImportFleet from "./forms/fleet/ImportFleet";
import ImportOrder from "./forms/order/ImportOrder";

const CustomDialog = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const menue = useSelector(selectCurrentSidebarMenue);
  const form = useSelector(selectCurrentForm);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitSuccess = useSelector(selectSubmitSuccess);

  const dispatch = useDispatch();

  // Handle opening the modal when menue or form changes
  useEffect(() => {
    if (menue === "data-calendar") {
      setOpen(true);
      // Clear the menue selection after opening
      dispatch(setSidebarMenue(""));
    } else if (menue && form) {
      setOpen(true);
    }
  }, [menue, form, dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      setTimeout(() => {
        setOpen(false);
        dispatch(resetDialog());
      }, 500);
    }
  }, [submitSuccess, dispatch]);

  const handleDateSelect = (date, jalaali) => {
    setSelectedDate(jalaali);
    console.log(`Selected: ${jalaali.jd}/${jalaali.jm}/${jalaali.jy}`);
  };

  const handleOk = () => {
    dispatch(triggerSubmit());
  };

  const handleCancel = () => {
    setOpen(false);
    dispatch(resetDialog());
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
          return <EditFleet />;
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
          return <EditOrder />;
        case "Delete":
          return <DeleteOrder />;
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
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={handleCancel}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default CustomDialog;
