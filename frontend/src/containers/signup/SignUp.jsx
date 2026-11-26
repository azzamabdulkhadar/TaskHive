import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Typography,
} from "antd";
import styles from "./SignUp.module.css";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "others", label: "Others" },
];

const SignUp = () => {
  const [signUpForm] = Form.useForm();
  const { Title } = Typography;

  const navigate = useNavigate();

  const onFinish = (values) => {
    if (values?.password != values?.["re-password"]) {
      return alert("Password and Repassword are not same!");
    }
    axios
      .post("http://localhost:3000/user", values)
      .then((response) => {
        console.log("singup Response ", response);
        alert(response?.data?.message);
        if (response?.data?.success) {
          navigate("/");
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
      className={`${styles["signupMain"]} d-flex justify-content-center  align-items-center`}
    >
      <Card variant="borderless" style={{ width: 400, height: "auto" }}>
        <Title level={1}>Signup</Title>
        <Form
          form={signUpForm}
          name="basic"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input your name!" }]}
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
            label="Re-Password"
            name="re-password"
            rules={[
              { required: true, message: "Please input your re-password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="DOB"
            name="dob"
            rules={[{ required: true, message: "Please select DOB!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select gender!" }]}
          >
            <Select placeholder="gender" options={genderOptions} />
          </Form.Item>
        </Form>

        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Form.Item label={null}>
            <Button
              style={{ width: 150 }}
              type="primary"
              onClick={() => {
                signUpForm.submit();
              }}
            >
              Signup
            </Button>
          </Form.Item>
          <Form.Item label={null}>
            <Button
              style={{ width: 150 }}
              type="primary"
              onClick={() => {
                navigate("/");
              }}
            >
              Login
            </Button>
          </Form.Item>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
