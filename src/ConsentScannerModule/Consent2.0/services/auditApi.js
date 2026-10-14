const API_BASE_URL = import.meta.env.VITE_CONSENT_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        "VITE_API_BASE_URL is not configured. Please check your .env file."
    );
}

const getErrorMessage = async (response, fallbackMessage) => {
    try {
        const errorData = await response.json();

        return (
            errorData?.message ||
            errorData?.error ||
            fallbackMessage
        );
    } catch {
        return fallbackMessage;
    }
};


/**
 * Start a new consent audit.
 *
 * Backend:
 * POST /api/audits/test-crawl/
 */
export const startAudit = async ({
    public_audit_id,
    audit_id,
    url,
    username = "",
    password = "",
}) => {
    if (!url?.trim()) {
        throw new Error("Audit URL is required.");
    }
    console.log(url,username, password);
    
    const response = await fetch(
        `${API_BASE_URL}/api/audits/test-crawl/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                audit_id: audit_id,
                public_audit_id : public_audit_id,
                url: url.trim(),
                username,
                password,
            }),
        }
    );

    if (!response.ok) {
        const message = await getErrorMessage(
            response,
            `Failed to start audit (${response.status})`
        );

        throw new Error(message);
    }

    const data = await response.json();

    if (!data?.success) {
        throw new Error(
            data?.message || "Failed to start audit."
        );
    }

    if (!data?.audit_id) {
        throw new Error(
            "Audit started but no audit ID was returned."
        );
    }

    return {
        success: true,
        message: data.message || "Audit started successfully.",
        audit_id: data.audit_id,
        public_audit_id : data.public_audit_id,
        task_id: data.task_id || null,
    };
};


/**
 * Get the current status/result of an audit.
 *
 * Backend:
 * GET /api/audits/{auditId}/
 */
export const getAuditStatus = async (auditId) => {
    if (!auditId) {
        throw new Error("Audit ID is required.");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/audits/${auditId}/status/`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        }
    );

    if (!response.ok) {
        const message = await getErrorMessage(
            response,
            `Failed to fetch audit status (${response.status})`
        );

        throw new Error(message);
    }

    const data = await response.json();

    if (!data?.success) {
        throw new Error(
            data?.message || "Failed to fetch audit status."
        );
    }

    return data;
};


export const getConsentAuditResult = async (
    publicAuditId
) => {

    if (!publicAuditId) {
        throw new Error(
            "Public Audit ID is required."
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/api/audits/consent/result/${encodeURIComponent(publicAuditId)}/`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {

        let message =
            `Failed to fetch consent audit result (${response.status})`;

        try {

            const errorData =
                await response.json();

            message =
                errorData?.message ||
                errorData?.detail ||
                errorData?.error ||
                message;

        } catch {
            // Ignore JSON parsing errors
        }

        const error =
            new Error(message);

        error.status =
            response.status;

        throw error;
    }

    return response.json();
};