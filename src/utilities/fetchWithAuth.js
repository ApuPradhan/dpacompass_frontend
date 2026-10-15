
import { API_BASE_URL } from "../config";

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

export const expireSession = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");

  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT)
  );
};

export const fetchWithAuth = async (url, options = {}) => {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!access) {
    expireSession();
    throw new Error("Session expired. Please sign in again.");
  }

  const makeRequest = async (token) => {
    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      __skipGlobalAuthCheck: true,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  let response = await makeRequest(access);

  if (response.status === 401) {
    if (!refresh) {
      expireSession();
      return response;
    }

    try {
      const refreshRes = await fetch(
        `${API_BASE_URL}/api/auth/refresh/`,
        {
          method: "POST",
          __skipGlobalAuthCheck: true,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        }
      );

      const data = await refreshRes.json().catch(() => ({}));

      if (refreshRes.ok && data.access) {
        localStorage.setItem("access", data.access);

        response = await makeRequest(data.access);

        if (response.status === 401) {
          expireSession();
        }
      } else {
        expireSession();
      }
    } catch (err) {
      console.error("Refresh error:", err);
      expireSession();
    }
  }

  return response;
};
