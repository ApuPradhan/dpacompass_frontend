import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Loader from "../utilities/Loader";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import ChecklistItem from "./ChecklistItem"; // ✅ NEW

export default function ViewOngoingAudit() {

    const { id } = useParams(); // application_id
    const [searchParams] = useSearchParams();
    const auditId = searchParams.get("auditId");
    // console.log("Id, auditid", id,auditId);
    
    const [checklist, setChecklist] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    // ---------------- FETCH CHECKLIST ----------------
    useEffect(() => {
        const fetchChecklist = async () => {
            try {
                const res = await fetchWithAuth(`/api/checklists/application/${id}/`);
                const data = await res.json();
                setChecklist(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChecklist();
    }, [id]);

    // ---------------- FETCH APPLICATION ----------------
    useEffect(() => {
        if (!checklist?.application?.id) return;

        const fetchApplication = async () => {
            try {
                const res = await fetchWithAuth(
                    `/api/applications/applications/${checklist.application.id}/`
                );
                const data = await res.json();

                if (data?.data) {
                    setApplication(data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchApplication();
    }, [checklist]);

    if (loading) return <Loader text="Loading..." />;

    return (
        <div className="p-6 text-white bg-[#0b1120] min-h-screen">

            {/* APPLICATION DETAILS */}
            <div className="mb-6 border border-gray-700 rounded-lg p-4 bg-[#020617]">
                <h2 className="text-lg text-indigo-300 mb-3">
                    Application Details
                </h2>

                <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>
                        <p className="text-gray-400">Name</p>
                        <p>{application?.name}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Environment</p>
                        <p>{application?.environment}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Department</p>
                        <p>{application?.department}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Version</p>
                        <p>{application?.version}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-gray-400">URL</p>
                        <p className="text-indigo-400 break-all">
                            {application?.url}
                        </p>
                    </div>

                </div>
            </div>

            <h2 className="text-xl mb-4 text-indigo-300">
                Ongoing Audit
            </h2>

            {/* DOMAINS */}
            {checklist?.domains?.map((domain, dIdx) => (
                <div key={dIdx} className="mb-6 border border-gray-700 rounded-lg p-4">

                    <h3 className="text-indigo-400 font-semibold mb-3">
                        {dIdx + 1}. {domain.domain_name}
                    </h3>

                    {/* CHECKLISTS */}
                    {domain.checklists?.map((chk, cIdx) => (

                        <div key={chk.id} className="space-y-3">

                            <p className="text-sm text-gray-400 mb-2">
                                {dIdx + 1}.{cIdx + 1} {chk.clause}
                            </p>

                            {/* 🔥 EVIDENCE → CHECKLIST ITEMS */}
                            {chk.evidence?.map((ev, eIdx) => (
                                <ChecklistItem
                                    key={ev.mapping_id}
                                    item={ev} // ✅ PASS FULL EVIDENCE
                                    index={eIdx}
                                    url={application?.url} // ✅ IMPORTANT
                                    auditId={auditId} // ✅ IMPORTANT
                                />
                            ))}

                        </div>

                    ))}

                </div>
            ))}

        </div>
    );
}