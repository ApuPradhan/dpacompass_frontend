const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchWithAuth = async (url, options = {}) => {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");
  
  const makeRequest = async (token) => {
    
    return fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  let response = await makeRequest(access);
  
  // If access token expired
  if (response.status === 401 && refresh) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      const data = await refreshRes.json();

      if (refreshRes.ok && data.access) {
        // Store new access token
        localStorage.setItem("access", data.access);

        // Retry original request with new token
        response = await makeRequest(data.access);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Refresh error:", err);
      logout();
    }
  }

  return response;
};

// 🔥 Logout handler
const logout = () => {
  localStorage.clear();
  window.location.href = "/signin";
};