import {
    FiFileText,
    FiLayers,
    FiBarChart2,
    FiBookOpen
} from "react-icons/fi";

export const sidebarConfig = {
    admin: [

        {
            label: "View/Approve Pending Applications",
            icon: FiFileText,
            path: "/admin/pendingaudits",
        },
        {
            label: "Assign Audit to Auditor",
            icon: FiLayers,
            path: "/admin/assignaudits",
        },
        {
            label: "Re-assign Declined Applications",
            icon: FiLayers,
            path: "/admin/audits/resassign/",
        },
        {
            label: "View Rejected Applications",
            icon: FiLayers,
            path: "/admin/rejectedaudits",
        },
        {
            label: "View Assigned/In-Progress Audits",
            icon: FiBarChart2,
            path: "/admin/ongoingaudits",
        },
        {
            label: "Manage Users",
            icon: FiBarChart2,
            path: "/admin/verify/users",
        },
        // 🔥 GROUP ITEM
        {
            label: "Checklist & Domain",
            icon: FiLayers,
            children: [
                { label: "Create Domain", path: "/domain/create" },
                { label: "View Domains", path: "/domain/view" },
                { label: "Create Evidence", path: "/evidence/create" },
                { label: "View Evidence", path: "/evidence/view/all" },
                { label: "Create Checklist", path: "/admin/createChecklist" },
                { label: "Manage Checklists", path: "/admin/viewChecklist" },
                { label: "Bulk Checklist Upload", path: "/admin/checklist/bulkupload/" },
            ],
        },

        // {
        //     label: "Generate Report",
        //     icon: FiBarChart2,
        // },
        // {
        //     label: "Learn DPDP",
        //     icon: FiBookOpen,
        // }
    ],

    auditor: [
        {
            label: "New Pending Audits",
            icon: FiFileText,
            path: '/auditor/pendingAudits',
        },
        {
            label: "Accepted Audits",
            icon: FiFileText,
            path: "/auditor/acceptedAudits",
        },
        {
            label: "Rejected Audits",
            icon: FiFileText,
            path: "/auditor/declinedAudits",
        },
        {
            label: "Data Breach Scanner",  // Ongoing Audits
            icon: FiLayers,
            path: "/auditor/databreachscanner",
        },
        {
            label: "Complete Audit and Generate Report",
            icon: FiBarChart2,
             path: "/auditor/completedaudits",
        },
        // {
        //     label: "Consent Scanner v2",
        //     icon: FiBarChart2,
        //     path: "/admin/consentv2/demo",
        // },
        {
            label: "Consent Scanner",
            icon: FiBarChart2,
            path: "/auditor/consentscanner/"
        },
         {
            label: "Learn DPDP",
            icon: FiLayers,
            path: "/learndpdp",
        },
    ],

    auditee: [
        {
            label: "Register for Audit",
            icon: FiFileText,
            path: "/user/register",
        },
        {
            label: "My Approved Applications",
            icon: FiLayers,
            path: "/user/approvedaudits",
        },
        {
            label: "On-progress applications",
            icon: FiLayers,
            path: "/user/approvedaudits",
        },
        {
            label: "Rejected Applications",
            icon: FiLayers,
            path: "/user/rejectedaudits",
        },
        {
            label: "Learn DPDP",
            icon: FiLayers,
            path: "/learndpdp",
        },
        {
            label: "Audit Reports",
            icon: FiBarChart2,
            // no path → handled later or keep placeholder
        },
        // {
        //     label: "Apply for Remediation",
        //     icon: FiBookOpen,
        //     path: "/remediation/signin",
        // }
    ]
};