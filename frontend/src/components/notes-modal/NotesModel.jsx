import { Select, Modal, Form, Input, Button, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const NotesModal = (props) => {
  const [enquiryForm] = Form.useForm();
  const [fileUrl, setFileUrl] = useState(null);

  const uploadProps = {
    name: "file",
    action: "http://localhost:3000/upload",
    headers: {},
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        console.log(info);
        setFileUrl(info?.file?.response?.url);
      } else if (info.file.status === "error") {
      }
    },
  };

  const onFinish = (values) => {
    props?.handleOk({ ...values, file: fileUrl }, props?.selectedRow?._id);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Modal
        title="Notes"
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
            label="Content"
            name="content"
            rules={[{ required: true, message: "Please input your content!" }]}
          >
            <Input />
          </Form.Item>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form>
      </Modal>
    </>
  );
};
export default NotesModal;
