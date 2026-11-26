import React from "react";
import zenutility from "../../assets/zenutility.png";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <div style={{ display: "flex", paddingLeft: 15 }}>
      <img height={50} src={zenutility} />
    </div>
  );
};

export default Header;
