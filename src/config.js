const runtimeConfig = window.__APP_CONFIG__ || {};

export const API_BASE_URL =
  runtimeConfig.API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8001";

export const SOCKET_BASE_URL =
  runtimeConfig.SOCKET_BASE_URL ??
  import.meta.env.VITE_SOCKET_BASE_URL ??
  "ws://localhost:8001";

export const CONSENT_API_BASE_URL =
  runtimeConfig.CONSENT_API_BASE_URL ??
  import.meta.env.VITE_CONSENT_API_BASE_URL ??
  "http://localhost:8000";

  export const DATA_BREACH_API_BASE_URL =
    import.meta.env.VITE_DATA_BREACH_API_BASE_URL;