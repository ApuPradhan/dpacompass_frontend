// dashboard_/transformers/dashboardTransformer.js

import {
    FiClipboard,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiActivity,
    FiPlay,
} from "react-icons/fi";


// =====================================================
// ADMIN CARDS
// =====================================================

const ADMIN_CARD_DEFINITIONS = [

    {
        id: "applications",
        title: "Applications",
        field: "total_applications",
        subtitle: "Across the platform",
        icon: FiClipboard,
        color: "indigo",
    },

    {
        id: "audits",
        title: "Audits",
        field: "total_audits",
        subtitle: "Total audits",
        icon: FiClipboard,
        color: "purple",
    },

    {
        id: "review",
        title: "Under Review",
        field: "under_review_applications",
        subtitle: "Needs Attention",
        icon: FiClock,
        color: "amber",
    },

    {
        id: "ongoing",
        title: "Ongoing Reviews",
        field: "ongoing_review_audits",
        subtitle: "Currently Active",
        icon: FiActivity,
        color: "orange",
    },

    {
        id: "completed",
        title: "Completed Reviews",
        field: "review_completed_audits",
        subtitle: "Successfully Finished",
        icon: FiCheckCircle,
        color: "green",
    },

];


// =====================================================
// AUDITOR CARDS
// =====================================================

const AUDITOR_CARD_DEFINITIONS = [

    {
        id: "total_applications",
        title: "Applications",
        field: "total_applications",
        subtitle: "Total applications",
        icon: FiClipboard,
        color: "indigo",
    },

    {
        id: "pending_applications",
        title: "Pending Applications",
        field: "pending_applications",
        subtitle: "Awaiting action",
        icon: FiClock,
        color: "amber",
    },

    {
        id: "approved_applications",
        title: "Approved Applications",
        field: "approved_applications",
        subtitle: "Approved applications",
        icon: FiCheckCircle,
        color: "green",
    },

    {
        id: "assigned_applications",
        title: "Assigned Applications",
        field: "assigned_applications",
        subtitle: "Assigned to auditor",
        icon: FiClipboard,
        color: "purple",
    },

    {
        id: "rejected_applications",
        title: "Rejected Applications",
        field: "rejected_applications",
        subtitle: "Rejected applications",
        icon: FiAlertTriangle,
        color: "red",
    },

    {
        id: "resubmitted_applications",
        title: "Resubmitted Applications",
        field: "resubmitted_applications",
        subtitle: "Resubmitted applications",
        icon: FiActivity,
        color: "orange",
    },

    {
        id: "in_progress_applications",
        title: "In Progress",
        field: "in_progress_applications",
        subtitle: "Currently in progress",
        icon: FiPlay,
        color: "cyan",
    },

    {
        id: "audit_completed_applications",
        title: "Audit Completed",
        field: "audit_completed_applications",
        subtitle: "Audits completed",
        icon: FiCheckCircle,
        color: "green",
    },

];


// =====================================================
// AUDITEE CARDS
// =====================================================

const AUDITEE_CARD_DEFINITIONS = [

    {
        id: "total_applications",
        title: "Total Applications",
        field: "total_applications",
        subtitle: "Total applications",
        icon: FiClipboard,
        color: "indigo",
    },

    {
        id: "in_progress_applications",
        title: "In Progress",
        field: "in_progress_applications",
        subtitle: "Currently in progress",
        icon: FiClock,
        color: "cyan",
    },

    {
        id: "completed_applications",
        title: "Completed",
        field: "ongoing_review_applications",
        subtitle: "Completed applications",
        icon: FiCheckCircle,
        color: "green",
    },

];

// =====================================================
// CREATE STAT CARDS
// =====================================================

function createStatCards(
    definitions,
    data
) {

    return definitions.map(
        card => ({

            ...card,

            type: "stat_card",

            value:
                data[card.field] ?? 0,

            cols: 4,

        })
    );

}


// =====================================================
// ADMIN PIPELINE
// =====================================================

function createAdminPipeline(data) {

    return {

        id: "audit_pipeline",

        type: "pipeline",

        cols: 8,

        title: "Audit Workflow",

        stages: [

            {
                id: "assigned",
                title: "Assigned",
                value:
                    data.assigned_audits ?? 0,
            },

            {
                id: "in_progress",
                title: "In Progress",
                value:
                    data.in_progress_audits ?? 0,
            },

            {
                id: "audit_completed",
                title: "Audit Completed",
                value:
                    data.audit_completed_audits ?? 0,
            },

            {
                id: "under_review",
                title: "Under Review",
                value:
                    data.under_review_audits ?? 0,
            },

            {
                id: "ongoing_review",
                title: "Ongoing Review",
                value:
                    data.ongoing_review_audits ?? 0,
            },

            {
                id: "review_completed",
                title: "Review Completed",
                value:
                    data.review_completed_audits ?? 0,
            },

        ],

    };

}


// =====================================================
// MAIN TRANSFORMER
// =====================================================

export function transformDashboard(
    raw = {},
    role = "admin"
) {

    console.log(
        "transformDashboard RAW:",
        raw
    );

    console.log(
        "transformDashboard ROLE:",
        role
    );


    /*
     * Your backend response is:
     *
     * {
     *   type: "dashboard_connected",
     *   role: "auditor",
     *   summary: {...}
     * }
     */

    const data =
        raw?.summary ?? raw;


    console.log(
        "transformDashboard SUMMARY:",
        data
    );


    // =================================================
    // AUDITOR
    // =================================================

    if (role === "auditor") {

        const statCards =
            createStatCards(
                AUDITOR_CARD_DEFINITIONS,
                data
            );


        /*
         * Auditor gets ONLY stat cards.
         *
         * No:
         * - Audit Workflow
         * - Charts
         * - Recent Activity
         * - Notifications
         */

        return {

            widgets: statCards,

        };

    }
    // =================================================
    // AUDITEE
    // =================================================

    if (role === "auditee") {

        const statCards =
            createStatCards(
                AUDITEE_CARD_DEFINITIONS,
                data
            );

        /*
         * Auditee gets ONLY stat cards.
         *
         * No:
         * - Audit Workflow
         * - Charts
         * - Recent Activity
         * - Notifications
         */

        return {

            widgets: statCards,

        };

    }


    // =================================================
    // ADMIN
    // =================================================

    const statCards =
        createStatCards(
            ADMIN_CARD_DEFINITIONS,
            data
        );


    const pipelineWidget =
        createAdminPipeline(data);


    const activityWidget = {

        id: "recent_activity",

        type: "activity",

        cols: 4,

        title: "Recent Activity",

        items: [],

    };


    return {

        widgets: [

            ...statCards,

            pipelineWidget,

            activityWidget,

        ],

    };

}