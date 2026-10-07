import api from "./axiosInstance";

export const getLeads    = (params)   => api.get("/leads",       { params });
export const getLeadById = (id)       => api.get(`/leads/${id}`);
export const createLead  = (data)     => api.post("/leads",      data);
export const updateLead  = (id, data) => api.patch(`/leads/${id}`, data);
export const deleteLead  = (id)       => api.delete(`/leads/${id}`);
