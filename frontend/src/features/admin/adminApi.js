const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const listAdminDecksApi = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.tagId) params.set("tagId", filters.tagId);
  if (filters.cefrLevelId) params.set("cefrLevelId", filters.cefrLevelId);
  if (filters.page) params.set("page", filters.page);
  if (filters.limit) params.set("limit", filters.limit);

  const res = await fetch(
    `${BASE_URL}/api/v1/admin/decks?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return res.json();
};

export const createAdminDeckApi = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/decks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateAdminDeckApi = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/decks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteAdminDeckApi = async (id) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/decks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const listCefrLevelsApi = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/cefr-levels`);
  return res.json();
};

export const listTagsApi = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/tags`);
  return res.json();
};

export const createTagApi = async (label) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/tags`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ label }),
  });
  return res.json();
};

export const updateTagApi = async (id, label) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/tags/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ label }),
  });
  return res.json();
};

export const deleteTagApi = async (id) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/tags/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
};
