import axios from "axios";

/**
 * Upload a single file to POST /api/v1/upload
 * Returns the hosted URL string on success.
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

  return res.data?.data?.url ?? null;
};
