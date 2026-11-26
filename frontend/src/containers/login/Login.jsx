import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/slices/sessionSlice";
import { Card, Button, Checkbox, Form, Input, Typography } from "antd";
import styles from "./Login.module.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Title } = Typography;

  const onFinish = (values) => {
    console.log(values);
    axios
      .get(
        `http://localhost:3000/user?email=${values?.email}&password=${values?.password}`
      )
      .then((response) => {
        alert(response?.data?.message);
        if (response?.data?.success) {
          dispatch(login(response?.data?.data?.[0]));
          navigate("/user/dashboard");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div
      className={`${styles["loginMain"]} d-flex justify-content-center  align-items-center`}
    >
      <Card variant="borderless" style={{ width: 400, height: "auto" }}>
        <Title level={1}>Login</Title>
        <Form
          className={`mt-4`}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            label={null}
            style={{ display: "flex", justifyContent: "end" }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Form.Item label={null}>
              <Button style={{ width: 150 }} type="primary" htmlType="submit">
                Login
              </Button>
            </Form.Item>
            <Form.Item label={null}>
              <Button
                style={{ width: 150 }}
                type="primary"
                onClick={() => {
                  navigate("/signup");
                }}
              >
                Signup
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
