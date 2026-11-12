
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";


import {
    ArrowLeft,
    CheckCircle2,
    ClipboardList,
    AlertCircle,
    RefreshCw,
    FileCheck2,
    X,
    LoaderCircle,
} from "lucide-react";

import Loader from "../utilities/Loader";

import DomainAccordion from "./components/DomainAccordion";

import {
    getAuditorChecklist,
    saveAuditorResponse,
} from "./services/auditorChecklistService";

import {
    getChecklistResponse,
} from "./utils/auditorChecklistUtils";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function AuditorChecklistPage() {

    const navigate = useNavigate();

    const { publicAuditId } = useParams();


    // ==========================================
    // STATES
    // ==========================================
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [audit, setAudit] = useState(null);

    const [domains, setDomains] = useState([]);

    // Current editable responses
    const [responses, setResponses] = useState({});

    // Last successfully saved responses
    const [savedResponses, setSavedResponses] = useState({});

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [savingId, setSavingId] = useState(null);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });


    // ==========================================
    // RESPONSE HELPERS
    // ==========================================

    const cloneResponse = (response) => ({
        status: response?.status || "",
        comments: response?.comments || "",
        existingEvidence: [...(response?.existingEvidence || [])],
        newEvidence: [...(response?.newEvidence || [])],
    });


    const normalizeDomains = (data) => {

        const domainList = data?.domains || [];

        const initialResponses = {};

        domainList.forEach(domain => {

            (domain.checklists || []).forEach(item => {

                initialResponses[item.checklist_id] =
                    getChecklistResponse(item);

            });

        });

        return {
            domains: domainList,
            responses: initialResponses,
        };

    };


    // ==========================================
    // FETCH AUDIT DETAILS
    // ==========================================

    const fetchAuditDetails = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getAuditorChecklist(publicAuditId);

            if (!data || !Array.isArray(data.domains)) {
                throw new Error(
                    "Invalid auditor checklist response received."
                );
            }

            const normalized = normalizeDomains(data);

            setAudit(data);

            setDomains(normalized.domains);

            // Initialize editable state
            setResponses(normalized.responses);

            // Initialize saved state
            setSavedResponses(
                Object.fromEntries(
                    Object.entries(normalized.responses).map(
                        ([id, response]) => [
                            id,
                            cloneResponse(response),
                        ]
                    )
                )
            );

        } catch (err) {

            console.error("Audit fetch error:", err);

            setError(
                err.message || "Unable to load auditor checklist."
            );

        } finally {

            setLoading(false);

        }

    }, [publicAuditId]);


    useEffect(() => {

        if (publicAuditId) {
            fetchAuditDetails();
        }

    }, [publicAuditId, fetchAuditDetails]);


    // ==========================================
    // RESPONSE CHANGE HANDLER
    // ==========================================

    const handleResponseChange = (checklistId, field, value) => {

        setResponses(prev => ({

            ...prev,

            [checklistId]: {

                ...prev[checklistId],

                [field]: value,

            },

        }));

        // Clear previous notification while editing
        setNotification({
            type: "",
            message: "",
        });

    };

    //----------------------------------------
    // HANDLE GENERATE REPORT FUNCTION
    //----------------------------------------
    const handleGenerateReport = async () => {
        if (!publicAuditId || generatingReport || reportGenerated) return;

        if (progress.unsaved > 0) {
            setNotification({
                type: "error",
                message: "Please save all unsaved checklist changes before generating the report.",
            });
            return;
        }

        setGeneratingReport(true);

        try {
            const response = await fetchWithAuth(
                `/api/checklists/html_report/${encodeURIComponent(publicAuditId)}/`,
                {
                    method: "GET",
                    headers: {
                        Accept: "text/html, application/json",
                    },
                }
            );

            const contentType = response.headers.get("content-type") || "";
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    `Report generation failed. HTTP ${response.status}`
                );
            }

            let html = responseText;

            if (contentType.includes("application/json")) {
                const data = JSON.parse(responseText);

                if (data.success === false) {
                    throw new Error(data.message || "Report generation failed.");
                }

                html = data.html || data.report_html || data.content || "";
            }

            if (!html || !html.trim()) {
                throw new Error("The report API returned an empty HTML report.");
            }

            setReportGenerated(true);

            localStorage.setItem(
                `auditor-report-generated-${publicAuditId}`,
                "true"
            );

            setShowGenerateModal(false);

            setNotification({
                type: "success",
                message: "Report generated successfully. Audit finalized.",
            });

            navigate("/auditor/completed-reports", {
                state: {
                    reportGenerated: true,
                    publicAuditId,
                },
            });

        } catch (error) {
            console.error("Report generation error:", error);

            setNotification({
                type: "error",
                message: error.message || "Unable to generate report.",
            });

        } finally {
            setGeneratingReport(false);
        }
    };

    // ==========================================
    // DIRTY CHECK
    // ==========================================

    const isResponseDirty = (checklistId) => {

        const current = responses[checklistId];

        const saved = savedResponses[checklistId];

        if (!current) return false;

        // New checklist response
        if (!saved) {
            return Boolean(
                current.status ||
                current.comments ||
                current.existingEvidence?.length ||
                current.newEvidence?.length
            );
        }

        const statusChanged =
            current.status !== saved.status;

        const commentsChanged =
            current.comments !== saved.comments;

        const existingEvidenceChanged =
            JSON.stringify(current.existingEvidence) !==
            JSON.stringify(saved.existingEvidence);

        const newEvidenceAdded =
            current.newEvidence?.length > 0;

        return (
            statusChanged ||
            commentsChanged ||
            existingEvidenceChanged ||
            newEvidenceAdded
        );

    };


    // ==========================================
    // SAVE INDIVIDUAL CHECKLIST ROW
    // ==========================================

    const handleSaveRow = async (item) => {

        const checklistId = item.checklist_id;

        const current = responses[checklistId];

        if (!current) return;

        // Prevent duplicate save requests
        if (savingId !== null) return;

        // Status is mandatory
        if (!current.status) {

            setNotification({
                type: "error",
                message: `Please select a compliance status for ${item.code}.`,
            });

            return;

        }

        if (!isResponseDirty(checklistId)) {

            setNotification({
                type: "info",
                message: `${item.code} has no unsaved changes.`,
            });

            return;

        }


        // Capture snapshot before API request
        const submittedSnapshot = cloneResponse(current);

        setSavingId(checklistId);

        setNotification({
            type: "",
            message: "",
        });


        try {

            // Save one checklist item independently.
            // Evidence must be submitted as multipart/form-data
            // by the service layer.
            const result = await saveAuditorResponse(
                publicAuditId,
                checklistId,
                submittedSnapshot
            );


            // Build confirmed saved response.
            // If the backend returns the updated checklist item,
            // normalize its actual evidence URLs and IDs.
            let confirmedResponse;

            const savedItem =
                result?.data?.checklist ||
                result?.checklist ||
                result?.data ||
                result;

            if (
                savedItem &&
                typeof savedItem === "object" &&
                (
                    savedItem.checklist_id ||
                    Object.prototype.hasOwnProperty.call(
                        savedItem,
                        "evidence"
                    )
                )
            ) {

                confirmedResponse =
                    getChecklistResponse(savedItem);

            } else {

                // Fallback for APIs that return only success/message.
                // Newly uploaded files are not given fabricated URLs.
                confirmedResponse = {
                    ...submittedSnapshot,
                    newEvidence: [],
                };

            }


            // Update saved state
            setSavedResponses(prev => ({

                ...prev,

                [checklistId]: cloneResponse(confirmedResponse),

            }));


            // Update editable state.
            // Preserve edits made while the request was running.
            setResponses(prev => {

                const latest = prev[checklistId];

                if (!latest) return prev;

                const submittedFileNames =
                    submittedSnapshot.newEvidence.map(file => file.name);

                const remainingNewFiles =
                    (latest.newEvidence || []).filter(
                        file => !submittedFileNames.includes(file.name)
                    );

                const currentStillMatchesSnapshot =
                    latest.status === submittedSnapshot.status &&
                    latest.comments === submittedSnapshot.comments;

                return {

                    ...prev,

                    [checklistId]: {

                        ...(currentStillMatchesSnapshot
                            ? cloneResponse(confirmedResponse)
                            : latest),

                        // Do not discard evidence added during the request.
                        newEvidence: remainingNewFiles,

                    },

                };

            });


            setNotification({
                type: "success",
                message: `${item.code} saved successfully.`,
            });


        } catch (err) {

            console.error("Checklist save error:", err);

            setNotification({
                type: "error",
                message:
                    err.message ||
                    `Failed to save ${item.code}.`,
            });

        } finally {

            setSavingId(null);

        }

    };


    // ==========================================
    // CLEAR INDIVIDUAL CHECKLIST ROW
    // ==========================================

    const handleClearRow = (item) => {

        const checklistId = item.checklist_id;

        // Do not allow clearing while the row is being saved.
        if (savingId === checklistId) return;

        const saved = savedResponses[checklistId];

        setResponses(prev => ({

            ...prev,

            [checklistId]: saved
                ? cloneResponse(saved)
                : {
                    status: "",
                    comments: "",
                    existingEvidence: [],
                    newEvidence: [],
                },

        }));

        setNotification({
            type: "info",
            message: `${item.code} has been reset to its last saved state.`,
        });

    };


    // ==========================================
    // PROGRESS CALCULATION
    // ==========================================

    const progress = useMemo(() => {

        const checklistItems = domains.flatMap(
            domain => domain.checklists || []
        );

        const total = checklistItems.length;

        const completed = checklistItems.filter(item => {

            return Boolean(
                savedResponses[item.checklist_id]?.status
            );

        }).length;


        const pending = total - completed;

        const percentage = total
            ? Math.round((completed / total) * 100)
            : 0;


        const unsaved = checklistItems.filter(item => {

            return isResponseDirty(item.checklist_id);

        }).length;


        return {
            total,
            completed,
            pending,
            percentage,
            unsaved,
        };

    }, [domains, savedResponses, responses]);


    // ==========================================
    // RENDER LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-[#0b1120] flex
                            items-center justify-center">

                <Loader text="Loading auditor checklist..." />

            </div>

        );

    }


    // ==========================================
    // RENDER ERROR
    // ==========================================

    if (error) {

        return (

            <div className="min-h-screen bg-[#0b1120]
                            text-gray-200 p-6">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-indigo-400
                               hover:text-indigo-300 mb-8"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>


                <div className="max-w-xl mx-auto mt-20
                                bg-[#111827] border border-red-500/20
                                rounded-xl p-6 text-center">

                    <AlertCircle
                        size={35}
                        className="text-red-400 mx-auto mb-4"
                    />

                    <h2 className="text-lg font-semibold mb-2">
                        Unable to load audit
                    </h2>

                    <p className="text-sm text-gray-400 mb-5">
                        {error}
                    </p>

                    <button
                        onClick={fetchAuditDetails}
                        className="px-5 py-2 rounded-lg bg-indigo-600
                                   hover:bg-indigo-500 text-white"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }



    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-4 md:p-6">

            {
                showGenerateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/70 p-4 backdrop-blur-sm">

                        <div className="w-full max-w-lg rounded-2xl border
                        border-slate-700 bg-[#111827] p-6 shadow-2xl">

                            <div className="flex items-center gap-3 mb-5">

                                <FileCheck2 className="text-amber-400" size={24} />

                                <h2 className="text-lg font-semibold text-white">
                                    Generate Audit Report?
                                </h2>

                            </div>

                            <div className="rounded-xl border border-amber-500/20
                            bg-amber-500/5 p-4">

                                <p className="text-sm text-slate-200 leading-6">
                                    Once you generate the report, this audit will be
                                    finalized. You will no longer be able to modify
                                    or save checklist responses.

                                    The audit will appear in the Completed Audits section.
                                </p>

                            </div>

                            <div className="flex justify-end gap-3 mt-6">

                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    disabled={generatingReport}
                                    className="px-4 py-2 rounded-lg border
                               border-slate-600 text-slate-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleGenerateReport}
                                    disabled={generatingReport}
                                    className="px-4 py-2 rounded-lg bg-indigo-600
                               text-white hover:bg-indigo-500"
                                >
                                    {generatingReport ? (
                                        <span className="flex items-center gap-2">
                                            <LoaderCircle size={15} className="animate-spin" />
                                            Generating...
                                        </span>
                                    ) : (
                                        "Yes, Generate Report"
                                    )}
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

            <div className="max-w-7xl mx-auto">


                {/* BACK NAVIGATION */}

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-indigo-400
                               hover:text-indigo-300 mb-7"
                >

                    <ArrowLeft size={18} />

                    Back to Accepted Audits

                </button>


                {/* PAGE HEADER */}

                <div className="flex flex-col md:flex-row
                                md:items-center justify-between gap-4 mb-7">

                    <div>

                        <h1 className="text-2xl font-bold text-white">
                            Auditor Checklist
                        </h1>

                        <p className="text-sm text-slate-400 mt-2">
                            Public Audit ID: {audit?.public_audit_id}
                        </p>

                    </div>


                    {/* <button
                        onClick={fetchAuditDetails}
                        disabled={savingId !== null}
                        className="flex items-center justify-center gap-2
                                   px-4 py-2 rounded-lg border
                                   border-slate-700 text-slate-300
                                   hover:bg-slate-800 disabled:opacity-50"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button> */}

                    <div className="flex items-center gap-3">

                        {!reportGenerated && (
                            <button
                                onClick={() => setShowGenerateModal(true)}
                                disabled={savingId !== null || progress.unsaved > 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-indigo-600 text-white hover:bg-indigo-500
                       disabled:opacity-50"
                            >
                                <FileCheck2 size={16} />
                                Generate Report
                            </button>
                        )}

                        <button
                            onClick={fetchAuditDetails}
                            disabled={savingId !== null || generatingReport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg
                   border border-slate-700 text-slate-300
                   hover:bg-slate-800"
                        >
                            <RefreshCw size={15} />
                            Refresh
                        </button>

                    </div>

                </div>


                {/* PROGRESS CARD */}

                <div className="bg-[#111827] border border-slate-700
                                rounded-xl p-5 mb-6">

                    <div className="flex flex-wrap justify-between
                                    items-center gap-3 mb-4">

                        <div className="flex items-center gap-3">

                            <ClipboardList
                                size={22}
                                className="text-indigo-400"
                            />

                            <div>

                                <h2 className="font-semibold text-white">
                                    Audit Completion
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    Saved checklist responses
                                </p>

                            </div>

                        </div>


                        <span className="text-2xl font-bold text-indigo-400">
                            {progress.percentage}%
                        </span>

                    </div>


                    {/* PROGRESS BAR */}

                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">

                        <div
                            className="bg-indigo-500 h-3 rounded-full
                                       transition-all duration-300"
                            style={{
                                width: `${progress.percentage}%`,
                            }}
                        />

                    </div>


                    {/* COUNTERS */}

                    <div className="grid grid-cols-2 md:grid-cols-4
                                    gap-4 mt-5">

                        <div>

                            <p className="text-xl font-bold text-white">
                                {progress.total}
                            </p>

                            <p className="text-xs text-slate-400">
                                Total Questions
                            </p>

                        </div>


                        <div>

                            <p className="text-xl font-bold text-emerald-400">
                                {progress.completed}
                            </p>

                            <p className="text-xs text-slate-400">
                                Saved Responses
                            </p>

                        </div>


                        <div>

                            <p className="text-xl font-bold text-amber-400">
                                {progress.pending}
                            </p>

                            <p className="text-xs text-slate-400">
                                Remaining
                            </p>

                        </div>


                        <div>

                            <p className="text-xl font-bold text-indigo-400">
                                {progress.unsaved}
                            </p>

                            <p className="text-xs text-slate-400">
                                Unsaved Changes
                            </p>

                        </div>

                    </div>

                </div>


                {/* NOTIFICATION */}

                {notification.message && (

                    <div className={`mb-5 p-4 rounded-lg border text-sm
                        ${notification.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : notification.type === "error"
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        }`}
                    >

                        {notification.message}

                    </div>

                )}


                {/* DOMAIN ACCORDIONS */}

                <div className="space-y-4">

                    {domains.length > 0 ? (

                        domains.map((domain, index) => (

                            <DomainAccordion

                                key={domain.domain_id}

                                domain={domain}

                                responses={responses}

                                savedResponses={savedResponses}

                                onChange={handleResponseChange}

                                onSave={handleSaveRow}

                                onClear={handleClearRow}

                                isDirty={isResponseDirty}

                                savingId={savingId}

                                defaultOpen={index === 0}

                            />

                        ))

                    ) : (

                        <div className="bg-[#111827] border border-slate-700
                                        rounded-xl p-8 text-center">

                            <CheckCircle2
                                size={30}
                                className="mx-auto text-slate-500 mb-3"
                            />

                            <p className="text-slate-400">
                                No checklist items found for this audit.
                            </p>

                        </div>

                    )}

                </div>


                {/* FOOTER */}

                <div className="mt-8 p-4 rounded-xl bg-[#111827]
                                border border-slate-700">

                    <p className="text-xs text-slate-400 leading-6">

                        Each checklist response must be saved individually.
                        Previously saved responses are retained when you
                        reopen this audit. Unsaved changes will not be
                        submitted automatically.

                    </p>

                </div>

            </div>

        </div>

    );

}
