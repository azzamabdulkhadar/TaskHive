import api from "./axiosInstance";

export const getNotes    = (params) => api.get("/notes",      { params });
export const getNoteById = (id)     => api.get(`/notes/${id}`);
export const createNote  = (data)   => api.post("/notes",     data);
export const updateNote  = (id, data) => api.patch(`/notes/${id}`, data);
export const deleteNote  = (id)     => api.delete(`/notes/${id}`);
