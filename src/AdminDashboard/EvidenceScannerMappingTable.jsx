import { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import { toast } from "react-toastify";

const EvidenceScannerMapping = () => {
  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        "/api/checklists/scanner-evidence-mappings/"
      );
      const data = await res.json();
      setMappings(data.data || []);
    } catch {
      toast.error("Failed to fetch mappings");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0b0f2a] via-[#0f172a] to-[#020617] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        {/* LEFT */}
        <div
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-400 cursor-pointer"
        >
          <FiArrowLeft />
          Back
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => navigate("/evidence/map")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm transition"
        >
          <FiPlus />
          Create Mapping
        </button>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">
        Evidence → Scanner Mapping
      </h2>

      {/* TABLE */}
      <div className="bg-[#0f172a] border border-gray-700 rounded-xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-3 px-6 py-3 text-sm text-gray-400 border-b border-gray-700">
          <div>#</div>
          <div className="text-center">Evidence</div>
          <div className="text-center">Scanner</div>
        </div>

        {/* BODY */}
        {loading ? (
          <div className="p-6 text-center text-gray-400">
            Loading...
          </div>
        ) : mappings.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No mappings found
          </div>
        ) : (
          mappings.map((map, index) => (
            <div
              key={index}
              className="grid grid-cols-3 px-6 py-3 text-sm border-b border-gray-800 hover:bg-[#1e293b] transition"
            >
              {/* INDEX */}
              <div className="text-gray-400 flex items-center">
                {index + 1}
              </div>

              {/* EVIDENCE */}
              <div className="text-white text-center font-medium">
                {map.evidence_name}
              </div>

              {/* SCANNER */}
              <div className="text-indigo-300 text-center">
                {map.scanner_name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvidenceScannerMapping;