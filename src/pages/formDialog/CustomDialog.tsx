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
import ImportFleet from "./forms/fleet/ImportFleet";
import ImportOrder from "./forms/order/ImportOrder";
import { selectedOrderKeys, setDate } from "../table/order/orderTableSlice";
import { selectedFleetKeys } from "../table/fleet/fleetTableSlice";
import { useDeleteOrderMutation } from "./forms/order/orderApi";
import { useDeleteFleetMutation } from "./forms/fleet/fleetApi";

const CustomDialog = () => {
  const [open, setOpen] = useState(false);

  const [deleteOrder] = useDeleteOrderMutation();
  const [deleteFleet] = useDeleteFleetMutation();

  const menue = useSelector(selectCurrentSidebarMenue);
  const form = useSelector(selectCurrentForm);
  const selectedOrders = useSelector(selectedOrderKeys);
  const SelectedFleets = useSelector(selectedFleetKeys);

  const dispatch = useDispatch();

  // Handle opening the modal when menue or form changes
  useEffect(() => {
    if (menue && form) {
      setOpen(true);
    } else if (menue && !form) {
      setOpen(false);
    }
  }, [menue, form, dispatch]);

  const handleDateSelect = (date, jalaali) => {
    dispatch(setDate(jalaali));
    console.log(`${jalaali.jy}-${jalaali.jm}-${jalaali.jd}`);
  };

  const handleCancel = () => {
    setOpen(false);
    dispatch(setForm(""));
  };

  // Function to render the appropriate content based on menue and form
  const renderModalContent = () => {
    // Calendar view (no form needed)
    if (menue === "data") {
      if (form === "calendar") {
        return <Calendar onDateSelect={handleDateSelect} />;
      }
    }

    // Form-based views
    if (menue === "data-fleet") {
      switch (form) {
        case "Add":
          return <AddFleet />;
        case "Edit":
          if (SelectedFleets?.payload?.length === 1 || false) {
            return <AddFleet id={SelectedFleets.payload[0]} />;
          } else {
            dispatch(setForm(""));
            return null;
          }
        case "Delete":
          if (SelectedFleets?.payload?.length > 0 || false) {
            SelectedFleets.payload.forEach((id) => {
              deleteFleet(id);
            });
            dispatch(setForm(""));
            return null;
          } else {
            dispatch(setForm(""));
            return null;
          }
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
          console.log(selectedOrders);
          if (selectedOrders?.payload?.length === 1 || false) {
            return <AddOrder id={selectedOrders.payload[0]} />;
          } else {
            dispatch(setForm(""));
            return null;
          }
        case "Delete":
          if (selectedOrders?.payload?.length > 0 || false) {
            selectedOrders.payload.forEach((id) => {
              deleteOrder(id);
            });
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
  };

  // Function to get the modal title
  const getModalTitle = () => {
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
