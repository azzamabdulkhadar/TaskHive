const { LeadModel } = require("../model");

const getLeads = ({ userId, search, status, priority, page = 1, limit = 20 }) => {
  const query = { user: userId };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  return LeadModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

const countLeads = ({ userId, status }) => {
  const query = { user: userId };
  if (status) query.status = status;
  return LeadModel.countDocuments(query);
};

const getLeadById = (id, userId) => LeadModel.findOne({ _id: id, user: userId });

const createLead = (data) => LeadModel.create(data);

const updateLead = (id, userId, data) =>
  LeadModel.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });

const deleteLead = (id, userId) => LeadModel.findOneAndDelete({ _id: id, user: userId });

module.exports = { getLeads, countLeads, getLeadById, createLead, updateLead, deleteLead };
