import { fetchWithAuth } from "../../utilities/fetchWithAuth";

const getAuditorResponseUrl = (publicAuditId) =>
    `/api/checklists/auditor-responses/${publicAuditId}/`;

export const getAuditorChecklist = async (publicAuditId) => {
    const response = await fetchWithAuth(
        getAuditorResponseUrl(publicAuditId)
    );

    const data = await response.json();
    console.log(data);
    

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to fetch auditor checklist."
        );
    }

    return data;
};


export const saveAuditorResponse = async (
    publicAuditId,
    checklistId,
    responseData
) => {
    try {
        const formData = new FormData();

        formData.append("checklist_id", String(checklistId));
        formData.append("status", responseData.status || "");
        formData.append("comment", responseData.comments || "");

        // Append all selected evidence files
        (responseData.newEvidence || []).forEach((file) => {
            formData.append("evidence", file, file.name);
        });

        // DEBUG: Inspect actual FormData entries
        console.log("========== AUDITOR RESPONSE PAYLOAD ==========");

        for (const [key, value] of formData.entries()) {
            console.log(
                key,
                value instanceof File
                    ? {
                        name: value.name,
                        size: value.size,
                        type: value.type
                    }
                    : value
            );
        }

        console.log("==============================================");

        const response = await fetchWithAuth(
            `/api/checklists/auditor-responses/${publicAuditId}/`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json().catch(() => ({}));

        console.log("Save API Status:", response.status);
        console.log("Save API Response:", data);

        if (!response.ok) {
            console.error("Backend validation error:", data);

            throw new Error(
                data.message ||
                data.detail ||
                JSON.stringify(data) ||
                "Unable to save auditor response."
            );
        }

        return data;

    } catch (error) {
        console.error("Save auditor response failed:", error);
        throw error;
    }
};
