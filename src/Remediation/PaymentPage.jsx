import { useState, useEffect } from "react";
import { FiCreditCard, FiSmartphone, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../utilities/Loader";

const PaymentPage = ({ amount = 999 }) => {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const navigate = useNavigate();

  // Handle payment
  const handlePayment = () => {
    if (!method) {
      toast.error("Please select a payment method");
      return;
    }

    setLoading(true);

    // simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setPaid(true);
      toast.success("Payment Successful");
    }, 1500);
  };

  // Redirect after success (3 sec)
  useEffect(() => {
    if (paid) {
      const timer = setTimeout(() => {
        navigate("/remediation/dashboard"); // ✅ final destination
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [paid, navigate]);

  // Loader state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader text="Processing Payment..." delay={0} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4">

      <div className="w-full max-w-lg bg-[#1e293b] border border-gray-700 rounded-lg p-6">

        {/* Header */}
        <h1 className="text-xl font-semibold mb-4">
          Payment Details
        </h1>

        {/* Amount */}
        <div className="mb-6 border border-gray-700 rounded p-4 bg-[#0f172a]">
          <p className="text-gray-400 text-sm">Remediation Fee</p>
          <h2 className="text-2xl font-bold text-indigo-400">
            ₹{amount}
          </h2>
        </div>

        {/* Payment Selection */}
        {!paid && (
          <>
            <p className="mb-3 text-gray-300">
              Select Payment Method *
            </p>

            <div className="space-y-3 mb-6">

              {/* UPI */}
              <div
                onClick={() => setMethod("upi")}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer ${
                  method === "upi"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiSmartphone />
                  <span>UPI (BHIM, GPay, PhonePe)</span>
                </div>
                <input type="radio" checked={method === "upi"} readOnly />
              </div>

              {/* Card */}
              <div
                onClick={() => setMethod("card")}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer ${
                  method === "card"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiCreditCard />
                  <span>Debit / Credit Card</span>
                </div>
                <input type="radio" checked={method === "card"} readOnly />
              </div>

            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded transition"
            >
              Pay Now
            </button>
          </>
        )}

        {/* Success Screen */}
        {paid && (
          <div className="text-center mt-4">
            <FiCheckCircle size={42} className="text-green-400 mx-auto mb-3" />

            <h2 className="text-green-400 text-lg font-semibold">
              Payment Successful
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Redirecting to dashboard...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentPage;