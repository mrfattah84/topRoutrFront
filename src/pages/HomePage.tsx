import React, { useEffect, useRef } from "react";
import { Breadcrumb, Button, Layout, Menu, theme } from "antd";
import {
  BarChartOutlined,
  ContainerOutlined,
  FieldTimeOutlined,
  FileOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Map from "../components/Map";
import CustomTable from "../components/CustomTable";

const { Header, Content, Sider, Footer } = Layout;

const HomePage = () => {
  return (
    <Layout className="h-full p-5" style={{ background: "#FFFFFF" }}>
      <Sider
        width={200}
        style={{ background: "#F2F2F2" }}
        className="rounded-xl"
      >
        <img src={"./logo.svg"} alt="logo" className="m-auto mt-5" />
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
              children: [
                {
                  key: "1-1",
                  label: "calendar",
                },
                { key: "1-2", label: "Fleet" },
                { key: "1-3", label: "Order", onClick: () => {} },
              ],
            },
            {
              key: "2",
              label: "Result",
              icon: <ContainerOutlined />,
              children: [
                { key: "1-1", label: "calendar" },
                { key: "1-2", label: "Fleet" },
                { key: "1-3", label: "Order" },
              ],
            },
            {
              key: "3",
              label: "Live",
              icon: <FieldTimeOutlined />,
              children: [
                { key: "1-1", label: "calendar" },
                { key: "1-2", label: "Fleet" },
                { key: "1-3", label: "Order" },
              ],
            },
            {
              key: "4",
              label: "Analytics",
              icon: <BarChartOutlined />,
              children: [
                { key: "1-1", label: "calendar" },
                { key: "1-2", label: "Fleet" },
                { key: "1-3", label: "Order" },
              ],
            },
            {
              key: "5",
              label: "Administration",
              icon: <UserOutlined />,
              children: [
                { key: "1-1", label: "calendar" },
                { key: "1-2", label: "Fleet" },
                { key: "1-3", label: "Order" },
              ],
            },
          ]}
        />
      </Sider>
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
        <Content>
          <Map />
        </Content>
        <Footer style={{ background: "#FFFFFF" }}>
          <CustomTable />
        </Footer>
      </Layout>
    </Layout>
  );
};

export default HomePage;
