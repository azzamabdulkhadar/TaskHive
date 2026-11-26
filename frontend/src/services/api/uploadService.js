import axios from "axios";

/**
 * Upload a single file to POST /api/v1/upload
 * Returns { url, name, type } on success (name = original file name).
 *
 * Uses a fresh axios instance with multipart headers so it doesn't
 * conflict with the default JSON instance.
 */
export const uploadFile = async (file) => {
  const token = localStorage.getItem("th_token");

  const form = new FormData();
  form.append("file", file);

  const res = await axios.post("/api/v1/upload", form, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 30000,
  });

  const d = res.data?.data;
  if (!d?.url) return null;
  return { url: d.url, name: d.originalName || file.name, type: d.mimetype || file.type };
};
