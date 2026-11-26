import api from "./axiosInstance";

export const getDayTasks   = (params)     => api.get("/day-tasks", { params });
export const createDayTask = (data)       => api.post("/day-tasks", data);
export const updateDayTask = (id, data)   => api.patch(`/day-tasks/${id}`, data);
export const deleteDayTask = (id)         => api.delete(`/day-tasks/${id}`);
