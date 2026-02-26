const API_BASE = import.meta.env.VITE_API_BASE || "";

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || "Request failed.";
    throw new Error(msg);
  }
  return data;
};

const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const apiGet = async (path, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { ...authHeader(token) },
  });
  return parseJson(res);
};

export const apiPost = async (path, body, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(body),
  });
  return parseJson(res);
};
