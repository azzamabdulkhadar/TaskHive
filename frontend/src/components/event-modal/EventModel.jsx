import { Select, Modal, Form, Input, Button, message, Upload } from "antd";
import { useState } from "react";

const EventModal = (props) => {
  const [enquiryForm] = Form.useForm();

  const onFinish = (values) => {
    props?.handleOk(values, props?.selectedRow?._id);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Modal
        title="Event"
        closable={{ "aria-label": "Custom Close Button" }}
        open={props?.isModalOpen}
        onOk={() => enquiryForm.submit()}
        onCancel={props?.handleCancel}
      >
        <Form
          form={enquiryForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={props?.selectedRow}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input your description!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default EventModal;
