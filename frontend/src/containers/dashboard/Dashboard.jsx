import React, { useEffect, useState } from "react";
import { FloatButton, Table, Button } from "antd";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import axios from "axios";
import styles from "./Dashboard.module.css";
import EnquiryModal from "../../components/enquiry-modal/Enquirymodal";

const Dashboard = () => {
  const sessionData = useSelector((state) => state.session.userData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [leadData, setLeadData] = useState([]);

  const columns = [
    {
      title: "Sl. No.:",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Visit Reason",
      dataIndex: "visitReason",
      key: "visitReason",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      dataIndex: "__v",
      key: "__v",
      render: (value, record, index) => {
        return (
          <div style={{ display: "flex", gap: "4px" }}>
            <Button
              type="primary"
              shape="circle"
              icon={<EditFilled />}
              onClick={() => {
                setSelectedRow(record);
                setIsModalOpen(true);
              }}
            />
            <Button
              danger
              type="primary"
              shape="circle"
              icon={<DeleteFilled />}
              onClick={() => {
                console.log(record);
                deleteLead(record);
              }}
            />
          </div>
        );
      },
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = (data, id) => {
    if (id) {
      console.log("data ", data);
      data.user = sessionData?._id;
      axios
        .put(`http://localhost:3000/lead/${id}`, data)
        .then((response) => {
          alert(response?.data?.message);
          if (response?.data?.success) {
            setIsModalOpen(false);
            getEnquires();
            setSelectedRow(null);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("data ", data);
      data.user = sessionData?._id;
      axios
        .post("http://localhost:3000/lead", data)
        .then((response) => {
          alert(response?.data?.message);
          if (response?.data?.success) {
            setIsModalOpen(false);
            getEnquires();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function deleteLead(data) {
    console.log("data ", data);
    data.user = sessionData?._id;
    axios
      .delete(`http://localhost:3000/lead/${data?._id}`)
      .then((response) => {
        alert(response?.data?.message);
        if (response?.data?.success) {
          getEnquires();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getEnquires = () => {
    axios
      .get(`http://localhost:3000/lead?user=${sessionData?._id}`)
      .then((response) => {
        let data = [];
        console.log("data ", response.data);
        for (let i = 0; i < response?.data?.data?.length; i++) {
          data.push({ ...response?.data?.data[i], id: i + 1 });
        }
        setLeadData(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getEnquires();
  }, []);

  return (
    <div>
      {isModalOpen && (
        <EnquiryModal
          handleOk={handleOk}
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          showModal={showModal}
          selectedRow={selectedRow}
        />
      )}
      <Table
        style={{ width: "94vw", height: "80vh", padding: "40px" }}
        dataSource={leadData}
        columns={columns}
      />
      ;
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => showModal()}
      />
    </div>
  );
};

export default Dashboard;
