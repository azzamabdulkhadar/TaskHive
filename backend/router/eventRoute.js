const express = require("express");
const router = express.Router();
const { eventController } = require("../controller");
const { authenticate } = require("../middleware");

router.use(authenticate);

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.patch("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
