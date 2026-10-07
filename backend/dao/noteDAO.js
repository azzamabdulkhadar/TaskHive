const { NoteModel } = require("../model");

/**
 * Get all notes for a user with optional filtering.
 */
const getNotes = ({ userId, search, priority, isArchived, isPinned, page = 1, limit = 50 }) => {
  const query = { user: userId };

  if (typeof isArchived === "boolean") query.isArchived = isArchived;
  if (typeof isPinned === "boolean") query.isPinned = isPinned;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const skip = (page - 1) * limit;
  return NoteModel.find(query).sort({ isPinned: -1, updatedAt: -1 }).skip(skip).limit(limit);
};

const countNotes = ({ userId, isArchived }) => {
  const query = { user: userId };
  if (typeof isArchived === "boolean") query.isArchived = isArchived;
  return NoteModel.countDocuments(query);
};

const getNoteById = (id, userId) => NoteModel.findOne({ _id: id, user: userId });

const createNote = (data) => NoteModel.create(data);

const updateNote = (id, userId, data) =>
  NoteModel.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });

const deleteNote = (id, userId) => NoteModel.findOneAndDelete({ _id: id, user: userId });

module.exports = { getNotes, countNotes, getNoteById, createNote, updateNote, deleteNote };
