import { useState } from "react";
import { Button, Layout, Menu } from "antd";
import {
  BarChartOutlined,
  ContainerOutlined,
  FieldTimeOutlined,
  FileOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Map from "./map/Map";
import { useNavigate } from "react-router-dom";
import OrderTable from "./table/order/OrderTable";
import FleetTable from "./table/fleet/FleetTable";
import CustomDialog from "./formDialog/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentSidebarMenue,
  setForm,
  setSidebarMenue,
} from "./formDialog/dialogSlice";
import Result from "./result/Result";

const { Header, Content, Sider, Footer } = Layout;

const HomePage = () => {
  const navigate = useNavigate();
  const menue = useSelector(selectCurrentSidebarMenue);
  const dispatch = useDispatch();

  const dataMenuItems = [
    {
      key: "data-calendar",
      label: "Calendar",
      onClick: () => dispatch(setSidebarMenue("data-calendar")),
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
  ];

  return (
    <Layout className="h-full p-5" style={{ background: "#FFFFFF" }}>
      <Sider
        width={350}
        style={{ background: "#F2F2F2" }}
        className="rounded-xl overflow-y-scroll"
      >
        <img
          src={"./logo.svg"}
          alt="logo"
          className="m-auto mt-5"
          onClick={() => navigate("/home")}
        />
        {menue == "result-add" || menue == "result-show" ? (
          <Result />
        ) : (
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
                children: dataMenuItems,
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
                children: [
                  { key: "live-calendar", label: "Calendar" },
                  { key: "live-fleet", label: "Fleet" },
                  { key: "live-order", label: "Order" },
                ],
              },
              {
                key: "4",
                label: "Analytics",
                icon: <BarChartOutlined />,
                children: [
                  { key: "analytics-calendar", label: "Calendar" },
                  { key: "analytics-fleet", label: "Fleet" },
                  { key: "analytics-order", label: "Order" },
                ],
              },
              {
                key: "5",
                label: "Administration",
                icon: <UserOutlined />,
                children: [
                  { key: "administration-calendar", label: "Calendar" },
                  { key: "administration-fleet", label: "Fleet" },
                  { key: "administration-order", label: "Order" },
                ],
              },
            ]}
          />
        )}
      </Sider>
      <Layout style={{ padding: "0 0 0 10px", background: "#FFFFFF" }}>
        {/*<Header
          style={{
            background: "#FFFFFF",
          }}
          className="flex justify-end items-center gap-4"
        >
          <UserOutlined className="bg-[#D9D9D9] p-3 rounded-full" />
          <div className="text-[#0B1F40] font-bold text-xl">Hamed Kahani</div>
          <PhoneOutlined />
          <Button className="border-[#0B1F40]! border-2!">Logout</Button>
        </Header> */}

        <Content>
          <Map />
          <CustomDialog />
        </Content>
        <Footer style={{ background: "#FFFFFF", padding: 0 }}>
          {menue == "data-order" && <OrderTable />}
          {menue == "data-fleet" && <FleetTable />}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default HomePage;
