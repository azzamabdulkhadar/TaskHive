const express = require("express");
const router = express.Router();
const { leadController } = require("../controller");
const { authenticate } = require("../middleware");

router.use(authenticate);

router.get("/", leadController.getLeads);
router.get("/:id", leadController.getLeadById);
router.post("/", leadController.createLead);
router.patch("/:id", leadController.updateLead);
router.delete("/:id", leadController.deleteLead);

module.exports = router;
