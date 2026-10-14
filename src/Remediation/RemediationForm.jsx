import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiUpload,
  FiFileText,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-toastify";

const RemediationForm = () => {
  const [step, setStep] = useState(1);
  const [auditSource, setAuditSource] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [files, setFiles] = useState([]);
  const [paymentDone, setPaymentDone] = useState(false);

  // Sample data
  const applications = [
    { id: 1, name: "Payment API", version: "v1.2" },
    { id: 2, name: "User Service", version: "v2.0" },
  ];

  const checklist = [
    { id: 1, rule: "Encrypt PII Data" },
    { id: 2, rule: "Consent Logging" },
  ];

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const pdfOnly = selected.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfOnly.length !== selected.length) {
      toast.error("Only PDF files allowed");
    }

    setFiles(pdfOnly);
  };

  const handleSubmit = () => {
    toast.success("Remediation Registered Successfully");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1d2d50] to-[#1e293b] flex items-center justify-center px-4">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0f172a]/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-lg"
      >

        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Remediation Request
        </h1>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-center">
              Select where your audit was conducted
            </p>

            <button
              onClick={() => {
                setAuditSource("dpacompass");
                setStep(2);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <span>DPACOMPASS Platform</span>
              <FiArrowRight />
            </button>

            <button
              onClick={() => {
                setAuditSource("external");
                setStep(2);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
            >
              <span>Other Platforms</span>
              <FiArrowRight />
            </button>
          </div>
        )}

        {/* STEP 2 - DPACOMPASS */}
        {step === 2 && auditSource === "dpacompass" && (
          <div>
            <h2 className="text-white mb-3">Select Application</h2>

            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedApp(app);
                  setStep(3);
                }}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg mb-2 cursor-pointer transition"
              >
                <p className="text-white">{app.name}</p>
                <p className="text-gray-400 text-sm">{app.version}</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 - Checklist */}
        {step === 3 && auditSource === "dpacompass" && (
          <div>
            <h2 className="text-white mb-3">Non-Compliant Checklist</h2>

            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border-b border-gray-700"
              >
                <span className="text-white">{item.rule}</span>
                <span className="text-red-400 text-sm">Failed</span>
              </div>
            ))}

            <button
              onClick={() => setStep(4)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg"
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {/* STEP 2 - EXTERNAL */}
        {step === 2 && auditSource === "external" && (
          <div>
            <h2 className="text-white mb-3">Upload Audit Report</h2>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-indigo-500 transition">
              <FiUpload size={24} className="text-indigo-400 mb-2" />
              <span className="text-gray-400 text-sm">
                Click to upload PDF files
              </span>

              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="mt-3 space-y-1">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300">
                  <FiFileText />
                  <span className="text-sm">{file.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (files.length === 0) {
                  toast.error("Upload at least one PDF");
                  return;
                }
                setStep(4);
              }}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg"
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {/* STEP 4 - PAYMENT */}
        {step === 4 && (
          <div className="text-center">
            <h2 className="text-white mb-4">Payment</h2>

            <p className="text-gray-400 mb-4">Remediation Fee: ₹999</p>

            <button
              onClick={() => {
                setTimeout(() => {
                  setPaymentDone(true);
                  setStep(5);
                }, 1000);
              }}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* STEP 5 - SUCCESS */}
        {step === 5 && paymentDone && (
          <div className="text-center">
            <FiCheckCircle size={40} className="text-green-400 mx-auto mb-3" />

            <h2 className="text-green-400 text-xl mb-3">
              Payment Successful
            </h2>

            <button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
            >
              Submit Remediation Request
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RemediationForm;