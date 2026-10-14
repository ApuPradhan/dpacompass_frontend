import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white px-4">

      <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 text-center shadow-lg">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-yellow-400 mb-3">
          Approval Pending
        </h1>

        {/* Message */}
        <p className="text-gray-300 text-sm leading-relaxed">
          Your account approval is pending at the administration end.  
          You will be notified once your account is verified and activated.  
          Please try logging in again later.
        </p>

        {/* Divider */}
        <div className="my-5 border-t border-gray-700"></div>

        {/* Action */}
        <button
          onClick={() => navigate("/signin")}
          className="w-full py-2.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:scale-[1.02] transition-all duration-200"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}