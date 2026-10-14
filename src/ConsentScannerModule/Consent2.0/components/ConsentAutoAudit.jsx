import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";

import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import AuditProgress from "../components/AuditProgress";
import AuditSummary from "../components/AuditSummary";
import AuditStepList from "../components/AuditStepList";

import {
    startAudit,
    getConsentAuditResult,
} from "../services/auditApi";


const ConsentAutoAudit = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { publicAuditId } = useParams();

    // =========================================================
    // DATA PASSED FROM RUN BUTTON
    // =========================================================

    const configuration =
        location.state?.configuration || null;

    /*
     * There are two ways this page can be opened:
     *
     * 1. Run:
     *    public_audit_id comes from location.state.configuration
     *
     * 2. View:
     *    public_audit_id comes from the URL:
     *    /consent-management/:publicAuditId
     *
     * Use the URL ID first, then fall back to the
     * configuration ID.
     */
    const effectivePublicAuditId =
        publicAuditId ||
        configuration?.public_audit_id ||
        null;


    console.log(
        "[Consent Audit] Configuration:",
        configuration
    );

    console.log(
        "[Consent Audit] Public Audit ID:",
        effectivePublicAuditId
    );


    // =========================================================
    // STATE
    // =========================================================

    const [auditState, setAuditState] =
        useState("starting");

    const [auditId, setAuditId] =
        useState(null);

    const [taskId, setTaskId] =
        useState(null);

    const [auditProgress, setAuditProgress] =
        useState(null);

    const [auditResult, setAuditResult] =
        useState(null);

    const [error, setError] =
        useState("");


    const pollingRef =
        useRef(null);

    const startedRef =
        useRef(false);


    // =========================================================
    // EXTRACT STEPS FROM FINAL RESULT
    //
    // API response:
    //
    // {
    //     "success": true,
    //     "public_audit_id": "DPA-2026-000006",
    //     "status": "COMPLETED",
    //     "steps": {
    //         "STEP-01": "COMPLETED",
    //         "STEP-02": "COMPLETED",
    //         ...
    //     }
    // }
    //
    // Convert it into:
    //
    // [
    //     {
    //         step_id: "STEP-01",
    //         status: "COMPLETED",
    //         execution_status: "COMPLETED"
    //     }
    // ]
    // =========================================================

    const auditSteps = Array.isArray(
        auditResult?.consent_management?.steps
    )
        ? auditResult.consent_management.steps
            .map((step) => {
                if (!step?.result) {
                    return null;
                }

                return {
                    ...step.result,

                    step_id:
                        step.step_id,

                    execution_status:
                        String(
                            step.status || ""
                        ).toUpperCase(),
                };
            })
            .filter(Boolean)
        : [];


    // =========================================================
    // AUDIT METADATA
    // =========================================================

    const auditMetadata =
        auditResult?.audit || null;


    // =========================================================
    // START AUDIT
    // =========================================================

    const handleStartAudit =
        async () => {

            if (!configuration) {

                setError(
                    "Audit configuration is missing."
                );

                setAuditState(
                    "failed"
                );

                return;
            }


            try {

                setError("");

                setAuditState(
                    "starting"
                );


                console.log(
                    "[Auto Consent Audit] Starting with:",
                    configuration
                );


                // =================================================
                // START API
                // =================================================

                const response =
                    await startAudit({

                        public_audit_id:
                            configuration.public_audit_id,

                        audit_id:
                            configuration.audit_id,

                        url:
                            configuration.url,

                        username:
                            configuration.username ||
                            "",

                        password:
                            configuration.password ||
                            "",
                    });


                console.log(
                    "[Auto Consent Audit] Start response:",
                    response
                );


                // =================================================
                // GET AUDIT ID
                // =================================================

                const returnedAuditId =
                    response?.audit_id;


                const returnedTaskId =
                    response?.task_id;


                if (!returnedAuditId) {

                    throw new Error(
                        "Audit started but no audit ID was returned."
                    );
                }


                console.log(
                    "[Auto Consent Audit] Audit ID:",
                    returnedAuditId
                );


                console.log(
                    "[Auto Consent Audit] Task ID:",
                    returnedTaskId
                );


                setAuditId(
                    returnedAuditId
                );


                setTaskId(
                    returnedTaskId || null
                );


                setAuditState(
                    "running"
                );

            } catch (err) {

                console.error(
                    "[Auto Consent Audit] Start failed:",
                    err
                );


                setError(
                    err?.message ||
                    "Failed to start consent audit."
                );


                setAuditState(
                    "failed"
                );
            }
        };


    // =========================================================
    // CHECK EXISTING AUDIT BEFORE STARTING A NEW ONE
    // =========================================================

    const checkExistingAudit = async () => {

        const currentPublicAuditId =
            effectivePublicAuditId;

        if (!currentPublicAuditId) {

            setError(
                "Public Audit ID is missing."
            );

            setAuditState(
                "failed"
            );

            return;
        }

        try {

            setError("");

            console.log(
                "[Consent Audit] Checking existing audit:",
                currentPublicAuditId
            );

            const data =
                await getConsentAuditResult(
                    currentPublicAuditId
                );

            console.log(
                "[Consent Audit] Existing audit response:",
                data
            );

            const existingAuditId =
                data?.audit?.id ||
                data?.audit_id ||
                null;

            const auditStatus =
                String(
                    data?.status ||
                    data?.audit?.status ||
                    ""
                ).toUpperCase();

            /*
             * If the result endpoint returns an existing
             * audit, NEVER call startAudit().
             */
            if (
                existingAuditId ||
                [
                    "QUEUED",
                    "RUNNING",
                    "COMPLETED",
                    "FAILED",
                    "ERROR",
                    "CANCELLED",
                ].includes(auditStatus)
            ) {

                if (existingAuditId) {
                    setAuditId(existingAuditId);
                }

                setAuditResult({
                    ...data,
                    steps: normalizeSteps(data),
                });

                updateAuditProgress(data);

                if (auditStatus === "COMPLETED") {

                    setAuditState("completed");
                    return;
                }

                if (
                    auditStatus === "FAILED" ||
                    auditStatus === "ERROR" ||
                    auditStatus === "CANCELLED"
                ) {

                    setError(
                        data?.error ||
                        data?.message ||
                        `Audit ${auditStatus.toLowerCase()}.`
                    );

                    setAuditState("failed");
                    return;
                }

                /*
                 * QUEUED / RUNNING
                 */
                setAuditState("running");
                return;
            }

            /*
             * No existing audit was returned.
             * Only in this case do we start a new audit.
             */
            console.log(
                "[Consent Audit] No existing audit found. Starting new audit..."
            );

            await handleStartAudit();

        } catch (err) {

            console.error(
                "[Consent Audit] Existing audit check failed:",
                err
            );

            /*
             * A 404 means that the public audit does not
             * have an existing audit yet.
             */
            if (err?.status === 404) {

                /*
                 * If this page was opened from RUN, configuration
                 * exists, so a 404 means a new audit can be started.
                 *
                 * If this page was opened through VIEW, there is
                 * no configuration and we must NOT start a new crawl.
                 */
                if (configuration?.public_audit_id) {

                    console.log(
                        "[Consent Audit] Audit not found. Starting new audit..."
                    );

                    await handleStartAudit();
                    return;
                }

                setError(
                    `No existing consent audit was found for public audit ID ${effectivePublicAuditId}.`
                );

                setAuditState("failed");
                return;
            }

            /*
             * Do NOT start a new crawl for other errors.
             */
            setError(
                err?.message ||
                "Failed to check existing consent audit."
            );

            setAuditState("failed");
        }
    };


    // =========================================================
    // NORMALIZE STEPS
    // =========================================================

    const normalizeSteps = (data) => {

        if (Array.isArray(data?.steps)) {

            return data.steps.map((step) => ({
                ...step,

                step_id:
                    step?.step_id,

                status:
                    String(
                        step?.status || ""
                    ).toUpperCase(),

                execution_status:
                    String(
                        step?.status || ""
                    ).toUpperCase(),
            }));
        }

        return Object.entries(
            data?.steps || {}
        ).map(
            ([stepId, status]) => ({
                step_id:
                    stepId,

                status:
                    String(
                        status || ""
                    ).toUpperCase(),

                execution_status:
                    String(
                        status || ""
                    ).toUpperCase(),
            })
        );
    };


    // =========================================================
    // UPDATE PROGRESS FROM RESULT API
    // =========================================================

    const updateAuditProgress = (data) => {

        const steps =
            normalizeSteps(data);

        const completedSteps =
            steps.filter(
                (step) =>
                    String(
                        step?.status || ""
                    ).toUpperCase() ===
                    "COMPLETED"
            );

        const runningStep =
            steps.find(
                (step) =>
                    String(
                        step?.status || ""
                    ).toUpperCase() ===
                    "RUNNING"
            );

        const queuedStep =
            steps.find(
                (step) =>
                    String(
                        step?.status || ""
                    ).toUpperCase() ===
                    "QUEUED"
            );

        const auditStatus =
            String(
                data?.status ||
                data?.audit?.status ||
                ""
            ).toUpperCase();

        const calculatedProgress =
            steps.length > 0
                ? Math.round(
                    (
                        completedSteps.length /
                        steps.length
                    ) * 100
                )
                : 0;

        setAuditProgress({

            progress:
                calculatedProgress,

            currentStep:
                runningStep?.step_id ||
                queuedStep?.step_id ||
                null,

            status:
                auditStatus,

            steps,
        });
    };


    // =========================================================
    // CHECK AUTOMATICALLY
    // =========================================================

    useEffect(() => {

        if (startedRef.current) {
            return;
        }

        startedRef.current = true;

        checkExistingAudit();

    }, []);


    // =========================================================
    // POLLING
    // =========================================================

    useEffect(() => {

        /*
         * Poll using PUBLIC AUDIT ID.
         * The result API is now the source of truth.
         */

        if (
            auditState !== "running" ||
            !effectivePublicAuditId
        ) {
            return;
        }

        const currentPublicAuditId =
            effectivePublicAuditId;

        console.log(
            `[Consent Audit] Polling started for public audit ${currentPublicAuditId}`
        );

        let isPolling = true;

        const pollAudit = async () => {

            if (!isPolling) {
                return;
            }

            try {

                console.log(
                    `[Consent Audit] Checking result for public audit ${currentPublicAuditId}`
                );

                const data =
                    await getConsentAuditResult(
                        currentPublicAuditId
                    );

                console.log(
                    "[Consent Audit] Result response:",
                    data
                );

                const returnedAuditId =
                    data?.audit?.id ||
                    data?.audit_id ||
                    null;

                if (returnedAuditId) {
                    setAuditId(returnedAuditId);
                }

                const auditStatus =
                    String(
                        data?.status ||
                        data?.audit?.status ||
                        ""
                    ).toUpperCase();

                console.log(
                    "[Consent Audit] Current status:",
                    auditStatus
                );

                const steps =
                    normalizeSteps(data);

                console.log(
                    "[Consent Audit] Normalized steps:",
                    steps
                );

                updateAuditProgress(data);

                setAuditResult({
                    ...data,
                    steps,
                });

                if (auditStatus === "COMPLETED") {

                    console.log(
                        "[Consent Audit] Audit completed."
                    );

                    setAuditState("completed");
                    return;
                }

                if (
                    auditStatus === "FAILED" ||
                    auditStatus === "ERROR" ||
                    auditStatus === "CANCELLED"
                ) {

                    console.error(
                        "[Consent Audit] Audit failed:",
                        data
                    );

                    setError(
                        data?.error ||
                        data?.message ||
                        `Audit ${auditStatus.toLowerCase()}.`
                    );

                    setAuditState("failed");
                    return;
                }

            } catch (err) {

                console.error(
                    "[Consent Audit] Polling error:",
                    err
                );

                /*
                 * Do not immediately mark the audit as failed
                 * because of a temporary polling request failure.
                 */
            }
        };

        pollAudit();

        pollingRef.current =
            setInterval(
                pollAudit,
                4000
            );

        return () => {

            isPolling = false;

            if (pollingRef.current) {

                clearInterval(
                    pollingRef.current
                );

                pollingRef.current = null;
            }
        };

    }, [
        auditState,
        effectivePublicAuditId,
    ]);


    // =========================================================
    // CLEANUP ON UNMOUNT
    // =========================================================

    useEffect(() => {

        return () => {

            if (
                pollingRef.current
            ) {

                clearInterval(
                    pollingRef.current
                );


                pollingRef.current =
                    null;
            }
        };

    }, []);


    // =========================================================
    // STARTING SCREEN
    // =========================================================

    if (
        auditState ===
        "starting"
    ) {

        return (

            <div className="
                min-h-screen
                bg-[#0b1120]
                px-6
                py-6
                text-slate-100
            ">

                <div className="
                    mx-auto
                    w-full
                    max-w-6xl
                ">

                    <PageHeader
                        title="Consent Audit"
                        description={
                            configuration?.url
                                ? `Starting audit for ${configuration.url}`
                                : "Starting consent audit"
                        }
                    />


                    <div className="
                        rounded-xl
                        border
                        border-slate-800
                        bg-slate-900/70
                        p-8
                    ">

                        <div className="
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                h-10
                                w-10
                                animate-spin
                                rounded-full
                                border-2
                                border-indigo-400
                                border-t-transparent
                            " />


                            <div>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-slate-200
                                ">
                                    Starting Consent Audit
                                </p>


                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                ">
                                    The scanner is being initialized...
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================================
    // RUNNING SCREEN
    // =========================================================

    if (
        auditState ===
        "running"
    ) {

        return (

            <div className="
                min-h-screen
                bg-[#0b1120]
                px-6
                py-6
                text-slate-100
            ">

                <div className="
                    mx-auto
                    w-full
                    max-w-6xl
                ">

                    <PageHeader
                        title="Consent Audit"
                        description={
                            configuration?.url
                                ? `Auditing ${configuration.url}`
                                : "Audit in progress"
                        }
                    />


                    <AuditProgress

                        progress={
                            auditProgress?.progress ||
                            0
                        }

                        currentStep={
                            auditProgress?.currentStep ||
                            null
                        }

                        status={
                            auditProgress?.status ||
                            "RUNNING"
                        }

                        steps={
                            auditProgress?.steps ||
                            []
                        }

                    />

                </div>

            </div>
        );
    }


    // =========================================================
    // FAILED SCREEN
    // =========================================================

    if (
        auditState ===
        "failed"
    ) {

        return (

            <div className="
                min-h-screen
                bg-[#0b1120]
                px-6
                py-6
                text-slate-100
            ">

                <div className="
                    mx-auto
                    w-full
                    max-w-6xl
                ">

                    <PageHeader
                        title="Consent Audit"
                        description="Unable to complete the consent audit."
                    />


                    <div className="
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        px-5
                        py-5
                    ">

                        <div className="
                            flex
                            items-start
                            gap-3
                        ">

                            <AlertCircle
                                className="
                                    mt-0.5
                                    h-5
                                    w-5
                                    shrink-0
                                    text-red-400
                                "
                            />


                            <div>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-red-300
                                ">
                                    Audit Failed
                                </p>


                                <p className="
                                    mt-1
                                    text-xs
                                    text-red-300/70
                                ">
                                    {error}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="
                                mt-5
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-900
                                px-4
                                py-2
                                text-xs
                                font-medium
                                text-slate-300
                                hover:bg-slate-800
                            "
                        >

                            <ArrowLeft
                                className="
                                    h-3.5
                                    w-3.5
                                "
                            />

                            Back to Applications

                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================================
    // COMPLETED / RESULT SCREEN
    // =========================================================

    return (

        <div className="
            min-h-screen
            bg-[#0b1120]
            px-6
            py-6
            text-slate-100
        ">

            <div className="
                mx-auto
                w-full
                max-w-6xl
            ">

                {/* =================================================
                    HEADER
                    ================================================= */}

                <div className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                ">

                    <PageHeader
                        title="Consent Audit Results"
                        description={
                            configuration?.url
                                ? `Audit results for ${configuration.url}`
                                : "Completed DPDP consent compliance audit."
                        }
                    />


                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
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
                            hover:border-slate-600
                            hover:bg-slate-800
                            hover:text-slate-100
                        "
                    >

                        <ArrowLeft
                            className="
                                h-3.5
                                w-3.5
                            "
                        />

                        Back to Applications

                    </button>

                </div>


                {/* =================================================
                    COMPLETION BANNER
                    ================================================= */}

                <div className="
                    mb-6
                    rounded-xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/5
                    px-5
                    py-4
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

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

                            <CheckCircle2
                                className="
                                    h-5
                                    w-5
                                    text-emerald-400
                                "
                            />

                        </div>


                        <div>

                            <h2 className="
                                text-sm
                                font-semibold
                                text-emerald-300
                            ">
                                Audit Completed
                            </h2>


                            <p className="
                                mt-0.5
                                text-xs
                                text-slate-400
                            ">
                                The configured audit requirements have been evaluated successfully.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    METADATA
                    ================================================= */}

                <AuditMetadata
                    configuration={
                        configuration
                    }
                    metadata={
                        auditMetadata
                    }
                />


                {/* =================================================
                    SUMMARY
                    ================================================= */}

                <div className="
                    mt-6
                ">

                    <AuditSummary
                        steps={
                            auditSteps
                        }
                    />

                </div>


                {/* =================================================
                    STEP RESULTS
                    ================================================= */}

                <div className="
                    mt-6
                ">

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


// =============================================================
// PAGE HEADER
// =============================================================

const PageHeader = ({
    title,
    description,
}) => {

    return (

        <div className="
            mb-8
        ">

            <div className="
                flex
                items-center
                gap-3
            ">

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

                    <ShieldCheck
                        className="
                            h-5
                            w-5
                            text-indigo-400
                        "
                    />

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
};


// =============================================================
// METADATA
// =============================================================

const AuditMetadata = ({
    configuration,
    metadata,
}) => {

    return (

        <div className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
        ">

            {/* =================================================
                URL
                ================================================= */}

            <div className="
                rounded-xl
                border
                border-slate-800
                bg-slate-900/70
                px-4
                py-4
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


            {/* =================================================
                AUTH
                ================================================= */}

            <div className="
                rounded-xl
                border
                border-slate-800
                bg-slate-900/70
                px-4
                py-4
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
                    {configuration?.username
                        ? "Required"
                        : "Not Required"}
                </p>

            </div>

        </div>
    );
};


export default ConsentAutoAudit;