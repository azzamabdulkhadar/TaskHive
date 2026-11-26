import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu } from "antd";
import {
  ContainerOutlined,
  DesktopOutlined,
  LogoutOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import styles from "./MainLayout.module.css";
import { logout } from "../../redux/slices/sessionSlice";
import Header from "../header/Header";
const items = [
  { key: "1", icon: <PieChartOutlined />, label: "Enquiry" },
  { key: "2", icon: <DesktopOutlined />, label: "Notes" },
  { key: "3", icon: <ContainerOutlined />, label: "Events" },
  { key: "4", icon: <LogoutOutlined />, label: "Logout" },
];
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onMenuItemSelected = ({ key }) => {
    console.log(key);
    switch (key) {
      case "1":
        navigate("/user/dashboard");
        break;
      case "2":
        navigate("/user/notes");
        break;
      case "3":
        navigate("/user/events");
        break;
      case "4":
        dispatch(logout());
        navigate("/");
        break;
    }
  };

  return (
    <div style={{ width: "100vw" }}>
      <div className={`${styles?.customHeader}`}>
        <Header />
      </div>
      <div className={`${styles?.customBody}`}>
        <div
          style={{ width: 256 }}
          onMouseEnter={() => {
            setCollapsed(false);
          }}
          onMouseLeave={() => {
            setCollapsed(true);
          }}
        >
          <Menu
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            mode="inline"
            // theme="dark"
            inlineCollapsed={collapsed}
            items={items}
            onSelect={onMenuItemSelected}
          />
        </div>
        <Outlet />
      </div>
      <div className={`${styles?.customFooter}`}>
        {/* © 2025 Copyright by Azzam-Abdul-Khadar. All rights reserved. */}
         © 2025 Azzam-Abdul-Khadar. All rights reserved.
      </div>
    </div>
  );
};

export default MainLayout;
