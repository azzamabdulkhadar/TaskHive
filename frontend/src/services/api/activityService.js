import api from "./axiosInstance";
export const getActivity = (params) => api.get("/activity", { params });
