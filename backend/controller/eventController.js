const { eventDAO, activityDAO } = require("../dao");

// GET /api/v1/events
const getEvents = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 100 } = req.query;
    const userId = req.user._id;

    const [events, total] = await Promise.all([
      eventDAO.getEvents({ userId, status, startDate, endDate, page: Number(page), limit: Number(limit) }),
      eventDAO.countEvents({ userId, status }),
    ]);

    res.json({ success: true, message: "Events fetched successfully.", data: { events, total } });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await eventDAO.getEventById(req.params.id, req.user._id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found.", data: null });
    res.json({ success: true, message: "Event fetched successfully.", data: { event } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/events
const createEvent = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, location, priority, status, reminder } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required.", data: null });
    if (!startDate) return res.status(400).json({ success: false, message: "Start date is required.", data: null });

    const event = await eventDAO.createEvent({
      title, description, startDate, endDate, location, priority, status, reminder,
      user: req.user._id,
    });

    await activityDAO.logActivity({ user: req.user._id, entityType: "event", entityId: event._id, entityTitle: event.title, action: "CREATE" });

    res.status(201).json({ success: true, message: "Event created successfully.", data: { event } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event = await eventDAO.updateEvent(req.params.id, req.user._id, req.body);
    if (!event) return res.status(404).json({ success: false, message: "Event not found.", data: null });

    await activityDAO.logActivity({ user: req.user._id, entityType: "event", entityId: event._id, entityTitle: event.title, action: "UPDATE" });

    res.json({ success: true, message: "Event updated successfully.", data: { event } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventDAO.deleteEvent(req.params.id, req.user._id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found.", data: null });

    await activityDAO.logActivity({ user: req.user._id, entityType: "event", entityId: event._id, entityTitle: event.title, action: "DELETE" });

    res.json({ success: true, message: "Event deleted successfully.", data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
