import apiClient from "../../services/apiClient";

export const listAdminDecksApi = async (filters = {}) => {
  const response = await apiClient.get("/admin/decks", { params: filters });
  return response.data;
};

export const createAdminDeckApi = async (payload) => {
  const response = await apiClient.post("/admin/decks", payload);
  return response.data;
};

export const getAdminDeckByIdApi = async (id) => {
  const response = await apiClient.get(`/admin/decks/${id}`);
  return response.data;
};

export const updateAdminDeckApi = async (id, payload) => {
  const response = await apiClient.put(`/admin/decks/${id}`, payload);
  return response.data;
};

export const deleteAdminDeckApi = async (id) => {
  const response = await apiClient.delete(`/admin/decks/${id}`);
  return response.data;
};

export const listCefrLevelsApi = async () => {
  const response = await apiClient.get("/cefr-levels");
  return response.data;
};

export const listTagsApi = async () => {
  const response = await apiClient.get("/tags");
  return response.data;
};

export const createTagApi = async (label) => {
  const response = await apiClient.post("/admin/tags", { label });
  return response.data;
};

export const updateTagApi = async (id, label) => {
  const response = await apiClient.put(`/admin/tags/${id}`, { label });
  return response.data;
};

export const deleteTagApi = async (id) => {
  const response = await apiClient.delete(`/admin/tags/${id}`);
  return response.data;
};
