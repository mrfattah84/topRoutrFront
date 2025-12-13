import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentForm,
  selectCurrentSidebarMenue,
  setForm,
  setSidebarMenue,
} from "./dialogSlice";
import Calendar from "../data/Calendar";

const CustomDialog = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const menue = useSelector(selectCurrentSidebarMenue);
  const form = useSelector(selectCurrentForm);

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

  const handleDateSelect = (date, jalaali) => {
    setSelectedDate(jalaali);
    console.log(`Selected: ${jalaali.jd}/${jalaali.jm}/${jalaali.jy}`);
  };

  const closeModal = () => {
    setOpen(false);
    dispatch(setForm(""));
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      closeModal();
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    closeModal();
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
        case "Add order":
          return <div>Add Fleet Order Form</div>;
        case "Edit":
          return <div>Edit Fleet Form</div>;
        case "Delete":
          return <div>Delete Fleet Confirmation</div>;
        case "Import":
          return <div>Import Fleet Form</div>;
        case "Export":
          return <div>Export Fleet Form</div>;
        default:
          return <div>Fleet Form Content</div>;
      }
    }

    if (menue === "data-order") {
      switch (form) {
        case "Add order":
          return <div>Add Order Form</div>;
        case "Edit":
          return <div>Edit Order Form</div>;
        case "Delete":
          return <div>Delete Order Confirmation</div>;
        case "Import":
          return <div>Import Order Form</div>;
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
    if (menue == "data-calendar") {
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
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default CustomDialog;
