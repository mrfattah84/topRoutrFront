import { useSelector } from "react-redux";
import {
  selectCurrentSidebarMenue,
  selectCurrentForm,
} from "../formDialog/dialogSlice";
import AddForm from "./AddForm";

const Result = () => {
  const menue = useSelector(selectCurrentSidebarMenue);
  const form = useSelector(selectCurrentForm);

  switch (menue) {
    case "result-add":
      console.log(123123);
      return <AddForm />;
    default:
      return <div>fczdfsd</div>;
  }
};

export default Result;
