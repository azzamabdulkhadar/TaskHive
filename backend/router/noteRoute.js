const express = require("express");
const router = express.Router();
const { noteController } = require("../controller");
const { authenticate } = require("../middleware");

router.use(authenticate); // all note routes are protected

router.get("/", noteController.getNotes);
router.get("/:id", noteController.getNoteById);
router.post("/", noteController.createNote);
router.patch("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

module.exports = router;
