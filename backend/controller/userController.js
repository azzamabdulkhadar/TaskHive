const { UserDAO } = require("../dao");

const saveUser = async (req, res, next) => {
  try {
    const { body } = req;
    let savedUserData = await UserDAO.saveUser(body);
    res.json({
      success: true,
      message: "User saved successfully",
      data: savedUserData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error?.message, data: [] });
  }
};

const getUser = async (req, res, next) => {
  try {
    const { query } = req;
    let userData = await UserDAO.getUser(query);
    if (userData && userData.length > 0) {
      res.json({
        success: true,
        message: "User fetched successfully",
        data: userData,
      });
    } else {
      res.json({
        success: false,
        message: "Invalid email or password",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error?.message, data: [] });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { params, body } = req;
    let userData = await UserDAO.updateUser(params, body);
    res.json({
      success: true,
      message: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error?.message, data: [] });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { params } = req;
    let userData = await UserDAO.deleteUser(params);
    res.json({
      success: true,
      message: "User deleted successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error?.message, data: [] });
  }
};

module.exports = { saveUser, getUser, updateUser, deleteUser };
