import React from "react";

import Step01View from "./steps/Step01View";
import Step02View from "./steps/Step02View";
import Step04View from "./steps/Step04View";
import Step05View from "./steps/Step05View";
import Step07View from "./steps/Step07View";
import Step11View from "./steps/Step11View";
import Step13View from "./steps/Step13view";

/* =========================================================
   FALLBACK RESULT VIEW
========================================================= */

const UnsupportedStepView = ({ data }) => {
    const stepId =
        data?.step_id ||
        data?.step ||
        "this step";

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-5">
            <p className="text-sm font-medium text-slate-300">
                {data?.title || "Audit step result"}
            </p>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                No dedicated result renderer is available for{" "}
                {stepId}.
            </p>
        </div>
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AuditStepDetails = ({ step }) => {
    if (!step) {
        return null;
    }

    /*
     * Support both the normalized API shape and the older `step`
     * property used by some existing result objects.
     */
    const stepId = String(
        step.step_id || step.step || ""
    )
        .trim()
        .toUpperCase();

    switch (stepId) {
        case "STEP-01":
            return <Step01View data={step} />;

        case "STEP-02":
            return <Step02View data={step} />;

        case "STEP-04":
            return <Step04View data={step} />;

        case "STEP-05":
            return <Step05View data={step} />;

        case "STEP-07":
            return <Step07View data={step} />;

        case "STEP-11":
            return <Step11View data={step} />;

        case "STEP-13":
            return <Step13View data={step} />;
    }
};

export default AuditStepDetails;
