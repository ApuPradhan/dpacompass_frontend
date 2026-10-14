import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmPaymentModal from "./ConfirmPaymentModal";
import { toast } from "react-toastify";

const DPACOMPASSForm = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    toast.success("Remediation Request Submitted");
  };

  return (
    <div className="space-y-4">

      {/* Existing fields */}

      <div>
        <label className="block text-gray-300 mb-1">
          Select Application *
        </label>
        <select className="w-full px-3 py-2 bg-[#1e293b] border border-gray-600 rounded">
          <option>Payment API (v1.2)</option>
        </select>
      </div>

      {/* Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 px-4 py-2 rounded"
      >
        Proceed to Payment
      </button>

      {/* Modal */}
      {showModal && (
        <ConfirmPaymentModal
          onConfirm={() => navigate("/remediation/payment")}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DPACOMPASSForm;