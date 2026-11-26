import React, { useState, useEffect } from "react";
import styles from "./Event.module.css";
import { Badge, Calendar } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import EventModal from "../../components/event-modal/EventModel";

const getListData = (value) => {
  let listData = []; // Specify the type of listData
  switch (value.date()) {
    case 8:
      listData = [
        { type: "warning", content: "This is warning event." },
        { type: "success", content: "This is usual event." },
      ];
      break;
    case 10:
      listData = [
        { type: "warning", content: "This is warning event." },
        { type: "success", content: "This is usual event." },
        { type: "error", content: "This is error event." },
      ];
      break;
    case 15:
      listData = [
        { type: "warning", content: "This is warning event" },
        { type: "success", content: "This is very long usual event......" },
        { type: "error", content: "This is error event 1." },
        { type: "error", content: "This is error event 2." },
        { type: "error", content: "This is error event 3." },
        { type: "error", content: "This is error event 4." },
      ];
      break;
    default:
  }
  return listData || [];
};
const getMonthData = (value) => {
  if (value.month() === 8) {
    return 1394;
  }
};
const Event = () => {
  const sessionData = useSelector((state) => state.session.userData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventData, setEventData] = useState([]);

  const eventMap = eventData.reduce((map, evt) => {
    const day = dayjs(evt.date).date(); // 1–31
    if (!map[day]) map[day] = [];
    map[day].push(evt);
    return map;
  }, {});

  const dateCellRender = (value) => {
    // value is a dayjs/moment of the cell
    const day = dayjs(value).date();
    const listData = eventMap[day] || []; // fetch or empty
    console.log(listData);
    return (
      <ul className="events">
        {listData.map(({ description }, idx) => {
          return (
            <li key={idx}>
              <p>{description}</p>
            </li>
          );
        })}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    // if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = (data, id) => {
    if (id) {
      console.log("data ", data);
      data.user = sessionData?._id;
      axios
        .put(`http://localhost:3000/event/${id}`, data)
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
      data.date = selectedDate;
      data.user = sessionData?._id;
      axios
        .post("http://localhost:3000/event", data)
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

  const getEnquires = () => {
    axios
      .get(`http://localhost:3000/event?user=${sessionData?._id}`)
      .then((response) => {
        let data = [];
        console.log("data ", response.data);
        for (let i = 0; i < response?.data?.data?.length; i++) {
          data.push({ ...response?.data?.data[i], id: i + 1 });
        }
        setEventData(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getEnquires();
  }, []);
  return (
    <div className={`${styles?.eventMain}`}>
      <Calendar
        fullscreen
        cellRender={cellRender}
        onSelect={(date) => {
          setSelectedDate(date);
          setIsModalOpen(true);
        }}
      />
      <EventModal
        handleOk={handleOk}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        showModal={showModal}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default Event;
