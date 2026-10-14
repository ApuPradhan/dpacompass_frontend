import { useState, useEffect } from "react";
import DPACOMPASSForm from "./DPACOMPASSForm";
import ExternalForm from "./ExternalForm";
import { useLocation } from "react-router-dom";

const NewRemediation = () => {
  const location = useLocation(); // ✅ inside component
  const paymentSuccess = location.state?.paymentSuccess;

  const [type, setType] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (paymentSuccess) {
      setIsPaid(true);
    }
  }, [paymentSuccess]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-6">

      <h1 className="text-xl font-semibold mb-6">
        New Remediation Application
      </h1>

      {/* Success Banner */}
      {isPaid && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 px-3 py-2 rounded mb-4">
          Payment completed successfully. You can now submit your request.
        </div>
      )}

      {/* Select Type */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-300">
          Select Application Type *
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 bg-[#1e293b] border border-gray-600 rounded"
        >
          <option value="">-- Select --</option>
          <option value="dpacompass">DPACOMPASS Audited</option>
          <option value="external">Externally Audited</option>
        </select>
      </div>

      {/* Pass isPaid */}
      {type === "dpacompass" && <DPACOMPASSForm isPaid={isPaid} />}
      {type === "external" && <ExternalForm isPaid={isPaid} />}

    </div>
  );
};

export default NewRemediation;