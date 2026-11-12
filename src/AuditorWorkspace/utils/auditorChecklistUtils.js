
export const ALLOWED_EVIDENCE_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".jpg",
    ".jpeg",
    ".png",
];

export const MAX_EVIDENCE_SIZE = 5 * 1024 * 1024;

export const AUDIT_STATUSES = [
    {
        label: "Compliance",
        value: "COMPLIANCE"
    },
    {
        label: "Partial Compliance",
        value: "PARTIAL"
    },
    {
        label: "Failed",
        value: "NON_COMPLIANCE"
    }
];

// Normalize evidence received from backend.
// Supports a URL, an object, or an array of attachments.
export const normalizeEvidence = (evidence) => {
    if (!evidence) return [];

    const items = Array.isArray(evidence) ? evidence : [evidence];

    return items.map((file, index) => {
        if (typeof file === "string") {
            return {
                id: `existing-${index}`,
                name: file.split("/").pop() || `Evidence ${index + 1}`,
                url: file,
            };
        }

        return {
            id: file.id || `existing-${index}`,
            name:
                file.file_name ||
                file.name ||
                file.filename ||
                `Evidence ${index + 1}`,
            url:
                file.file_url ||
                file.url ||
                file.file ||
                "",
        };
    });
};


// Initialize from GET API response.
// Existing saved data must never be discarded.
export const getChecklistResponse = (item) => ({
    status: item.status || "",
    comments: item.comment || "",
    existingEvidence: normalizeEvidence(item.evidence),
    newEvidence: [],
});


// Validate uploaded files.
export const validateEvidenceFiles = (files) => {

    const validFiles = [];
    const errors = [];

    files.forEach(file => {

        const extension = "." + file.name.split(".").pop().toLowerCase();

        if (!ALLOWED_EVIDENCE_EXTENSIONS.includes(extension)) {
            errors.push(`${file.name}: Unsupported file format.`);
            return;
        }

        if (file.size > MAX_EVIDENCE_SIZE) {
            errors.push(`${file.name}: File exceeds 5 MB.`);
            return;
        }

        validFiles.push(file);
    });

    return {
        validFiles,
        errors,
    };
};


// Calculate checklist progress.
export const calculateProgress = (domains, responses) => {

    const items = domains.flatMap(
        domain => domain.checklists || []
    );

    const total = items.length;

    const completed = items.filter(
        item => responses[item.checklist_id]?.status
    ).length;

    return {
        total,
        completed,
        remaining: total - completed,
        percentage: total
            ? Math.round((completed / total) * 100)
            : 0,
    };
};
