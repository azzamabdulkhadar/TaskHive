const { noteDAO, activityDAO } = require("../dao");

// GET /api/v1/notes
const getNotes = async (req, res, next) => {
  try {
    const { search, priority, isArchived, isPinned, page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const filters = {
      userId,
      search,
      priority,
      page: Number(page),
      limit: Number(limit),
    };
    if (isArchived !== undefined) filters.isArchived = isArchived === "true";
    if (isPinned !== undefined) filters.isPinned = isPinned === "true";

    const [notes, total] = await Promise.all([
      noteDAO.getNotes(filters),
      noteDAO.countNotes({ userId, isArchived: filters.isArchived }),
    ]);

    res.json({ success: true, message: "Notes fetched successfully.", data: { notes, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/notes/:id
const getNoteById = async (req, res, next) => {
  try {
    const note = await noteDAO.getNoteById(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found.", data: null });
    res.json({ success: true, message: "Note fetched successfully.", data: { note } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/notes
const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, category, priority, color, isPinned, file } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required.", data: null });

    const note = await noteDAO.createNote({
      title, content, tags, category, priority, color, isPinned, file,
      user: req.user._id,
    });

    await activityDAO.logActivity({ user: req.user._id, entityType: "note", entityId: note._id, entityTitle: note.title, action: "CREATE" });

    res.status(201).json({ success: true, message: "Note created successfully.", data: { note } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const note = await noteDAO.updateNote(req.params.id, req.user._id, req.body);
    if (!note) return res.status(404).json({ success: false, message: "Note not found.", data: null });

    await activityDAO.logActivity({ user: req.user._id, entityType: "note", entityId: note._id, entityTitle: note.title, action: "UPDATE" });

    res.json({ success: true, message: "Note updated successfully.", data: { note } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const note = await noteDAO.deleteNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found.", data: null });

    await activityDAO.logActivity({ user: req.user._id, entityType: "note", entityId: note._id, entityTitle: note.title, action: "DELETE" });

    res.json({ success: true, message: "Note deleted successfully.", data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };
