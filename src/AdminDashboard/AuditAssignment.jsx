import { useEffect, useState } from "react";
import AuditTable from "./AuditTable";
// import AuditViewModal from "./AuditViewModal";
// import AssignAuditorModal from "./AssignAuditorModal";
import RejectModal from "./RejectModal";
import { cardClass } from "../theme";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditAssignmentModal from "./AuditAssignmentModal";


export default function AuditAssignment() {

    const navigate = useNavigate();
    const [userMap, setUserMap] = useState({});
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const removeAudit = (id) => {
        setAudits((prev) => prev.filter((a) => a.id !== id));
    };
    const fetchAudits = async () => {
        try {
            const token = localStorage.getItem("access");

            // const response = await fetch(`${BASE_URL}/api/applications/applications/approved`, {
            //     method: "GET",
            //     credentials: "include",
            // });
            const response = await fetch(`${BASE_URL}/api/applications/applications/approved`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log(data);
            
            if (response.ok) {
                setAudits(data);
            } else {
                console.error(data);
                setError("Failed to fetch applications");
            }

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setTimeout(() => {
                setLoading(false);

            }, 1000);
        }
    };
    const fetchUserById = async (userId) => {
        try {
            const token = localStorage.getItem("access");

            // const res = await fetch(
            //     `${BASE_URL}/api/auth/admin/user/${userId}/`,
            //     {
            //         credentials: "include",
            //     }
            // );

            const res = await fetch(
                `${BASE_URL}/api/auth/admin/user/${userId}/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();

            if (res.ok) {
                return data.data;
            }
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        console.log("Entered Audit Assignment");
        
        fetchAudits();
    }, []);
    useEffect(() => {
        fetchAudits();
    }, [successMsg]);
    useEffect(() => {
        if (audits.length === 0) return;

        const fetchOwners = async () => {
            try {
                const uniqueOwnerIds = [...new Set(audits.map(a => a.owner))];

                const results = await Promise.all(
                    uniqueOwnerIds.map(id => fetchUserById(id))
                );

                const newUserMap = {};

                results.forEach((user) => {
                    if (user) {
                        newUserMap[user.id] = user.name;
                    }
                });

                setUserMap(newUserMap);

            } catch (err) {
                console.error(err);
            }
        };

        fetchOwners();
    }, [audits]);

    const formattedAudits = audits.map((a) => ({
        id: a.id,
        name: a.name,
        owner: userMap[a.owner],
        department: a.department,
        environment: a.environment,
        url: a.url,
        type: a.type,
        version: a.version,
        data_categories: a.data_categories,
        description: a.description,
        created_at: a.created_at,
        status: a.status,
        application_id : a.id
    }));
    console.log("formatted audits",formattedAudits);
    
    return (
        <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
            <div className="mb-10 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer hover:text-indigo-300"
                onClick={() => navigate("/admindashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>
            <h1 className="text-2xl font-semibold text-indigo-300 mb-6">
                New Audit Applications
            </h1>
            {successMsg && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
                    {successMsg}
                </div>
            )}
            <div className={`${cardClass} p-4`}>
                {loading ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <Loader text="Loading applications..." />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : formattedAudits.length == 0 ? (
                    <div>
                        No records to show
                    </div>
                ) : (
                    <AuditTable
                        audits={formattedAudits}
                        onView={setSelectedAudit}
                        userMap={userMap}
                    />
                )}
            </div>

            {/* View Modal */}
            <AuditAssignmentModal
                mode="view"
                audit={selectedAudit}
                isOpen={!!selectedAudit}
                onClose={() => setSelectedAudit(null)}
                onAssign={(audit) => {
                    setSelectedAudit(null);
                    setAssignModal(audit);
                }}
            />


            {/* Assign Modal */}
            <AuditAssignmentModal
                mode="assign"
                audit={assignModal}
                isOpen={!!assignModal}
                onClose={() => setAssignModal(null)}
                onSuccess={() => {
                    fetchAudits();
                    setAssignModal(null);
                    setSuccessMsg("Auditor assigned successfully");
                    setTimeout(() => setSuccessMsg(""), 1500);
                }}
            />

        </div>
    );
}