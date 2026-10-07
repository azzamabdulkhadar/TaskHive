const { UserModel } = require("../model");

const createUser = (data) => UserModel.create(data);

const findUserByEmail = (email) => UserModel.findOne({ email }).select("+password");

const findUserById = (id) => UserModel.findById(id);

const updateUser = (id, data) =>
  UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteUser = (id) => UserModel.findByIdAndDelete(id);

module.exports = { createUser, findUserByEmail, findUserById, updateUser, deleteUser };
