import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import AuditStepDetails from "./AuditStepDetails";
import StatusBadge from "./StatusBadge";

const normalizeStepId = (step) =>
    String(step?.step_id || step?.step || "").trim().toUpperCase();

const normalizeComplianceStatus = (status) =>
    String(status || "").trim().toUpperCase();

const getStepNumber = (stepId, index) => {
    const match = String(stepId || "").match(/STEP-(\\d+)/i);
    return match ? match[1] : String(index + 1).padStart(2, "0");
};

const getStepTitle = (step, stepNumber) =>
    step?.title ||
    step?.name ||
    `Audit Step ${stepNumber}`;

const AuditStepList = ({ steps = [] }) => {
    const [openSteps, setOpenSteps] = useState([]);

    /*
     * Reset the initially-open step whenever a new result set arrives.
     * This is safer than initializing state from props only once.
     */
    useEffect(() => {
        const firstStepId = normalizeStepId(steps[0]);

        setOpenSteps(firstStepId ? [firstStepId] : []);
    }, [steps]);

    const toggleStep = (stepId) => {
        if (!stepId) {
            return;
        }

        setOpenSteps((current) =>
            current.includes(stepId)
                ? current.filter((id) => id !== stepId)
                : [...current, stepId]
        );
    };

    if (!Array.isArray(steps) || steps.length === 0) {
        return (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center">
                <p className="text-sm font-medium text-slate-400">
                    No audit steps available
                </p>

                <p className="mt-1 text-xs text-slate-600">
                    No completed audit step results were returned.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {steps.map((step, index) => {
                const stepId =
                    normalizeStepId(step) || `AUDIT-STEP-${index + 1}`;

                const isOpen = openSteps.includes(stepId);
                const stepNumber = getStepNumber(stepId, index);
                const title = getStepTitle(step, stepNumber);

                /*
                 * At this point the parent has already normalized the API
                 * response:
                 *
                 * step.status          -> compliance result (PASS/FAIL/REVIEW)
                 * step.execution_status -> crawler execution status
                 *
                 * Therefore StatusBadge must receive step.status here.
                 */
                const complianceStatus =
                    normalizeComplianceStatus(step?.status);

                return (
                    <div
                        key={stepId}
                        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
                    >
                        {/* STEP HEADER */}
                        <button
                            type="button"
                            onClick={() => toggleStep(stepId)}
                            aria-expanded={isOpen}
                            aria-controls={`${stepId}-details`}
                            className="
                                flex
                                w-full
                                items-center
                                gap-4
                                px-5
                                py-5
                                text-left
                                transition
                                hover:bg-slate-800/30
                                focus:outline-none
                                focus:ring-1
                                focus:ring-inset
                                focus:ring-indigo-500/40
                            "
                        >
                            {/* Step Number */}
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-indigo-500/20
                                    bg-indigo-500/10
                                    text-xs
                                    font-semibold
                                    text-indigo-300
                                "
                            >
                                {stepNumber}
                            </div>

                            {/* Title */}
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                                    {stepId}
                                </p>

                                <h3 className="mt-1 text-sm font-semibold text-slate-100">
                                    {title}
                                </h3>
                            </div>

                            {/* Compliance Status */}
                            <div className="shrink-0">
                                <StatusBadge status={complianceStatus} />
                            </div>

                            {/* Chevron */}
                            <ChevronDown
                                className={`
                                    h-4
                                    w-4
                                    shrink-0
                                    text-slate-600
                                    transition-transform
                                    duration-200
                                    ${isOpen ? "rotate-180" : ""}
                                `}
                            />
                        </button>

                        {/* STEP CONTENT */}
                        {isOpen && (
                            <div
                                id={`${stepId}-details`}
                                className="border-t border-slate-800 p-5"
                            >
                                <AuditStepDetails step={step} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AuditStepList;