import React, { useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    RotateCcw,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";


import AuditConfiguration from "../components/AuditConfiguration";
import AuditProgress from "../components/AuditProgress";
import AuditSummary from "../components/AuditSummary";
import AuditStepList from "../components/AuditStepList";


import {
    startAudit,
    getAuditStatus,
} from "../services/auditApi";


/* =========================================================
   MAIN COMPONENT
========================================================= */

const ConsentAuditDemo = () => {
    const [auditState, setAuditState] =
        useState("configuration");

    const [auditConfiguration, setAuditConfiguration] =
        useState(null);

    const [auditResult, setAuditResult] =
        useState(null);

    const [error, setError] = useState("");

    const [auditId, setAuditId] =
        useState(null);

    const [taskId, setTaskId] =
        useState(null);

    const [auditProgress, setAuditProgress] =
        useState(null);

    const pollingRef = useRef(null);

    /* =======================================================
       EXTRACT UI STEPS FROM JSON
    ======================================================= */

    const auditSteps = auditResult?.steps
        ? auditResult.steps
            .map((step) => {
                const result = step?.result;

                if (!result) {
                    return null;
                }

                // Keep the step identifier available to the existing result views.
                return {
                    ...result,
                    step_id: step.step_id,
                    execution_status: step.status,
                };
            })
            .filter(Boolean)
        : [];

    const auditMetadata =
        auditResult?.audit || null;

    /* =======================================================
       START AUDIT
    ======================================================= */

    const handleStartAudit = async (configuration) => {
        try {
            setError("");

            setAuditConfiguration(configuration);
            setAuditResult(null);
            setAuditProgress(null);

            setAuditState("starting");

            const response = await startAudit({
                url: configuration.url,
                username: configuration.username || "",
                password: configuration.password || "",
            });

            const returnedAuditId = response.audit_id;
            const returnedTaskId = response.task_id;

            if (!returnedAuditId) {
                throw new Error(
                    "Audit started but no audit ID was returned."
                );
            }

            setAuditId(returnedAuditId);
            setTaskId(returnedTaskId || null);

            setAuditState("running");
        } catch (err) {
            console.error(
                "Failed to start audit:",
                err
            );

            setError(
                err.message ||
                "Failed to start audit."
            );

            setAuditState("configuration");
        }
    };

    useEffect(() => {
        if (auditState !== "running" || !auditId) {
            return;
        }

        console.log(
            `[Audit Polling] Started for audit ID: ${auditId}`
        );

        let isPolling = true;

        const pollAudit = async () => {
            if (!isPolling) {
                return;
            }

            console.log(
                `[Audit Polling] Fetching audit ${auditId}...`
            );

            try {
                const data = await getAuditStatus(auditId);

                console.log(
                    "[Audit Polling] Response:",
                    data
                );

                const auditStatus = String(
                    data?.audit?.status || ""
                ).toUpperCase();

                const steps = Array.isArray(data?.steps)
                    ? data.steps
                    : [];

                console.log(
                    `[Audit Polling] Status: ${auditStatus}`
                );

                console.log(
                    "[Audit Polling] Steps:",
                    steps
                );

                const completedSteps = steps.filter(
                    (step) =>
                        String(step?.status || "").toUpperCase() ===
                        "COMPLETED"
                );

                const runningStep = steps.find(
                    (step) =>
                        String(step?.status || "").toUpperCase() ===
                        "RUNNING"
                );

                const calculatedProgress =
                    steps.length > 0
                        ? Math.round(
                            (completedSteps.length / steps.length) * 100
                        )
                        : 0;

                setAuditProgress({
                    progress: calculatedProgress,
                    currentStep: runningStep?.step_id || null,
                    status: auditStatus,
                    steps,
                });

                if (auditStatus === "COMPLETED") {
                    console.log(
                        "[Audit Polling] Audit completed."
                    );

                    setAuditResult(data);
                    setAuditState("completed");

                    return;
                }

                if (
                    auditStatus === "FAILED" ||
                    auditStatus === "ERROR" ||
                    auditStatus === "CANCELLED"
                ) {
                    console.error(
                        `[Audit Polling] Audit ${auditStatus}`
                    );

                    setError(
                        data?.audit?.error ||
                        data?.message ||
                        `Audit ${auditStatus.toLowerCase()}.`
                    );

                    setAuditState("failed");

                    return;
                }

            } catch (err) {
                console.error(
                    "[Audit Polling] GET failed:",
                    err
                );
            }
        };

        // Immediate request
        pollAudit();

        // Every 30 seconds
        pollingRef.current = setInterval(
            pollAudit,
            2 * 1000
        );

        return () => {
            console.log(
                `[Audit Polling] Stopped for audit ${auditId}`
            );

            isPolling = false;

            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [auditState, auditId]);


    /* =======================================================
       RESET
    ======================================================= */

    const handleNewAudit = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setAuditState("configuration");

        setAuditConfiguration(null);

        setAuditResult(null);

        setAuditId(null);

        setTaskId(null);

        setAuditProgress(null);

        setError("");
    };
    /* =======================================================
       CONFIGURATION SCREEN
    ======================================================= */

    if (
        auditState ===
        "configuration"
    ) {
        return (
            <div className="min-h-screen bg-[#0b1120] px-6 py-6 text-slate-100">
                <div className="mx-auto w-full max-w-6xl">

                    <PageHeader
                        title="Consent Audit"
                        description="Configure and run a DPDP consent compliance audit."
                    />

                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">

                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                            <div>
                                <p className="text-xs font-medium text-red-300">
                                    Unable to start audit
                                </p>

                                <p className="mt-1 text-[11px] text-red-300/60">
                                    {error}
                                </p>
                            </div>

                        </div>
                    )}

                    <AuditConfiguration
                        onStartAudit={
                            handleStartAudit
                        }
                    />

                </div>
            </div>
        );
    }

    /* =======================================================
       RUNNING SCREEN
    ======================================================= */

    if (
        auditState ===
        "running"
    ) {
        return (
            <div className="min-h-screen bg-[#0b1120] px-6 py-6 text-slate-100">
                <div className="mx-auto w-full max-w-6xl">

                    <PageHeader
                        title="Consent Audit"
                        description={
                            auditConfiguration?.url
                                ? `Auditing ${auditConfiguration.url}`
                                : "Audit in progress"
                        }
                    />

                    <AuditProgress
                        progress={
                            auditProgress?.progress || 0
                        }
                        currentStep={
                            auditProgress?.currentStep || null
                        }
                        status={
                            auditProgress?.status || "RUNNING"
                        }
                        steps={
                            auditProgress?.steps || []
                        }
                    />

                </div>
            </div>
        );
    }


    /* =======================================================
       COMPLETED SCREEN
    ======================================================= */

    return (
        <div className="min-h-screen bg-[#0b1120] px-6 py-6 text-slate-100">
            <div className="mx-auto w-full max-w-6xl">

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <PageHeader
                        title="Consent Audit Results"
                        description={
                            auditConfiguration?.url
                                ? `Audit results for ${auditConfiguration.url}`
                                : "Completed DPDP consent compliance audit."
                        }
                    />

                    <button
                        type="button"
                        onClick={
                            handleNewAudit
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-slate-700
                            bg-slate-900/80
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-slate-300
                            shadow-sm
                            transition
                            hover:border-slate-600
                            hover:bg-slate-800
                            hover:text-slate-100
                        "
                    >
                        <RotateCcw className="h-3.5 w-3.5" />

                        New Audit
                    </button>

                </div>

                {/* Completion Banner */}

                <div className="
                    mb-6
                    rounded-xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/6
                    px-5
                    py-4
                ">

                    <div className="flex items-center gap-3">

                        <div className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-emerald-500/20
                            bg-emerald-500/10
                        ">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-emerald-300">
                                Audit Completed
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                The configured audit requirements have been evaluated successfully.
                            </p>
                        </div>

                    </div>

                </div>

                {/* Metadata */}

                <AuditMetadata
                    configuration={
                        auditConfiguration
                    }
                    metadata={
                        auditMetadata
                    }
                />

                {/* Summary */}

                <div className="mt-6">
                    <AuditSummary
                        steps={
                            auditSteps
                        }
                    />
                </div>

                {/* Step Accordions */}

                <div className="mt-6">
                    <AuditStepList
                        steps={
                            auditSteps
                        }
                    />
                </div>

            </div>
        </div>
    );
};

/* =========================================================
   PAGE HEADER
========================================================= */

const PageHeader = ({
    title,
    description,
}) => (
    <div className="mb-8">

        <div className="flex items-center gap-3">

            <div className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-indigo-500/20
                bg-indigo-500/10
            ">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>

            <div>

                <p className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-indigo-400
                ">
                    Consent Audit
                </p>

                <h1 className="
                    mt-1
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-slate-100
                ">
                    {title}
                </h1>

                <p className="
                    mt-1.5
                    text-sm
                    leading-6
                    text-slate-400
                ">
                    {description}
                </p>

            </div>

        </div>

    </div>
);

/* =========================================================
   AUDIT METADATA
========================================================= */

const AuditMetadata = ({
    configuration,
    metadata,
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            {/* Target Website */}

            <div className="
                rounded-xl
                border
                border-slate-800
                bg-slate-900/70
                px-4
                py-4
                shadow-sm
            ">

                <p className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-500
                ">
                    Target Website
                </p>

                <p className="
                    mt-1.5
                    truncate
                    text-sm
                    font-medium
                    text-slate-200
                ">
                    {configuration?.url ||
                        metadata?.url ||
                        "—"}
                </p>

            </div>

            {/* Authentication */}

            <div className="
                rounded-xl
                border
                border-slate-800
                bg-slate-900/70
                px-4
                py-4
                shadow-sm
            ">

                <p className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-500
                ">
                    Authentication
                </p>

                <p className="
                    mt-1.5
                    text-sm
                    font-medium
                    text-slate-200
                ">
                    {configuration?.authentication_required
                        ? "Required"
                        : "Not Required"}
                </p>

            </div>

        </div>
    );
};

export default ConsentAuditDemo;