import api from "./axiosInstance";

export const loginUser    = (data)        => api.post("/users/login",       data);
export const registerUser = (data)        => api.post("/users/register",    data);
export const getMe        = ()            => api.get("/users/me");
export const updateMe     = (data)        => api.patch("/users/me",         data);
export const changePassword = (data)      => api.patch("/users/me/password",data);
