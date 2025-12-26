import { useSelector } from "react-redux";
import {
  selectCurrentSidebarMenue,
  selectCurrentForm,
} from "../formDialog/dialogSlice";
import AddForm from "./AddForm";
import OptimizationResultPanel from "./OptimizationResultPanel";
import { useState } from "react";

const Result = () => {
  const menue = useSelector(selectCurrentSidebarMenue);
  const [resultData, setResultData] = useState();

  switch (menue) {
    case "result-add":
      console.log(123123);
      return <AddForm setResultData={setResultData} />;
    case "result-show":
      return <OptimizationResultPanel resultData={resultData} />;
  }
};

export default Result;
