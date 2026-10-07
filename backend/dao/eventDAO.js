const { EventModel } = require("../model");

const getEvents = ({ userId, status, startDate, endDate, page = 1, limit = 100 }) => {
  const query = { user: userId };
  if (status) query.status = status;
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }
  const skip = (page - 1) * limit;
  return EventModel.find(query).sort({ startDate: 1 }).skip(skip).limit(limit);
};

const countEvents = ({ userId, status }) => {
  const query = { user: userId };
  if (status) query.status = status;
  return EventModel.countDocuments(query);
};

const getEventById = (id, userId) => EventModel.findOne({ _id: id, user: userId });

const createEvent = (data) => EventModel.create(data);

const updateEvent = (id, userId, data) =>
  EventModel.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });

const deleteEvent = (id, userId) => EventModel.findOneAndDelete({ _id: id, user: userId });

module.exports = { getEvents, countEvents, getEventById, createEvent, updateEvent, deleteEvent };
