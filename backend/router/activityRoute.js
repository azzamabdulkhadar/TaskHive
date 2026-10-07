const express = require("express");
const router = express.Router();
const { activityController } = require("../controller");
const { authenticate } = require("../middleware");

router.use(authenticate);

router.get("/", activityController.getActivity);

module.exports = router;
