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
import SideBarComponent from "./SideBarComponent";
import Description from "./map/Description";

const { Header, Content, Sider, Footer } = Layout;

const HomePage = () => {
  const menue = useSelector(selectCurrentSidebarMenue);

  return (
    <Layout className="h-full p-5" style={{ background: "#FFFFFF" }}>
      <SideBarComponent />
      <Layout style={{ padding: "0 0 0 10px", background: "#FFFFFF" }}>
        <Header
          style={{
            background: "#FFFFFF",
          }}
          className="flex justify-end items-center gap-4"
        >
          <UserOutlined className="bg-[#D9D9D9] p-3 rounded-full" />
          <div className="text-[#0B1F40] font-bold text-xl">Hamed Kahani</div>
          <PhoneOutlined />
          <Button className="border-[#0B1F40]! border-2!">Logout</Button>
        </Header>

        <Content className="relative">
          <Map />
          <Description />
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
