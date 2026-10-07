const { activityDAO } = require("../dao");

// GET /api/v1/activity
const getActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const [activity, total] = await Promise.all([
      activityDAO.getActivity({ userId, page: Number(page), limit: Number(limit) }),
      activityDAO.countActivity(userId),
    ]);

    res.json({ success: true, message: "Activity fetched successfully.", data: { activity, total } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivity };
