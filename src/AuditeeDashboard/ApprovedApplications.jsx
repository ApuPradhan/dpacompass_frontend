import { useEffect, useState } from "react";
import { cardClass } from "../theme";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Loader from "../utilities/Loader";
import RejectedAuditViewModal from "./RejectedAuditViewModal";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function ApprovedApplications() {

    const navigate = useNavigate();

    const [selectedAudit, setSelectedAudit] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Fetch Approved Applications
    const fetchAudits = async () => {
        try {
            const token = localStorage.getItem("access");

            // const response = await fetch(
            //     `${BASE_URL}/api/applications/applications/approved`,
            //     {
            //         method: "GET",
            //         credentials: "include",
            //     }
            // );
             const response = await fetchWithAuth(
                `/api/applications/applications/approved`,
                { method: "GET" }
            );
            // const response = await fetch(`${BASE_URL}/api/applications/applications/approved`, {
            //     method: "GET",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization: `Bearer ${token}`,
            //     },
            // });


            const data = await response.json();

            if (response.ok) {
                setAudits(data);
            } else {
                setError("Failed to fetch applications");
            }

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudits();
    }, []);

    // Format Data
    const formattedAudits = audits.map((a) => ({
        id: a.id,
        name: a.name,
        department: a.department,
        environment: a.environment,
        version: a.version,
        created_at: a.created_at,
        status: a.status,
    }));

    //  Dynamic Columns
    const columns = [
        {
            key: "name",
            label: "Application Name",
        },
        {
            key: "department",
            label: "Department",
        },
        {
            key: "environment",
            label: "Environment",
        },
        {
            key: "version",
            label: "Version",
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border
                    ${value === "approved"
                            ? "text-green-400 bg-green-500/20 border-green-500/30"
                            : value === "rejected"
                                ? "text-red-400 bg-red-500/20 border-red-500/30"
                                : "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                        }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            render: (value) =>
                new Date(value).toLocaleDateString(),
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white p-6">

            {/* Back */}
            <div
                className="mb-10 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer hover:text-indigo-300"
                onClick={() => navigate("/devdashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-semibold text-indigo-300 mb-6">
                Approved Applications
            </h1>

            {/* Table */}
            <div className={`${cardClass} p-4`}>

                {loading ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <Loader text="Loading applications..." />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : formattedAudits.length === 0 ? (
                    <div>No records to show</div>
                ) : (
                    <DynamicAuditTable
                        audits={formattedAudits}
                        columns={columns}
                        onView={setSelectedAudit}
                    />
                )}

            </div>

            {/* View Modal */}
            <RejectedAuditViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />

        </div>
    );
}