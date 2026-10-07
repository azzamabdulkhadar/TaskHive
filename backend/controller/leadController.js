const { leadDAO, activityDAO } = require("../dao");

// GET /api/v1/leads
const getLeads = async (req, res, next) => {
  try {
    const { search, status, priority, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const [leads, total] = await Promise.all([
      leadDAO.getLeads({ userId, search, status, priority, page: Number(page), limit: Number(limit) }),
      leadDAO.countLeads({ userId, status }),
    ]);

    res.json({ success: true, message: "Leads fetched successfully.", data: { leads, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/leads/:id
const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadDAO.getLeadById(req.params.id, req.user._id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found.", data: null });
    res.json({ success: true, message: "Lead fetched successfully.", data: { lead } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/leads
const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, alternatePhone, type, source, status, priority, tags, description, visitReason, nextFollowUpAt } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required.", data: null });

    const lead = await leadDAO.createLead({
      name, company, email, phone, alternatePhone, type, source, status, priority,
      tags, description, visitReason, nextFollowUpAt,
      user: req.user._id,
    });

    await activityDAO.logActivity({ user: req.user._id, entityType: "lead", entityId: lead._id, entityTitle: lead.name, action: "CREATE" });

    res.status(201).json({ success: true, message: "Lead created successfully.", data: { lead } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/leads/:id
const updateLead = async (req, res, next) => {
  try {
    const prevLead = await leadDAO.getLeadById(req.params.id, req.user._id);
    if (!prevLead) return res.status(404).json({ success: false, message: "Lead not found.", data: null });

    const lead = await leadDAO.updateLead(req.params.id, req.user._id, req.body);

    const action = req.body.status && req.body.status !== prevLead.status ? "STATUS_CHANGE" : "UPDATE";
    await activityDAO.logActivity({
      user: req.user._id, entityType: "lead", entityId: lead._id, entityTitle: lead.name, action,
      metadata: action === "STATUS_CHANGE" ? { from: prevLead.status, to: lead.status } : {},
    });

    res.json({ success: true, message: "Lead updated successfully.", data: { lead } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/leads/:id
const deleteLead = async (req, res, next) => {
  try {
    const lead = await leadDAO.deleteLead(req.params.id, req.user._id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found.", data: null });

    await activityDAO.logActivity({ user: req.user._id, entityType: "lead", entityId: lead._id, entityTitle: lead.name, action: "DELETE" });

    res.json({ success: true, message: "Lead deleted successfully.", data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead };
