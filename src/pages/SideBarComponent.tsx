import {
  FileOutlined,
  ContainerOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu, Button } from "antd";
import Result from "./result/Result";
import Sider from "antd/es/layout/Sider";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentSidebarMenue,
  setForm,
  setSidebarMenue,
} from "./formDialog/dialogSlice";
import { useNavigate } from "react-router-dom";
import Live from "./live/Live";

const SideBarComponent = () => {
  const menue = useSelector(selectCurrentSidebarMenue);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getSiderContent = () => {
    if (
      menue == "data" ||
      menue == "data-calendar" ||
      menue == "data-order" ||
      menue == "data-fleet"
    ) {
      return (
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          style={{ borderInlineEnd: 0, background: "#F2F2F2" }}
          items={[
            {
              key: "data-calendar",
              label: "Calendar",
              onClick: () => {
                dispatch(setForm("calendar"));
              },
            },
            {
              key: "data-order",
              label: "Order",
              onClick: () => dispatch(setSidebarMenue("data-order")),
            },
            {
              key: "data-fleet",
              label: "Fleet",
              onClick: () => dispatch(setSidebarMenue("data-fleet")),
            },
          ]}
        />
      );
    } else if (menue == "result-add" || menue == "result-show") {
      return <Result />;
    } else if (menue == "live") {
      return <Live />;
    } else {
      return (
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          style={{ borderInlineEnd: 0, background: "#F2F2F2" }}
          items={[
            {
              key: "1",
              label: "Data",
              icon: <FileOutlined />,
              onClick: () => {
                dispatch(setSidebarMenue("data"));
              },
            },
            {
              key: "2",
              label: "Result",
              icon: <ContainerOutlined />,
              onClick: () => {
                dispatch(setSidebarMenue("result-add"));
              },
            },
            {
              key: "3",
              label: "Live",
              icon: <FieldTimeOutlined />,
              onClick: () => {
                dispatch(setSidebarMenue("live"));
              },
            },
            {
              key: "4",
              label: "Analytics",
              icon: <BarChartOutlined />,
            },
            {
              key: "5",
              label: "Administration",
              icon: <UserOutlined />,
            },
          ]}
        />
      );
    }
  };

  return (
    <Sider
      width={350}
      style={{ background: "#F2F2F2" }}
      className="rounded-xl overflow-y-auto"
    >
      <div className="relative">
        {menue && (
          <Button
            className="absolute! top-0 left-6"
            type="primary"
            shape="circle"
            size="small"
            onClick={() => dispatch(setSidebarMenue(""))}
          >
            X
          </Button>
        )}
        <img
          src={"./logo.svg"}
          alt="logo"
          className="m-auto mt-5"
          onClick={() => navigate("/home")}
        />
      </div>
      {getSiderContent()}
    </Sider>
  );
};

export default SideBarComponent;
