const { ActivityModel } = require("../model");

const logActivity = (data) => ActivityModel.create(data);

const getActivity = ({ userId, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  return ActivityModel.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

const countActivity = (userId) => ActivityModel.countDocuments({ user: userId });

module.exports = { logActivity, getActivity, countActivity };
