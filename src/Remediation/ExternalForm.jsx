import { useState } from "react";
import { FiUpload, FiFileText, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmPaymentModal from "./ConfirmPaymentModal";

const ExternalForm = ({ isPaid }) => {
  const [files, setFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // Handle file upload
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    const pdfFiles = selected.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length !== selected.length) {
      toast.error("Only PDF files are allowed");
    }

    setFiles((prev) => [...prev, ...pdfFiles]);
  };

  // Remove file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit after payment
  const handleSubmit = () => {
    toast.success("Remediation Request Submitted");
  };

  return (
    <div className="space-y-5">

      {/* Upload Section */}
      <div>
        <label className="block text-gray-300 mb-2">
          Upload Audit Report (PDF) *
        </label>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-indigo-500 transition bg-[#1e293b]">

          <FiUpload size={26} className="text-indigo-400 mb-2" />

          <p className="text-gray-300 text-sm">
            Click to upload or drag & drop
          </p>

          <p className="text-gray-500 text-xs">
            Only PDF files allowed
          </p>

          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Uploaded Files:</p>

          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#1e293b] border border-gray-700 rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <FiFileText className="text-purple-400" />
                <span className="text-sm text-gray-300">
                  {file.name}
                </span>
              </div>

              <button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-500"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {!isPaid ? (
        <button
          onClick={() => {
            if (files.length === 0) {
              toast.error("Please upload at least one PDF");
              return;
            }
            setShowModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
        >
          Proceed to Payment
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          Submit Request
        </button>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmPaymentModal
          onConfirm={() => navigate("/remediation/payment")}
          onCancel={() => setShowModal(false)}
        />
      )}

    </div>
  );
};

export default ExternalForm;