import { DATA_BREACH_API_BASE_URL } from "../config";

export const breachApi = async (endpoint, options = {}) => {
    console.log(
        "Request payload:",
        options.body ? JSON.parse(options.body) : null
    );

    const response = await fetch(
        `${DATA_BREACH_API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            JSON.stringify(data) ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
};


export const getSelfCheckBreachScanStatus = async (status) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const username = userData.username;

    if (!username) {
        throw new Error("Username not found in localStorage.");
    }
    
    
    const response = await fetch(
        `${DATA_BREACH_API_BASE_URL}/api/scanner/webscan/status/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                status,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
};

// ============================================================
// GET DATA BREACH CHECKLIST ASSESSMENT REPORT
// GET /api/audits/<public_audit_id>/checklist-report/
// ============================================================

export const getDataBreachChecklistReport = async (publicAuditId) => {
    if (!publicAuditId) {
        throw new Error("Public Audit ID is required.");
    }

    const response = await breachApi(
        `/api/audits/${encodeURIComponent(publicAuditId)}/checklist-report/`,
        {
            method: "GET",
        }
    );

    if (response?.status !== "success") {
        throw new Error(
            response?.message ||
            "Failed to fetch Data Breach checklist report."
        );
    }

    return response;
};


export const getSelfCheckBreachScanHTMLReport = async (auditId) => {
    if (
        auditId === undefined ||
        auditId === null ||
        String(auditId).trim() === ""
    ) {
        throw new Error("Audit ID is required to fetch the report.");
    }

    const baseUrl = DATA_BREACH_API_BASE_URL.replace(/\/+$/, "");

    const endpoint = `${baseUrl}/api/audits/${encodeURIComponent(
        String(auditId)
    )}/html-report/`;

    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            Accept: "text/html, application/json",
        },
    });

    // Read the response as text first because the API may return
    // either an HTML document or a JSON response.
    const responseText = await response.text();

    // Handle unsuccessful responses.
    if (!response.ok) {
        let errorData = {};

        try {
            errorData = responseText ? JSON.parse(responseText) : {};
        } catch {
            // Response may be plain text or an HTML error page.
        }

        throw new Error(
            errorData.message ||
            errorData.detail ||
            errorData.error ||
            `Unable to fetch report. HTTP ${response.status}`
        );
    }

    const contentType = response.headers.get("content-type") || "";

    let html = responseText;

    // Handle JSON response.
    if (contentType.includes("application/json")) {
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error("The report API returned invalid JSON.");
        }

        if (data.success === false || data.status === "error") {
            throw new Error(
                data.message ||
                data.detail ||
                "Unable to retrieve the report."
            );
        }

        // Extract HTML from supported response structures.
        html =
            data.html ||
            data.report_html ||
            data.content ||
            data.data?.html ||
            data.data?.report_html ||
            "";
    }

    // Validate the returned HTML.
    if (
        typeof html !== "string" ||
        !html.trim()
    ) {
        throw new Error("The server returned an empty HTML report.");
    }

    // Ensure the response looks like an HTML document.
    if (
        !/<(?:!doctype\s+html|html|body|head)\b/i.test(html)
    ) {
        throw new Error(
            "The API response does not contain a valid HTML document."
        );
    }

    return html;
};