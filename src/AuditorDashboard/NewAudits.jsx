import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Loader from "../utilities/Loader";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


const cardClass =
  "bg-[#0f172a]/80 border border-gray-700 rounded-xl backdrop-blur-lg";

export default function NewAudits() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const token = localStorage.getItem("access");

      // const res = await fetch(
      //   `${BASE_URL}/api/applications/assigned/`,
      //   {
      //     credentials: "include",
      //   }
      // );

      const res = await fetchWithAuth("/api/applications/assigned/");

      const data = await res.json();

      if (res.ok) {
        setAudits(data.data || []);
      } else {
        console.error(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (id) => {
    // remove from UI (later replace with API)
    setAudits((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white p-6">

      {/* Back */}
      <div
        className="mb-8 flex items-center gap-2 text-indigo-400 cursor-pointer hover:text-indigo-300"
        onClick={() => navigate("/auditdashboard")}
      >
        <FiArrowLeft />
        Back to Dashboard
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-indigo-300 mb-6">
        New Assigned Audits
      </h1>

      {/* Table Card */}
      <div className={`${cardClass} p-4`}>

        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Loader text="Loading audits..." />
          </div>
        ) : audits.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            No audits assigned
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">SL No</th>
                  <th className="px-4 py-3 text-left">Application</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {audits.map((audit, index) => (
                  <tr
                    key={audit.id}
                    className="border-b border-gray-800 hover:bg-[#1e293b]/40 transition"
                  >
                    <td className="px-4 py-3">{index + 1}</td>

                    <td className="px-4 py-3 font-medium">
                      {audit.name}
                    </td>

                    <td className="px-4 py-3 text-gray-300">
                      {audit.department}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                        {audit.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-3">

                      <button
                        onClick={() => setSelectedAudit(audit)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleStart(audit.id)}
                        className="px-3 py-1 text-xs rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 text-white"
                      >
                        Start
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-150 p-6 animate-fadeIn">

            <h2 className="text-lg font-semibold text-indigo-300 mb-4">
              Audit Details
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Application" value={selectedAudit.name} />
              <Detail label="Department" value={selectedAudit.department} />
              <Detail label="Environment" value={selectedAudit.environment} />
              <Detail label="Version" value={selectedAudit.version} />
              <Detail label="URL" value={selectedAudit.url} />
              <Detail
                label="Created At"
                value={new Date(selectedAudit.created_at).toLocaleString()}
              />
            </div>

            <div className="mt-4 text-sm">
              <p className="text-gray-400">Description</p>
              <p>{selectedAudit.description}</p>
            </div>

            <div className="mt-4 text-sm">
              <p className="text-gray-400">Data Categories</p>
              <p>{selectedAudit.data_categories}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* Reusable Detail */
const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-400">{label}</p>
    <p>{value || "-"}</p>
  </div>
);