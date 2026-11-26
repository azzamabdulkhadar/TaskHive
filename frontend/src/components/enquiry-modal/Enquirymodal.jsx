import { Select, Modal, Form, Input } from "antd";

const EnquiryModal = (props) => {
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
        title="Enquiry"
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
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Select
              options={[
                { value: "visit", label: "Visit" },
                { value: "meeting", label: "Meeting" },
                { value: "enquiry", label: "Enquiry" },
                { value: "delivery", label: "Delivery" },
                { value: "others", label: "Others" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Visit Reason"
            name="visitReason"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default EnquiryModal;
