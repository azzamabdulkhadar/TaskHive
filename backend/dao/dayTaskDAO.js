const { DayTaskModel } = require("../model");

const getDayTasks = ({ userId, startDate, endDate, type }) => {
  const query = { user: userId };
  if (startDate || endDate) {
    query.startAt = {};
    if (startDate) query.startAt.$gte = new Date(startDate);
    if (endDate) query.startAt.$lte = new Date(endDate);
  }
  if (type) query.type = type;
  return DayTaskModel.find(query).sort({ startAt: 1 }).limit(500);
};

const createDayTask = (data) => DayTaskModel.create(data);

const updateDayTask = (id, userId, data) =>
  DayTaskModel.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });

const deleteDayTask = (id, userId) => DayTaskModel.findOneAndDelete({ _id: id, user: userId });

module.exports = { getDayTasks, createDayTask, updateDayTask, deleteDayTask };
