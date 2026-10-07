const jwt = require("jsonwebtoken");
const { userDAO, activityDAO } = require("../dao");

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /api/v1/users/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, dob, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required.", data: null });
    }

    const existing = await userDAO.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists.", data: null });
    }

    const user = await userDAO.createUser({ name, email, password, phone, dob, gender });
    const token = signToken(user);

    await activityDAO.logActivity({ user: user._id, entityType: "auth", action: "LOGIN", entityTitle: "Account created" });

    res.status(201).json({ success: true, message: "Account created successfully.", data: { user, token } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required.", data: null });
    }

    const user = await userDAO.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password.", data: null });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password.", data: null });
    }

    const token = signToken(user);

    await activityDAO.logActivity({ user: user._id, entityType: "auth", action: "LOGIN", entityTitle: "Logged in" });

    // Strip password from response
    const userObj = user.toJSON();
    res.json({ success: true, message: "Login successful.", data: { user: userObj, token } });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/me  (protected)
const getMe = async (req, res, next) => {
  try {
    const user = await userDAO.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found.", data: null });
    }
    res.json({ success: true, message: "User fetched successfully.", data: { user } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/users/me  (protected)
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, dob, gender, avatar, theme } = req.body;
    const user = await userDAO.updateUser(req.user._id, { name, phone, dob, gender, avatar, theme });
    res.json({ success: true, message: "Profile updated successfully.", data: { user } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/users/me/password  (protected)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required.", data: null });
    }

    const user = await userDAO.findUserByEmail(req.user.email);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect.", data: null });
    }

    user.password = newPassword;
    await user.save(); // triggers bcrypt pre-save hook
    res.json({ success: true, message: "Password changed successfully.", data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateMe, changePassword };
