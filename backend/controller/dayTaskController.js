const { dayTaskDAO } = require("../dao");

const ALLOWED = ["title", "notes", "type", "startAt", "durationMin", "priority", "done", "status"];
const pick = (body) => Object.fromEntries(Object.entries(body || {}).filter(([k]) => ALLOWED.includes(k)));

// GET /api/v1/day-tasks?startDate=&endDate=&type=
const getDayTasks = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const tasks = await dayTaskDAO.getDayTasks({ userId: req.user._id, startDate, endDate, type });
    res.json({ success: true, message: "Day tasks fetched successfully.", data: { tasks } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/day-tasks
const createDayTask = async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.title) return res.status(400).json({ success: false, message: "Title is required.", data: null });
    if (!data.startAt) return res.status(400).json({ success: false, message: "Date and time are required.", data: null });
    const task = await dayTaskDAO.createDayTask({ ...data, user: req.user._id });
    res.status(201).json({ success: true, message: "Day task created successfully.", data: { task } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/day-tasks/:id
const updateDayTask = async (req, res, next) => {
  try {
    const task = await dayTaskDAO.updateDayTask(req.params.id, req.user._id, pick(req.body));
    if (!task) return res.status(404).json({ success: false, message: "Day task not found.", data: null });
    res.json({ success: true, message: "Day task updated successfully.", data: { task } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/day-tasks/:id
const deleteDayTask = async (req, res, next) => {
  try {
    const task = await dayTaskDAO.deleteDayTask(req.params.id, req.user._id);
    if (!task) return res.status(404).json({ success: false, message: "Day task not found.", data: null });
    res.json({ success: true, message: "Day task deleted successfully.", data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDayTasks, createDayTask, updateDayTask, deleteDayTask };
