const express = require("express");
const router = express.Router();
const { dayTaskController } = require("../controller");
const { authenticate } = require("../middleware");

router.use(authenticate);

router.get("/", dayTaskController.getDayTasks);
router.post("/", dayTaskController.createDayTask);
router.patch("/:id", dayTaskController.updateDayTask);
router.delete("/:id", dayTaskController.deleteDayTask);

module.exports = router;
