import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

const EvidenceScannerMapping = () => {
  const navigate = useNavigate();

  const [evidences, setEvidences] = useState([]);
  const [scanners, setScanners] = useState([]);

  const [selectedEvidence, setSelectedEvidence] = useState("");
  const [selectedScanner, setSelectedScanner] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    fetchEvidences();
    fetchScanners();
  }, []);

  const fetchEvidences = async () => {
    try {
      const res = await fetchWithAuth("/api/checklists/evidence/");
      const data = await res.json();
      const all = data.data || [];

      // only automated evidences
      const automated = all.filter(
        (ev) => ev.collection_type === "automated"
      );

      setEvidences(automated);
    } catch {
      toast.error("Failed to fetch evidences");
    }
  };

  const fetchScanners = async () => {
    try {
      const res = await fetchWithAuth("/api/scanner/scanners/");
      const data = await res.json();
      setScanners(data.data || data || []);
    } catch {
      toast.error("Failed to fetch scanners");
    }
  };

  // ================= SUBMIT =================
  const handleMap = async () => {
    if (!selectedEvidence || !selectedScanner) {
      toast.warning("Please select both fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchWithAuth(
        "/api/checklists/evidence/scanner-map/",
        {
          method: "POST",
          body: JSON.stringify({
            evidence_id: parseInt(selectedEvidence),
            scanner_key: selectedScanner,
          }),
        }
      );

      if (res.ok) {
        toast.success("Scanner mapped successfully");
        setSelectedEvidence("");
        setSelectedScanner("");
        setTimeout(() => {
           navigate("/evidence/map/table")
        }, 2000);
      } else {
        const err = await res.json();
        toast.error(err?.message || "Mapping failed");
      }
    } catch {
      toast.error("Server error");
    }

    setLoading(false);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0b0f2a] via-[#0f172a] to-[#020617] text-white p-6">

      {/* BACK */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-indigo-400 cursor-pointer mb-6"
      >
        <FiArrowLeft />
        Back
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold mb-6 text-gray-200">
        Evidence → Scanner Mapping
      </h2>

      <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 max-w-xl mx-auto space-y-5">

        {/* EVIDENCE */}
        <div>
          <label className="text-sm text-gray-400">
            Select Evidence
          </label>

          <select
            className={inputClass}
            value={selectedEvidence}
            onChange={(e) => setSelectedEvidence(e.target.value)}
          >
            <option value="">-- Select Evidence --</option>
            {evidences.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        {/* SCANNER */}
        <div>
          <label className="text-sm text-gray-400">
            Select Scanner
          </label>

          <select
            className={inputClass}
            value={selectedScanner}
            onChange={(e) => setSelectedScanner(e.target.value)}
          >
            <option value="">-- Select Scanner --</option>
            {scanners.map((sc, idx) => (
              <option
                key={sc.key || sc.scanner_key || idx}
                value={sc.key || sc.scanner_key}
              >
                {sc.name || sc.scanner_key}
              </option>
            ))}
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-4">

          <button
            onClick={handleMap}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            {loading ? "Mapping..." : "Map Scanner"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default EvidenceScannerMapping;