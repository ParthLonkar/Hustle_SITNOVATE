const API_BASE = ""; // Vite proxy will handle this

const parseJson = async (res) => {
  try {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || `Request failed with status ${res.status}`;
      console.error("[API Error]", res.status, msg);
      throw new Error(msg);
    }
    return data;
  } catch (e) {
    console.error("[API Parse Error]", e);
    throw e;
  }
};

// Get token from multiple sources for reliability
const getToken = (token) => {
  if (token) return token;
  // Fallback to localStorage if no token passed
  return localStorage.getItem("ag_token");
};

const authHeader = (token) => {
  const t = getToken(token);
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const apiGet = async (path, token) => {
  // Use path as-is since Vite proxy handles /api -> http://localhost:5000/api
  const t = getToken(token);
  
  console.log("[API GET]", path, "Token present:", !!t);
  
  const res = await fetch(path, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(t) 
    },
  });
  
  const data = await parseJson(res);
  console.log("[API GET Response]", path, data);
  return data;
};

export const apiPost = async (path, body, token) => {
  // Use path as-is since Vite proxy handles /api -> http://localhost:5000/api
  const t = getToken(token);
  
  console.log("[API POST]", path, "Token present:", !!t, "Body:", body);
  
  const res = await fetch(path, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      ...authHeader(t) 
    },
    body: JSON.stringify(body),
  });
  
  const data = await parseJson(res);
  console.log("[API POST Response]", path, data);
  return data;
};
