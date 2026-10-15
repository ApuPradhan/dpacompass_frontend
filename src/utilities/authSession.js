import { expireSession } from "./fetchWithAuth";

const AUTH_ENDPOINTS = [
    "/api/auth/refresh/",
    "/api/auth/login/",
    "/api/auth/signin/",
];

export const installGlobalAuthInterceptor = () => {
    if (window.__authInterceptorInstalled) return;

    window.__authInterceptorInstalled = true;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, options = {}) => {
        const {
            __skipGlobalAuthCheck,
            ...fetchOptions
        } = options;

        const url =
            typeof input === "string"
                ? input
                : input instanceof Request
                    ? input.url
                    : String(input);

        const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
            url.includes(path)
        );

        const response = await originalFetch(input, fetchOptions);

        if (
            response.status === 401 &&
            !__skipGlobalAuthCheck &&
            !isAuthEndpoint &&
            localStorage.getItem("access")
        ) {
            expireSession();
        }

        return response;
    };
};