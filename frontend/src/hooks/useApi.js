import { useState, useCallback } from "react";

/**
 * Generic hook for API calls with loading/error state.
 * Usage: const { call, loading, error } = useApi(serviceFn)
 */
const useApi = (apiFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  const call = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFn(...args);
        setData(res.data?.data ?? res.data);
        return res.data;
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Something went wrong";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return { call, loading, error, data };
};

export default useApi;
