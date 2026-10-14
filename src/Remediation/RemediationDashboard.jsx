import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlusCircle } from "react-icons/fi";
import { useState } from "react";
import Loader from "../utilities/Loader";
const RemediationDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadText, setLoadText] = useState("Loading...");

  const handleClick = (path, message) => {
    setLoadText(message);
    setLoading(true);

    setTimeout(() => {
      navigate(path);
    }, 1000);
  };

  if (loading) {
    return (
      <Loader
        text={loadText}
        delay={4}
        fullScreen
      />
    );
  }
  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-6">

      <h1 className="text-2xl font-semibold mb-6">
        Remediation Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* My Applications */}
        <div
          onClick={() =>
            handleClick("/remediation/applications", "Fetching your applications ...")
          }
          className="cursor-pointer border border-gray-700 rounded-lg p-6 bg-[#1e293b] hover:border-indigo-500 transition"
        >
          <FiFileText size={28} className="mb-3 text-indigo-400" />
          <h2 className="text-lg font-medium">
            My Remediation Applications
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            View status of submitted applications
          </p>
        </div>

        {/* New Application */}
        <div
          onClick={() => navigate("/remediation/new")}
          className="cursor-pointer border border-gray-700 rounded-lg p-6 bg-[#1e293b] hover:border-indigo-500 transition"
        >
          <FiPlusCircle size={28} className="mb-3 text-purple-400" />
          <h2 className="text-lg font-medium">
            Submit New Application
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Apply for remediation services
          </p>
        </div>

      </div>
    </div>
  );
};

export default RemediationDashboard;