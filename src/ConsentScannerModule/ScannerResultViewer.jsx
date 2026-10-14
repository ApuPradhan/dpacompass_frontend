import { useMemo } from "react";
import SummaryBar from "./SummaryBar";
import PageCard from "./PageCard";

const ScannerResultViewer = ({ data }) => {

    // =========================
    // STEP 1: VALIDATE INPUT
    // =========================
    const normalized = useMemo(() => {
        if (!data) return null;

        // ✅ Expect already normalized structure
        if (data?.pages && data?.scan_summary) {
            return data;
        }

        console.warn("Invalid data passed to ScannerResultViewer:", data);
        return null;

    }, [data]);

    // =========================
    // STEP 2: FIELD NORMALIZATION
    // =========================
    const getFieldName = (fieldName) => {
        if (!fieldName) return "Unknown Field";

        // Case 1: string
        if (typeof fieldName === "string") {
            try {
                const parsed = JSON.parse(fieldName);

                // array case
                if (Array.isArray(parsed)) {
                    return parsed[0]?.placeholder || "Input Field";
                }

                // object case
                if (typeof parsed === "object") {
                    return parsed.placeholder || parsed.name || "Input Field";
                }

            } catch {
                return fieldName; // normal string
            }

            return fieldName;
        }

        // Case 2: object
        if (typeof fieldName === "object") {
            return fieldName.placeholder || fieldName.name || "Input Field";
        }

        return "Input Field";
    };

    const normalizeIssues = (issues = []) => {
        return issues.map((issue) =>
            typeof issue === "string"
                ? issue
                : issue?.type || "Unknown issue"
        );
    };

    // =========================
    // STEP 3: PAGE NORMALIZATION
    // =========================
    const pages = useMemo(() => {
        if (!normalized?.pages) return [];

        return normalized.pages.map((page) => ({
            ...page,
            fields: (page.fields || []).map((field) => ({
                ...field,
                field_name: getFieldName(field.field_name),
                issues: normalizeIssues(field.issues),
                consent: {
                    explicit: field.consent?.explicit ?? false,
                    implicit: field.consent?.implicit ?? false,
                },
            })),
        }));

    }, [normalized]);

    const scan_summary = normalized?.scan_summary || {};

    // =========================
    // STEP 4: SORT PAGES
    // =========================
    const sortedPages = useMemo(() => {
        const order = {
            NON_COMPLIANT: 0,
            PARTIAL: 1,
            COMPLIANT: 2
        };

        return [...pages].sort(
            (a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3)
        );
    }, [pages]);

    // =========================
    // UI STATES
    // =========================
    const hasData = !!normalized;
    const hasPages = pages.length > 0;

    return (
        <div className="bg-[#0b1120] text-gray-200 p-4 space-y-4">

            {/* SUMMARY */}
            <SummaryBar summary={scan_summary} />

            {/* STATUS */}
            <div className="text-sm px-1">
                {!data ? (
                    <span className="text-red-400">No Data</span>
                ) : !hasData ? (
                    <span className="text-yellow-400">Invalid Data Shape</span>
                ) : !hasPages ? (
                    <span className="text-yellow-400">No Pages Found</span>
                ) : (
                    <span className="text-green-400">Live Data</span>
                )}
            </div>

            {/* PAGE CARDS */}
            <div className="space-y-4">
                {!hasPages ? (
                    <p className="text-gray-400">No pages found</p>
                ) : (
                    sortedPages.map((page, index) => (
                        <PageCard key={index} page={page} />
                    ))
                )}
            </div>

        </div>
    );
};

export default ScannerResultViewer;