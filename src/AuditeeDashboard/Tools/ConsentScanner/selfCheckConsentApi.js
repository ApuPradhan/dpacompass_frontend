import { CONSENT_API_BASE_URL } from "../../../config";

const API_BASE = CONSENT_API_BASE_URL.replace(/\/$/, "");

// Headers without authentication
const getHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
});

// Common response handler
const parseResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error ||
            data.detail ||
            data.message ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
};

// Common audit endpoint
const auditUrl = (publicAuditId) =>
    `${API_BASE}/api/audits/${encodeURIComponent(publicAuditId)}`;


/*
|--------------------------------------------------------------------------
| 1. Start Self-Check Consent Scan
|--------------------------------------------------------------------------
*/

export async function startSelfCheckConsentScan({
    url,
    max_pages,
    username = "",
    password = "",
    authentication_required = false,
    dpacompass_username,
}) {
    if (!url?.trim()) {
        throw new Error("Website URL is required.");
    }

    const parsedMaxPages = Number(max_pages);

    if (!Number.isInteger(parsedMaxPages) || parsedMaxPages < 1) {
        throw new Error("Maximum pages must be a valid positive integer.");
    }

    if (!dpacompass_username) {
        throw new Error("DPACOMPASS username is missing.");
    }

    const payload = {
        url: url.trim(),
        max_pages: parsedMaxPages,
        dpacompass_username,
        ...(authentication_required && {
            authentication_required: true,
        }),
        ...(username?.trim() && {
            username: username.trim(),
        }),
        ...(password && {
            password,
        }),
    };

    const response = await fetch(
        `${API_BASE}/api/audits/test-crawl/`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 2. Get DPACOMPASS Audits
|--------------------------------------------------------------------------
*/

export async function getDpacompassAudits() {
    let user;

    try {
        user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        throw new Error("Unable to retrieve logged-in user information.");
    }

    const dpacompassUsername = user?.username;

    if (!dpacompassUsername) {
        throw new Error("DPACOMPASS username is missing.");
    }

    const response = await fetch(
        `${API_BASE}/api/audits/dpacompass-audits/`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                dpacompass_username: dpacompassUsername,
            }),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 3. Get Complete Technical Scan Result
|--------------------------------------------------------------------------
*/

export async function getCompleteConsentScanResult(publicAuditId) {
    if (!publicAuditId) {
        throw new Error("Audit ID is required.");
    }

    const response = await fetch(
        `${auditUrl(publicAuditId)}/complete-result/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 4. Get Checklist Assessment
|--------------------------------------------------------------------------
*/

export async function getConsentChecklistAssessment(publicAuditId) {
    if (!publicAuditId) {
        throw new Error("Audit ID is required.");
    }

    const response = await fetch(
        `${API_BASE}/api/checklist_assessment/audits/${encodeURIComponent(publicAuditId)}/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}


/*
|--------------------------------------------------------------------------
| 5. Get Scan Status
|--------------------------------------------------------------------------
*/

export async function getConsentScanStatus(publicAuditId) {
    if (!publicAuditId) {
        throw new Error("Audit ID is required.");
    }

    const response = await fetch(
        `${auditUrl(publicAuditId)}/status/`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return parseResponse(response);
}



export const getSelfCheckConsentReport = async (publicAuditId) => {
    if (!publicAuditId) {
        throw new Error("Public Audit ID is required.");
    }

    const response = await fetch(
        `${API_BASE}/api/reports/audit/${encodeURIComponent(publicAuditId)}/html/`,
        {
            method: "GET",
            headers: {
                Accept: "text/html, application/json",
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Unable to fetch consent assessment report. Status: ${response.status}. ${errorText.slice(0, 300)}`
        );
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const data = await response.json();

        const html =
            data.html ??
            data.report_html ??
            data.content ??
            data.data?.html ??
            data.data?.report_html;

        if (typeof html !== "string" || !html.trim()) {
            throw new Error("Report HTML is not available in the API response.");
        }

        return html;
    }

    const html = await response.text();

    if (!html.trim()) {
        throw new Error("The consent assessment report is empty.");
    }

    return html;
};
